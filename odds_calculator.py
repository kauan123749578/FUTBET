import hashlib
import random

def get_or_generate_odds(comp_data, home_team: str, away_team: str):
    """
    Extrai as odds reais da API se existirem, ou gera cotações
    realistas no estilo Casa de Aposta baseadas no confronto.
    """
    # 1. Tentar extrair odds reais fornecidas pela API
    raw_odds = comp_data.get("odds", [])
    if raw_odds and isinstance(raw_odds, list) and raw_odds[0] is not None:
        first_odd = raw_odds[0]
        # Algumas respostas trazem 'details' ou 'homeTeamOdds'
        if isinstance(first_odd, dict):
            details = first_odd.get("details")
            over_under = first_odd.get("overUnder")
            if details:
                return {
                    "source": "Oficial (ESPN/Bet)",
                    "home": first_odd.get("homeWinOdd", 2.10),
                    "draw": first_odd.get("drawOdd", 3.25),
                    "away": first_odd.get("awayWinOdd", 3.40),
                    "details": details,
                    "over_under": over_under
                }

    # 2. Se a API ainda não publicou as odds oficiais, gera odds consistentes
    # Usamos o hash dos nomes para que os valores sejam estáveis a cada execução
    seed_str = f"{home_team}_vs_{away_team}"
    seed_val = int(hashlib.md5(seed_str.encode("utf-8")).hexdigest(), 16) % 10000
    
    # Gerando variação plausível:
    base_home = 1.65 + ((seed_val % 150) / 100.0)    # Ex: 1.65 até 3.15
    base_draw = 2.90 + (((seed_val // 2) % 60) / 100.0) # Ex: 2.90 até 3.50
    base_away = 2.10 + (((seed_val // 3) % 220) / 100.0) # Ex: 2.10 até 4.30

    return {
        "source": "Radar Bet Estimada",
        "home": round(base_home, 2),
        "draw": round(base_draw, 2),
        "away": round(base_away, 2),
        "details": f"1X2: {base_home:.2f} | {base_draw:.2f} | {base_away:.2f}",
        "over_under": 2.5
    }

def calculate_payout(odd: float, bet_amount: float = 10.0) -> float:
    """Calcula o retorno potencial de uma aposta."""
    return round(odd * bet_amount, 2)
