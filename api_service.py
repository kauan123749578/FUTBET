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

    @staticmethod
    def _team_logo_url(team: Dict[str, Any]) -> Optional[str]:
        if not team:
            return None
        logo = team.get("logo")
        if logo and isinstance(logo, str) and logo.startswith("http"):
            return logo
        logos = team.get("logos")
        if isinstance(logos, list):
            for item in logos:
                href = item.get("href") if isinstance(item, dict) else None
                if href and str(href).startswith("http"):
                    return href
        return None

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
            home_logo = None
            away_logo = None

            for c in competitors:
                team = c.get("team") or {}
                team_name = team.get("displayName", "Time Desconhecido")
                logo_url = self._team_logo_url(team)
                score = c.get("score")
                if c.get("homeAway") == "home":
                    home_team = team_name
                    home_logo = logo_url
                    home_score = int(score) if score is not None and score != "" else None
                else:
                    away_team = team_name
                    away_logo = logo_url
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
                "home_logo": home_logo,
                "away_logo": away_logo,
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

    def get_all_matches(self, days_ahead: int = 7) -> List[Dict[str, Any]]:
        """Partidas da semana enriquecidas para o frontend web."""
        raw = self.fetch_week_matches(days_ahead=days_ahead)
        return [self._to_frontend_jogo(m, idx) for idx, m in enumerate(raw)]

    def get_live_matches(self) -> List[Dict[str, Any]]:
        """Partidas ao vivo (todas as ligas monitoradas)."""
        today = self.fetch_today_matches()
        live_raw = [m for m in today if m.get("status_type") == "live"]
        return [self._to_frontend_jogo(m, idx) for idx, m in enumerate(live_raw)]

    @staticmethod
    def _camp_id_for_league(league_id: str) -> int:
        mapping = {
            "bra.1": 574584,
            "bra.2": 574585,
            "conmebol.libertadores": 574586,
            "conmebol.sudamericana": 574587,
        }
        return mapping.get(league_id, abs(hash(league_id)) % 900000 + 500000)

    @staticmethod
    def _jitter(base: float, idx: int, salt: int, lo: float = 1.05, hi: float = 15.0) -> float:
        v = base + ((idx * 17 + salt * 13) % 11 - 5) * 0.04
        return round(max(lo, min(hi, v)), 2)

    def _build_mercados_adicionais(
        self,
        home: str,
        away: str,
        home_odd: float,
        draw_odd: float,
        away_odd: float,
        idx: int,
        over_line: float = 2.5,
    ) -> tuple:
        """Mercados extras derivados das odds 1X2 (estilo terminal completo)."""
        markets: List[Dict[str, Any]] = []

        def push(mid: str, nome: str, odds: List[Dict[str, Any]]):
            if odds:
                markets.append({"id": mid, "nome": nome, "odds": odds})

        inv_h, inv_d, inv_a = 1 / max(home_odd, 1.01), 1 / max(draw_odd, 1.01), 1 / max(away_odd, 1.01)

        push(
            "dupla_chance",
            "Dupla Chance",
            [
                {"id": "dc_1x", "tipo": "dc", "rotulo": "Casa ou Empate", "valor": self._jitter(1 / (inv_h + inv_d), idx, 1)},
                {"id": "dc_12", "tipo": "dc", "rotulo": "Casa ou Fora", "valor": self._jitter(1 / (inv_h + inv_a), idx, 2)},
                {"id": "dc_x2", "tipo": "dc", "rotulo": "Empate ou Fora", "valor": self._jitter(1 / (inv_d + inv_a), idx, 3)},
            ],
        )

        push(
            "empate_nao_aposta",
            "Empate não tem aposta",
            [
                {"id": "dnb_home", "tipo": "dnb", "rotulo": f"Casa ({home})", "valor": self._jitter(home_odd * 0.72, idx, 4)},
                {"id": "dnb_away", "tipo": "dnb", "rotulo": f"Fora ({away})", "valor": self._jitter(away_odd * 0.72, idx, 5)},
            ],
        )

        ou_lines = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5]
        ou_odds: List[Dict[str, Any]] = []
        for i, line in enumerate(ou_lines):
            over_base = 1.55 + line * 0.22 + (idx % 3) * 0.03
            under_base = 1.45 + (6 - line) * 0.18
            ou_odds.append({"id": f"over_{line}", "tipo": "ou", "rotulo": f"Mais de {line}", "valor": self._jitter(over_base, idx, 10 + i)})
            ou_odds.append({"id": f"under_{line}", "tipo": "ou", "rotulo": f"Menos de {line}", "valor": self._jitter(under_base, idx, 20 + i)})
        push("total_gols", "Total de Gols no Jogo", ou_odds)

        push(
            "ambas_marcam",
            "Ambas as equipes marcam",
            [
                {"id": "btts_sim", "tipo": "btts", "rotulo": "Sim", "valor": self._jitter(1.72, idx, 30)},
                {"id": "btts_nao", "tipo": "btts", "rotulo": "Não", "valor": self._jitter(2.05, idx, 31)},
            ],
        )

        push(
            "impar_par",
            "Ímpar / Par (total de gols)",
            [
                {"id": "par", "tipo": "parity", "rotulo": "Par", "valor": self._jitter(1.88, idx, 32)},
                {"id": "impar", "tipo": "parity", "rotulo": "Ímpar", "valor": self._jitter(1.92, idx, 33)},
            ],
        )

        ht_h = self._jitter(home_odd * 1.55, idx, 40)
        ht_d = self._jitter(draw_odd * 0.95, idx, 41)
        ht_a = self._jitter(away_odd * 1.55, idx, 42)
        push(
            "vencedor_1t",
            "Vencedor do 1º tempo",
            [
                {"id": "ht_home", "tipo": "ht1x2", "rotulo": f"Casa ({home})", "valor": ht_h},
                {"id": "ht_draw", "tipo": "ht1x2", "rotulo": "Empate", "valor": ht_d},
                {"id": "ht_away", "tipo": "ht1x2", "rotulo": f"Fora ({away})", "valor": ht_a},
            ],
        )

        ht_ou: List[Dict[str, Any]] = []
        for i, line in enumerate([0.5, 1.5, 2.5]):
            ht_ou.append({"id": f"ht_over_{line}", "tipo": "ht_ou", "rotulo": f"Mais de {line} (1T)", "valor": self._jitter(1.65 + line * 0.35, idx, 50 + i)})
            ht_ou.append({"id": f"ht_under_{line}", "tipo": "ht_ou", "rotulo": f"Menos de {line} (1T)", "valor": self._jitter(1.55 + (2 - line) * 0.25, idx, 55 + i)})
        push("total_gols_1t", "Total de Gols — 1º tempo", ht_ou)

        handicaps = [-1.5, -1.0, -0.5, 0.0, 0.5, 1.0]
        hc_odds: List[Dict[str, Any]] = []
        for i, hc in enumerate(handicaps):
            label = f"Casa {hc:+.1f}" if hc != 0 else "Sem handicap"
            hc_odds.append(
                {
                    "id": f"ah_home_{hc}",
                    "tipo": "ah",
                    "rotulo": label,
                    "valor": self._jitter(home_odd * (1.0 + hc * 0.12), idx, 60 + i),
                }
            )
        push("handicap_asiatico", "Handicap Asiático (mandante)", hc_odds)

        for side, name, base in [("home", home, home_odd), ("away", away, away_odd)]:
            side_ou: List[Dict[str, Any]] = []
            for i, line in enumerate([0.5, 1.5, 2.5]):
                side_ou.append({"id": f"{side}_over_{line}", "tipo": "team_ou", "rotulo": f"{name} — Mais {line}", "valor": self._jitter(base * 0.95 + line * 0.4, idx, 70 + i + (0 if side == "home" else 10))})
                side_ou.append({"id": f"{side}_under_{line}", "tipo": "team_ou", "rotulo": f"{name} — Menos {line}", "valor": self._jitter(1.4 + line * 0.35, idx, 80 + i + (0 if side == "home" else 10))})
            push(f"gols_{side}", f"Total de gols — {name}", side_ou)

        placares = ["1-0", "2-0", "2-1", "1-1", "0-0", "0-1", "1-2", "0-2", "3-1", "2-2", "3-0", "0-3"]
        cs_odds: List[Dict[str, Any]] = []
        for i, sc in enumerate(placares):
            cs_odds.append({"id": f"cs_{sc.replace('-', '_')}", "tipo": "cs", "rotulo": sc, "valor": self._jitter(6.5 + i * 0.9 + (idx % 5), idx, 90 + i, lo=4.0, hi=35.0)})
        push("placar_exato", "Placar exato", cs_odds)

        push(
            "intervalo_final",
            "Intervalo / Final do jogo",
            [
                {"id": "htft_1_1", "tipo": "htft", "rotulo": "Casa / Casa", "valor": self._jitter(home_odd * 2.1, idx, 100, lo=2.5, hi=40.0)},
                {"id": "htft_x_1", "tipo": "htft", "rotulo": "Empate / Casa", "valor": self._jitter(home_odd * 3.2, idx, 101, lo=3.0, hi=45.0)},
                {"id": "htft_2_2", "tipo": "htft", "rotulo": "Fora / Fora", "valor": self._jitter(away_odd * 2.1, idx, 102, lo=2.5, hi=40.0)},
                {"id": "htft_x_x", "tipo": "htft", "rotulo": "Empate / Empate", "valor": self._jitter(draw_odd * 4.5, idx, 103, lo=4.0, hi=50.0)},
            ],
        )

        push(
            "escanteios",
            "Total de escanteios (simulado)",
            [
                {"id": "corn_over_95", "tipo": "corners", "rotulo": "Mais de 9.5", "valor": self._jitter(1.82, idx, 110)},
                {"id": "corn_under_95", "tipo": "corners", "rotulo": "Menos de 9.5", "valor": self._jitter(1.98, idx, 111)},
                {"id": "corn_over_105", "tipo": "corners", "rotulo": "Mais de 10.5", "valor": self._jitter(2.05, idx, 112)},
                {"id": "corn_under_105", "tipo": "corners", "rotulo": "Menos de 10.5", "valor": self._jitter(1.75, idx, 113)},
            ],
        )

        total_opcoes = sum(len(m["odds"]) for m in markets)
        return markets, total_opcoes

    def _to_frontend_jogo(self, m: Dict[str, Any], idx: int) -> Dict[str, Any]:
        home = m.get("home_team", "Mandante")
        away = m.get("away_team", "Visitante")
        odds = m.get("odds") or {}
        home_odd = float(odds.get("home", 2.0))
        draw_odd = float(odds.get("draw", 3.2))
        away_odd = float(odds.get("away", 3.0))
        over_line = odds.get("over_under", 2.5)

        status_type = m.get("status_type", "scheduled")
        if status_type == "live":
            status = "ao_vivo"
        elif status_type == "finished":
            status = "finalizado"
        else:
            status = "agendado"

        dt_brt = m.get("datetime_brt")
        data_iso = dt_brt.strftime("%Y-%m-%d") if dt_brt else None
        league_id = m.get("league_id", "bra.1")
        league_name = m.get("league_name", "Futebol")
        flag = "🇧🇷" if "Brasil" in league_name or league_id.startswith("bra.") else "🏆"

        now_brt = datetime.now(BRASILIA_TZ)
        dia = m.get("dia_semana", "")
        if dt_brt and dt_brt.date() == now_brt.date():
            dia_label = "Hoje"
        elif dt_brt and dt_brt.date() == (now_brt + timedelta(days=1)).date():
            dia_label = "Amanhã"
        else:
            dia_label = dia

        return {
            "id": m.get("id") or idx + 1,
            "idEsporte": 102,
            "idCampeonato": self._camp_id_for_league(league_id),
            "campeonatoNome": league_name,
            "pais": "Brasil" if league_id.startswith("bra.") else "Internacional",
            "bandeira": flag,
            "dataHora": dt_brt.isoformat() if dt_brt else "",
            "dataHoraFormatada": f"{m.get('date_display', '')} {m.get('time_display', '')}".strip(),
            "diaSemana": dia_label,
            "dataIso": data_iso,
            "mandante": home,
            "visitante": away,
            "mandanteEscudo": m.get("home_logo"),
            "visitanteEscudo": m.get("away_logo"),
            "estadio": m.get("venue", "A definir"),
            "status": status,
            "tempoAoVivo": m.get("status", "") if status == "ao_vivo" else None,
            "placarMandante": m.get("home_score"),
            "placarVisitante": m.get("away_score"),
            "mercadoPrincipal": {
                "casa": {
                    "id": "1x2_home",
                    "tipo": "1x2",
                    "rotulo": f"Casa ({home})",
                    "valor": home_odd,
                },
                "empate": {
                    "id": "1x2_draw",
                    "tipo": "1x2",
                    "rotulo": "Empate",
                    "valor": draw_odd,
                },
                "fora": {
                    "id": "1x2_away",
                    "tipo": "1x2",
                    "rotulo": f"Fora ({away})",
                    "valor": away_odd,
                },
            },
            **(
                lambda _ma: {
                    "mercadosAdicionais": _ma[0],
                    "totalMercadosDisponiveis": _ma[1],
                }
            )(
                self._build_mercados_adicionais(home, away, home_odd, draw_odd, away_odd, idx, over_line)
            ),
        }

