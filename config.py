import os
from datetime import timezone, timedelta

# Fuso horário de Brasília (UTC-3)
BRASILIA_TZ = timezone(timedelta(hours=-3))

# Competições mapeadas
LEAGUES = {
    "serie_a": {
        "id": "bra.1",
        "name": "Brasileirão Série A",
        "flag": "🇧🇷",
        "badge": "⚽ Série A"
    },
    "serie_b": {
        "id": "bra.2",
        "name": "Brasileirão Série B",
        "flag": "🇧🇷",
        "badge": "⚽ Série B"
    },
    "libertadores": {
        "id": "conmebol.libertadores",
        "name": "Copa Libertadores",
        "flag": "🏆",
        "badge": "🏆 Libertadores"
    },
    "sulamericana": {
        "id": "conmebol.sudamericana",
        "name": "Copa Sul-Americana",
        "flag": "🌎",
        "badge": "🌎 Sul-Americana"
    }
}

# Cores e Estilo do Terminal (Visual Casa de Apostas)
THEME = {
    "primary": "#00FF87",      # Verde Neon (estilo bet)
    "secondary": "#60EFFF",    # Ciano Vibrante
    "accent": "#FFE600",       # Amarelo Ouro
    "dark": "#1E1E2E",         # Fundo escuro
    "live": "#FF0055",         # Vermelho Vivo (AO VIVO)
    "scheduled": "#A6E3A1",    # Verde suave (Agendado)
    "finished": "#89B4FA",     # Azul claro (Finalizado)
    "odds": "#F9E2AF",         # Dourado para Odds
}
