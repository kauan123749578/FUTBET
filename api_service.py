import requests
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from config import BRASILIA_TZ, LEAGUES
from odds_calculator import get_or_generate_odds

DIAS_SEMANA = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"]

class FootballAPIService:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }
        self.base_url = "https://site.api.espn.com/apis/site/v2/sports/soccer"

    def _parse_match(self, event: Dict[str, Any], league_info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            competitions = event.get("competitions", [])
            if not competitions:
                return None
            comp = competitions[0]
            
            # Times e placar
            competitors = comp.get("competitors", [])
            if len(competitors) < 2:
                return None
            
            home_team = None
            away_team = None
            home_score = None
            away_score = None
            
            for c in competitors:
                team_name = c.get("team", {}).get("displayName", "Time Desconhecido")
                score = c.get("score")
                if c.get("homeAway") == "home":
                    home_team = team_name
                    home_score = int(score) if score is not None and score != "" else None
                else:
                    away_team = team_name
                    away_score = int(score) if score is not None and score != "" else None

            # Data e Horário em Horário de Brasília
            date_raw = event.get("date")
            dt_utc = datetime.fromisoformat(date_raw.replace("Z", "+00:00"))
            dt_brt = dt_utc.astimezone(BRASILIA_TZ)
            
            now_brt = datetime.now(BRASILIA_TZ)
            is_today = dt_brt.date() == now_brt.date()
            dia_semana = DIAS_SEMANA[dt_brt.weekday()]

            # Status da partida
            status_obj = comp.get("status", {}).get("type", {})
            status_desc = status_obj.get("description", "Agendado")
            status_state = status_obj.get("state", "pre")  # pre, in, post
            detail = status_obj.get("shortDetail", status_desc)
            
            if status_state == "in":
                status_formatted = f"🔴 AO VIVO ({detail})"
                status_type = "live"
            elif status_state == "post":
                status_formatted = f"🏁 Finalizado ({home_score} x {away_score})"
                status_type = "finished"
            else:
                status_formatted = "⏳ Agendado"
                status_type = "scheduled"

            # Estádio e Transmissão
            venue = comp.get("venue", {}).get("fullName", "A definir")
            broadcasts = comp.get("broadcasts", [])
            channels = []
            for b in broadcasts:
                channels.extend(b.get("names", []))
            broadcast_str = ", ".join(channels) if channels else "Consulte seu app"

            # Odds no estilo Bet
            odds = get_or_generate_odds(comp, home_team or "Mandante", away_team or "Visitante")

            return {
                "id": event.get("id"),
                "league_id": league_info["id"],
                "league_name": league_info["name"],
                "league_badge": league_info["badge"],
                "datetime_brt": dt_brt,
                "date_display": dt_brt.strftime("%d/%m/%Y"),
                "time_display": dt_brt.strftime("%H:%M"),
                "dia_semana": dia_semana,
                "is_today": is_today,
                "home_team": home_team or "Mandante",
                "away_team": away_team or "Visitante",
                "home_score": home_score,
                "away_score": away_score,
                "status": status_formatted,
                "status_type": status_type,
                "venue": venue,
                "broadcast": broadcast_str,
                "odds": odds
            }
        except Exception:
            return None

    def fetch_matches_by_date(self, date_str: str, league_key: str = "serie_a") -> List[Dict[str, Any]]:
        """Busca partidas de uma data específica (formato YYYYMMDD)."""
        league_info = LEAGUES.get(league_key, LEAGUES["serie_a"])
        url = f"{self.base_url}/{league_info['id']}/scoreboard?dates={date_str}"
        try:
            resp = requests.get(url, headers=self.headers, timeout=8)
            if resp.status_code != 200:
                return []
            data = resp.json()
            events = data.get("events", [])
            matches = []
            for e in events:
                parsed = self._parse_match(e, league_info)
                if parsed:
                    matches.append(parsed)
            return matches
        except Exception:
            return []

    def fetch_current_round(self, league_key: str = "serie_a") -> List[Dict[str, Any]]:
        """Busca partidas da rodada corrente no scoreboard padrão."""
        league_info = LEAGUES.get(league_key, LEAGUES["serie_a"])
        url = f"{self.base_url}/{league_info['id']}/scoreboard"
        try:
            resp = requests.get(url, headers=self.headers, timeout=8)
            if resp.status_code != 200:
                return []
            data = resp.json()
            events = data.get("events", [])
            matches = []
            for e in events:
                parsed = self._parse_match(e, league_info)
                if parsed:
                    matches.append(parsed)
            return matches
        except Exception:
            return []

    def fetch_today_matches(self, league_keys: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Busca todos os jogos de hoje para as ligas selecionadas em paralelo."""
        if league_keys is None:
            league_keys = ["serie_a", "serie_b", "libertadores", "sulamericana"]
            
        now_brt = datetime.now(BRASILIA_TZ)
        date_str = now_brt.strftime("%Y%m%d")
        
        all_matches = []
        with ThreadPoolExecutor(max_workers=len(league_keys)) as executor:
            futures = [executor.submit(self.fetch_matches_by_date, date_str, lk) for lk in league_keys]
            for future in futures:
                try:
                    all_matches.extend(future.result())
                except Exception:
                    pass
            
        all_matches.sort(key=lambda x: x["datetime_brt"])
        return all_matches

    def fetch_week_matches(self, days_ahead: int = 7, league_keys: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Busca todos os jogos dos próximos N dias em paralelo super rápido."""
        if league_keys is None:
            league_keys = ["serie_a", "serie_b", "libertadores", "sulamericana"]

        now_brt = datetime.now(BRASILIA_TZ)
        tasks = []
        for day_offset in range(days_ahead + 1):
            target_dt = now_brt + timedelta(days=day_offset)
            date_str = target_dt.strftime("%Y%m%d")
            for lk in league_keys:
                tasks.append((date_str, lk))

        all_matches_map = {}
        with ThreadPoolExecutor(max_workers=12) as executor:
            futures = [executor.submit(self.fetch_matches_by_date, date_str, lk) for date_str, lk in tasks]
            for future in futures:
                try:
                    matches = future.result()
                    for m in matches:
                        all_matches_map[m["id"]] = m
                except Exception:
                    pass

        matches_list = list(all_matches_map.values())
        matches_list.sort(key=lambda x: x["datetime_brt"])
        return matches_list

    def search_by_team(self, query: str, league_keys: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Filtra partidas da rodada/semana que contenham o time buscado."""
        query_norm = query.strip().lower()
        week_matches = self.fetch_week_matches(days_ahead=14, league_keys=league_keys)
        filtered = [
            m for m in week_matches
            if query_norm in m["home_team"].lower() or query_norm in m["away_team"].lower()
        ]
        return filtered

