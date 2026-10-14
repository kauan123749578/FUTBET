"""Catálogo extenso de mercados (terminal estilo casa de apostas completa)."""
from __future__ import annotations

import hashlib
from typing import Any, Callable, Dict, List, Tuple

Jitter = Callable[[float, int, int, float, float], float]


def _jitter(base: float, idx: int, salt: int, lo: float = 1.05, hi: float = 15.0) -> float:
    v = base + ((idx * 17 + salt * 13) % 11 - 5) * 0.04
    return round(max(lo, min(hi, v)), 2)


def _tag(team: str) -> str:
    parts = [p for p in team.replace(".", " ").split() if p and p.lower() not in ("fc", "rj", "sp")]
    if not parts:
        return "TM"
    return "".join(p[0] for p in parts[:3]).upper()[:3]


def _player_roster(team: str, tag: str, idx: int, n: int = 26) -> List[Dict[str, str]]:
    pool = [
        "Silva", "Santos", "Oliveira", "Souza", "Lima", "Costa", "Pereira", "Alves", "Ferreira", "Rodrigues",
        "Martins", "Gomes", "Ribeiro", "Carvalho", "Araujo", "Melo", "Barbosa", "Rocha", "Dias", "Nascimento",
        "Cavani", "Hulk", "Ganso", "Kennedy", "Paulinho", "Roque", "Cano", "Arias", "Mauricio", "Piquerez",
    ]
    first = ["Lucas", "Gabriel", "Felipe", "Rafael", "Bruno", "João", "Pedro", "Matheus", "Guilherme", "Thiago"]
    seed = int(hashlib.md5(f"{team}_{idx}".encode()).hexdigest(), 16)
    out: List[Dict[str, str]] = []
    for i in range(n):
        fn = first[(seed + i * 7) % len(first)]
        ln = pool[(seed + i * 11) % len(pool)]
        out.append({"id": f"p_{tag}_{i}", "name": f"{ln}, {fn}", "tag": tag})
    return out


def build_markets_catalog(
    home: str,
    away: str,
    home_odd: float,
    draw_odd: float,
    away_odd: float,
    idx: int,
) -> Tuple[List[Dict[str, Any]], int]:
    j = _jitter
    markets: List[Dict[str, Any]] = []

    def push(mid: str, nome: str, odds: List[Dict[str, Any]]):
        if odds:
            markets.append({"id": mid, "nome": nome, "odds": odds})

    inv_h, inv_d, inv_a = 1 / max(home_odd, 1.01), 1 / max(draw_odd, 1.01), 1 / max(away_odd, 1.01)
    th, ta = _tag(home), _tag(away)

    push(
        "vencedor_encontro",
        "Vencedor do Encontro",
        [
            {"id": "ve_casa", "tipo": "1x2", "rotulo": "Casa", "valor": round(home_odd, 2)},
            {"id": "ve_emp", "tipo": "1x2", "rotulo": "Empate", "valor": round(draw_odd, 2)},
            {"id": "ve_fora", "tipo": "1x2", "rotulo": "Fora", "valor": round(away_odd, 2)},
        ],
    )

    ou_lines = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5]
    ou_odds: List[Dict[str, Any]] = []
    for i, line in enumerate(ou_lines):
        ou_odds.append({"id": f"tg_o_{line}", "tipo": "ou", "rotulo": f"Mais de {line}", "valor": j(1.47 + line * 0.35, idx, 10 + i)})
        ou_odds.append({"id": f"tg_u_{line}", "tipo": "ou", "rotulo": f"Menos de {line}", "valor": j(2.13 - line * 0.15, idx, 20 + i, lo=1.05)})
    push("total_gols", "Total de Gols no Jogo", ou_odds)

    push(
        "ambas_marcam",
        "Ambas as equipes marcam",
        [
            {"id": "btts_n", "tipo": "btts", "rotulo": "Não", "valor": j(1.58, idx, 30)},
            {"id": "btts_s", "tipo": "btts", "rotulo": "Sim", "valor": j(2.10, idx, 31)},
        ],
    )

    push(
        "dupla_chance",
        "Chance Dupla",
        [
            {"id": "dc_1x", "tipo": "dc", "rotulo": "Casa ou Empate", "valor": j(1 / (inv_h + inv_d), idx, 1)},
            {"id": "dc_12", "tipo": "dc", "rotulo": "Casa ou Fora", "valor": j(1 / (inv_h + inv_a), idx, 2)},
            {"id": "dc_x2", "tipo": "dc", "rotulo": "Empate ou Fora", "valor": j(1 / (inv_d + inv_a), idx, 3)},
        ],
    )

    push(
        "empate_nao_aposta",
        "Empate não tem aposta",
        [
            {"id": "dnb_h", "tipo": "dnb", "rotulo": "Casa", "valor": j(1.85, idx, 4)},
            {"id": "dnb_a", "tipo": "dnb", "rotulo": "Fora", "valor": j(1.73, idx, 5)},
        ],
    )

    push(
        "impar_par",
        "Ímpar/Par",
        [
            {"id": "ip_i", "tipo": "parity", "rotulo": "Ímpar", "valor": j(1.89, idx, 32)},
            {"id": "ip_p", "tipo": "parity", "rotulo": "Par", "valor": j(1.75, idx, 33)},
        ],
    )

    push(
        "vencedor_1t",
        "Vencedor do 1º tempo",
        [
            {"id": "ht_h", "tipo": "ht1x2", "rotulo": "Casa", "valor": j(home_odd * 1.35, idx, 40)},
            {"id": "ht_d", "tipo": "ht1x2", "rotulo": "Empate", "valor": j(draw_odd * 0.65, idx, 41)},
            {"id": "ht_a", "tipo": "ht1x2", "rotulo": "Fora", "valor": j(away_odd * 1.35, idx, 42)},
        ],
    )

    htft = [
        ("Casa/Casa", home_odd * 1.7), ("Casa/Empate", 15.0), ("Casa/Fora", 15.0),
        ("Empate/Casa", 5.6), ("Empate/Empate", draw_odd * 1.3), ("Empate/Fora", 5.2),
        ("Fora/Casa", 15.0), ("Fora/Empate", 15.0), ("Fora/Fora", away_odd * 1.7),
    ]
    push(
        "ht_ft",
        "Vence ao Intervalo/Vence ao Final do Jogo",
        [{"id": f"htft_{i}", "tipo": "htft", "rotulo": lbl, "valor": j(base, idx, 100 + i, lo=2.5, hi=15.0)} for i, (lbl, base) in enumerate(htft)],
    )

    push(
        "dc_1t",
        "1º Tempo - chance dupla",
        [
            {"id": "dc1_1x", "tipo": "dc", "rotulo": "Casa ou Empate", "valor": j(1.23, idx, 50)},
            {"id": "dc1_12", "tipo": "dc", "rotulo": "Casa ou Fora", "valor": j(1.65, idx, 51)},
            {"id": "dc1_x2", "tipo": "dc", "rotulo": "Empate ou Fora", "valor": j(1.21, idx, 52)},
        ],
    )

    for hi, (line_h, line_a, salt) in enumerate([(0, 1, 60), (1, 0, 63), (0, 2, 66), (2, 0, 69), (3, 0, 72), (0, 3, 75)]):
        push(
            f"hc_{line_h}_{line_a}",
            f"Handicap {line_h}:{line_a}",
            [
                {"id": f"hc_{hi}_h", "tipo": "hc", "rotulo": f"Casa ({line_h}:{line_a})", "valor": j(home_odd * (1.2 + line_h * 0.3), idx, salt)},
                {"id": f"hc_{hi}_d", "tipo": "hc", "rotulo": f"Empate ({line_h}:{line_a})", "valor": j(4.0 + line_a, idx, salt + 1)},
                {"id": f"hc_{hi}_a", "tipo": "hc", "rotulo": f"Fora ({line_h}:{line_a})", "valor": j(away_odd * (1.2 + line_a * 0.25), idx, salt + 2)},
            ],
        )

    push(
        "btts_ht_ft",
        "Ambas marcam 1º tempo/Ambas marcam 2º tempo",
        [
            {"id": "btts_nn", "tipo": "btts2", "rotulo": "Não/não", "valor": j(1.24, idx, 80)},
            {"id": "btts_ns", "tipo": "btts2", "rotulo": "Não/sim", "valor": j(4.20, idx, 81)},
            {"id": "btts_sn", "tipo": "btts2", "rotulo": "Sim/não", "valor": j(5.80, idx, 82)},
            {"id": "btts_ss", "tipo": "btts2", "rotulo": "Sim/sim", "valor": j(15.0, idx, 83, hi=15.0)},
        ],
    )

    push(
        "primeiro_gol",
        "1º gol",
        [
            {"id": "fg_h", "tipo": "fg", "rotulo": "Casa", "valor": j(2.0, idx, 84)},
            {"id": "fg_a", "tipo": "fg", "rotulo": "Fora", "valor": j(1.92, idx, 85)},
            {"id": "fg_n", "tipo": "fg", "rotulo": "Nenhum", "valor": j(5.40, idx, 86)},
        ],
    )

    push(
        "tempo_mais_gols",
        "Tempo do Jogo com Mais Gols",
        [
            {"id": "tmg_1", "tipo": "half", "rotulo": "1º Tempo", "valor": j(3.25, idx, 87)},
            {"id": "tmg_2", "tipo": "half", "rotulo": "2º Tempo", "valor": j(2.18, idx, 88)},
            {"id": "tmg_eq", "tipo": "half", "rotulo": "Igual", "valor": j(2.90, idx, 89)},
        ],
    )

    for side, label, salt in [("casa", home, 90), ("fora", away, 95)]:
        push(
            f"{side}_ambos_tempos",
            f"{label} para marcar em ambos os tempos",
            [
                {"id": f"{side}_bt_n", "tipo": "bt", "rotulo": "Não", "valor": j(1.12, idx, salt)},
                {"id": f"{side}_bt_s", "tipo": "bt", "rotulo": "Sim", "valor": j(5.0, idx, salt + 1)},
            ],
        )
        push(
            f"{side}_ip",
            f"{label} ímpar/par",
            [
                {"id": f"{side}_ipi", "tipo": "parity", "rotulo": "Ímpar", "valor": j(2.05, idx, salt + 2)},
                {"id": f"{side}_ipp", "tipo": "parity", "rotulo": "Par", "valor": j(1.63, idx, salt + 3)},
            ],
        )

    for side, label, base, salt in [("fora", away, away_odd, 110), ("casa", home, home_odd, 120)]:
        side_ou: List[Dict[str, Any]] = []
        for i, line in enumerate([0.5, 1.5, 2.5, 3.5]):
            side_ou.append({"id": f"{side}_o_{line}", "tipo": "team_ou", "rotulo": f"Mais de {line}", "valor": j(1.5 + line * 0.45 + base * 0.1, idx, salt + i)})
            side_ou.append({"id": f"{side}_u_{line}", "tipo": "team_ou", "rotulo": f"Menos de {line}", "valor": j(2.2 - line * 0.2, idx, salt + 10 + i, lo=1.05)})
        push(f"{side}_total_gols", f"{label} - Total de gols no jogo", side_ou)
        push(
            f"{side}_tempo_mais",
            f"{label} - Tempo do jogo com mais gols",
            [
                {"id": f"{side}_tm1", "tipo": "half", "rotulo": "1º Tempo", "valor": j(3.5, idx, salt + 20)},
                {"id": f"{side}_tm2", "tipo": "half", "rotulo": "2º Tempo", "valor": j(2.65, idx, salt + 21)},
                {"id": f"{side}_tme", "tipo": "half", "rotulo": "Igual", "valor": j(1.86, idx, salt + 22)},
            ],
        )

    cs_odds: List[Dict[str, Any]] = []
    for h in range(7):
        for a in range(7):
            if h + a > 6 and max(h, a) > 3:
                continue
            sc = f"{h}:{a}"
            base = 5.4 + (h + a) * 1.2 + abs(h - a) * 0.8
            cs_odds.append({"id": f"cs_{h}_{a}", "tipo": "cs", "rotulo": sc, "valor": j(base, idx, 200 + h * 10 + a, lo=4.0, hi=15.0)})
    push("resultado_exato", "Resultado exato [0:0] (0:0)", cs_odds)

    push(
        "qual_equipe_marca",
        "Qual equipe vai marcar",
        [
            {"id": "qem_b", "tipo": "score", "rotulo": "Ambas as equipes", "valor": j(2.10, idx, 130)},
            {"id": "qem_h", "tipo": "score", "rotulo": "Apenas Casa", "valor": j(3.50, idx, 131)},
            {"id": "qem_a", "tipo": "score", "rotulo": "Apenas Fora", "valor": j(3.30, idx, 132)},
            {"id": "qem_n", "tipo": "score", "rotulo": "Nenhum", "valor": j(5.40, idx, 133)},
        ],
    )

    push(
        "casa_devolve",
        "Casa devolve aposta",
        [
            {"id": "cd_e", "tipo": "dnb", "rotulo": "Empate", "valor": j(1.88, idx, 134)},
            {"id": "cd_a", "tipo": "dnb", "rotulo": "Fora", "valor": j(1.73, idx, 135)},
        ],
    )
    push(
        "fora_devolve",
        "Fora devolve aposta",
        [
            {"id": "fd_h", "tipo": "dnb", "rotulo": "Casa", "valor": j(1.79, idx, 136)},
            {"id": "fd_e", "tipo": "dnb", "rotulo": "Empate", "valor": j(1.81, idx, 137)},
        ],
    )

    for side, label, salt in [("casa", "Casa", 140), ("fora", "Fora", 142)]:
        push(
            f"{side}_clean",
            f"{label} para vencer a zero",
            [
                {"id": f"{side}_cz_n", "tipo": "csheet", "rotulo": "Não", "valor": j(1.18, idx, salt)},
                {"id": f"{side}_cz_s", "tipo": "csheet", "rotulo": "Sim", "valor": j(3.40, idx, salt + 1)},
            ],
        )

    push(
        "total_btts",
        "Total e ambas as equipes para marcar",
        [
            {"id": "tb_o_n", "tipo": "combo", "rotulo": "Mais de 2,5 e não", "valor": j(7.60, idx, 150)},
            {"id": "tb_o_s", "tipo": "combo", "rotulo": "Mais de 2,5 e sim", "valor": j(2.13, idx, 151)},
            {"id": "tb_u_n", "tipo": "combo", "rotulo": "Menos de 2,5 e não", "valor": j(1.39, idx, 152)},
            {"id": "tb_u_s", "tipo": "combo", "rotulo": "Menos de 2,5 e sim", "valor": j(4.30, idx, 153)},
        ],
    )

    ht_cs = ["0:0", "0:1", "0:2", "1:0", "1:1", "1:2", "2:0", "2:1", "2:2", "Outro"]
    push(
        "ht_cs",
        "1º Tempo - resultado exato",
        [{"id": f"htcs_{i}", "tipo": "cs", "rotulo": sc, "valor": j(2.09 + i * 0.8, idx, 160 + i, lo=2.0, hi=15.0)} for i, sc in enumerate(ht_cs)],
    )

    push(
        "vencedor_2t",
        "Vencedor do 2º tempo",
        [
            {"id": "2t_h", "tipo": "ht1x2", "rotulo": "Casa", "valor": j(home_odd * 1.25, idx, 170)},
            {"id": "2t_d", "tipo": "ht1x2", "rotulo": "Empate", "valor": j(2.17, idx, 171)},
            {"id": "2t_a", "tipo": "ht1x2", "rotulo": "Fora", "valor": j(away_odd * 1.25, idx, 172)},
        ],
    )

    push(
        "total_2t",
        "Total de Gols no 2º Tempo",
        [
            {"id": "2tg_o05", "tipo": "ou", "rotulo": "Mais de 0,5", "valor": j(1.38, idx, 173)},
            {"id": "2tg_o15", "tipo": "ou", "rotulo": "Mais de 1,5", "valor": j(2.75, idx, 174)},
            {"id": "2tg_o25", "tipo": "ou", "rotulo": "Mais de 2,5", "valor": j(6.60, idx, 175)},
            {"id": "2tg_u05", "tipo": "ou", "rotulo": "Menos de 0,5", "valor": j(2.60, idx, 176)},
            {"id": "2tg_u15", "tipo": "ou", "rotulo": "Menos de 1,5", "valor": j(1.39, idx, 177)},
            {"id": "2tg_u25", "tipo": "ou", "rotulo": "Menos de 2,5", "valor": j(1.08, idx, 178, lo=1.01)},
        ],
    )

    push(
        "casa_vence_ambos",
        "Casa para vencer ambos tempos",
        [
            {"id": "cvb_n", "tipo": "special", "rotulo": "Não", "valor": j(1.15, idx, 179)},
            {"id": "cvb_s", "tipo": "special", "rotulo": "Sim", "valor": j(5.60, idx, 180)},
        ],
    )

    combo_res_ou: List[Dict[str, Any]] = []
    salt = 190
    for res, rodd in [("Casa", home_odd), ("Empate", draw_odd), ("Fora", away_odd)]:
        for ou_lbl, ou_mult in [("mais de 1,5", 1.55), ("mais de 2,5", 2.1), ("mais de 3,5", 3.5), ("menos de 1,5", 0.9), ("menos de 2,5", 0.75), ("menos de 3,5", 0.65)]:
            combo_res_ou.append({
                "id": f"cro_{salt}",
                "tipo": "combo",
                "rotulo": f"{res} e {ou_lbl}",
                "valor": j(rodd * ou_mult, idx, salt, lo=2.0, hi=15.0),
            })
            salt += 1
    push("vencedor_total_gols", "Vencedor do Encontro e Total de Gols", combo_res_ou)

    push(
        "gol_1x2",
        "1º gol e 1x2",
        [
            {"id": "g1_hh", "tipo": "combo", "rotulo": "Casa gol e Casa", "valor": j(home_odd, idx, 210)},
            {"id": "g1_he", "tipo": "combo", "rotulo": "Casa gol e Empate", "valor": j(7.60, idx, 211)},
            {"id": "g1_ha", "tipo": "combo", "rotulo": "Casa gol e Fora", "valor": j(15.0, idx, 212, hi=15.0)},
            {"id": "g1_aa", "tipo": "combo", "rotulo": "Fora e Fora", "valor": j(away_odd, idx, 213)},
            {"id": "g1_ah", "tipo": "combo", "rotulo": "Fora gol e Casa", "valor": j(15.0, idx, 214, hi=15.0)},
            {"id": "g1_ae", "tipo": "combo", "rotulo": "Fora gol e Empate", "valor": j(7.60, idx, 215)},
            {"id": "g1_ng", "tipo": "combo", "rotulo": "Sem gols", "valor": j(5.40, idx, 216)},
        ],
    )

    push(
        "fora_vence_ambos",
        "Fora para vencer ambos os tempos",
        [
            {"id": "fvb_n", "tipo": "special", "rotulo": "Não", "valor": j(1.15, idx, 217)},
            {"id": "fvb_s", "tipo": "special", "rotulo": "Sim", "valor": j(5.40, idx, 218)},
        ],
    )

    push(
        "ambos_ou15",
        "Ambos os tempos mais de 1,5",
        [
            {"id": "bo15_n", "tipo": "special", "rotulo": "Não", "valor": j(1.25, idx, 219)},
            {"id": "bo15_s", "tipo": "special", "rotulo": "Sim", "valor": j(4.50, idx, 220)},
        ],
    )
    push(
        "ambos_uo15",
        "Ambos os tempos menos de 1,5",
        [
            {"id": "bu15_n", "tipo": "special", "rotulo": "Não", "valor": j(1.74, idx, 221)},
            {"id": "bu15_s", "tipo": "special", "rotulo": "Sim", "valor": j(1.60, idx, 222)},
        ],
    )

    mins10 = ["1-10", "11-20", "21-30", "31-40", "41-50", "51-60", "61-70", "71-80", "81-90", "Nenhum"]
    push(
        "gol_10min",
        "Quando será marcado o 1º gol (intervalo de 10 minutos)",
        [{"id": f"m10_{i}", "tipo": "time", "rotulo": lbl, "valor": j(4.4 + i * 0.5, idx, 230 + i)} for i, lbl in enumerate(mins10)],
    )
    mins15 = ["1-15", "16-30", "31-45", "46-60", "61-75", "76-90", "Nenhum"]
    push(
        "gol_15min",
        "Quando será marcado o 1º gol (intervalo de 15 minutos)",
        [{"id": f"m15_{i}", "tipo": "time", "rotulo": lbl, "valor": j(3.15 + i * 0.5, idx, 240 + i)} for i, lbl in enumerate(mins15)],
    )

    push(
        "vencedor_10min",
        "Vencedor no período de 1 a 10 minutos",
        [
            {"id": "v10_h", "tipo": "1x2", "rotulo": "Casa", "valor": j(6.40, idx, 250)},
            {"id": "v10_d", "tipo": "1x2", "rotulo": "Empate", "valor": j(1.35, idx, 251, lo=1.05, hi=3.0)},
            {"id": "v10_a", "tipo": "1x2", "rotulo": "Fora", "valor": j(6.20, idx, 252)},
        ],
    )

    for half, salt in [("1º Tempo", 260), ("2º Tempo", 270)]:
        push(
            f"btts_{half}",
            f"{half} - ambas as equipes marcam",
            [
                {"id": f"btt_{salt}_n", "tipo": "btts", "rotulo": "Não", "valor": j(1.11, idx, salt)},
                {"id": f"btt_{salt}_s", "tipo": "btts", "rotulo": "Sim", "valor": j(5.6 if half.startswith("1") else 3.75, idx, salt + 1)},
            ],
        )

    push(
        "ip_2t",
        "2º Tempo - ímpar/par",
        [
            {"id": "2tip_i", "tipo": "parity", "rotulo": "Ímpar", "valor": j(1.89, idx, 280)},
            {"id": "2tip_p", "tipo": "parity", "rotulo": "Par", "valor": j(1.61, idx, 281)},
        ],
    )
    push(
        "dc_2t",
        "2º Tempo - dupla chance",
        [
            {"id": "2tdc_1x", "tipo": "dc", "rotulo": "Casa ou Empate", "valor": j(1.26, idx, 282)},
            {"id": "2tdc_12", "tipo": "dc", "rotulo": "Casa ou Fora", "valor": j(1.44, idx, 283)},
            {"id": "2tdc_x2", "tipo": "dc", "rotulo": "Empate ou Fora", "valor": j(1.24, idx, 284)},
        ],
    )
    push(
        "ip_1t",
        "1º Tempo -ímpar/par",
        [
            {"id": "1tip_i", "tipo": "parity", "rotulo": "Ímpar", "valor": j(2.23, idx, 285)},
            {"id": "1tip_p", "tipo": "parity", "rotulo": "Par", "valor": j(1.59, idx, 286)},
        ],
    )

    push(
        "vencedor_btts",
        "Vencedor do Encontro e Ambas Marcam",
        [
            {"id": "vb_hn", "tipo": "combo", "rotulo": "Casa e não", "valor": j(3.50, idx, 290)},
            {"id": "vb_hs", "tipo": "combo", "rotulo": "Casa e sim", "valor": j(6.20, idx, 291)},
            {"id": "vb_en", "tipo": "combo", "rotulo": "Empate e não", "valor": j(5.40, idx, 292)},
            {"id": "vb_es", "tipo": "combo", "rotulo": "Empate e sim", "valor": j(4.20, idx, 293)},
            {"id": "vb_an", "tipo": "combo", "rotulo": "Fora e não", "valor": j(3.30, idx, 294)},
            {"id": "vb_as", "tipo": "combo", "rotulo": "Fora e sim", "valor": j(5.80, idx, 295)},
        ],
    )

    push(
        "ultimo_gol",
        "Último gol",
        [
            {"id": "ug_h", "tipo": "fg", "rotulo": "Casa", "valor": j(2.08, idx, 296)},
            {"id": "ug_a", "tipo": "fg", "rotulo": "Fora", "valor": j(1.99, idx, 297)},
            {"id": "ug_n", "tipo": "fg", "rotulo": "Nenhum", "valor": j(5.40, idx, 298)},
        ],
    )

    push(
        "fg_1t",
        "1º Tempo - 1º gol",
        [
            {"id": "fg1_h", "tipo": "fg", "rotulo": "Casa", "valor": j(2.95, idx, 299)},
            {"id": "fg1_a", "tipo": "fg", "rotulo": "Fora", "valor": j(2.80, idx, 300)},
            {"id": "fg1_n", "tipo": "fg", "rotulo": "Nenhum", "valor": j(2.09, idx, 301)},
        ],
    )

    roster_h = _player_roster(home, th, idx, 28)
    roster_a = _player_roster(away, ta, idx + 7, 28)

    def player_odds(players: List[Dict[str, str]], prefix: str, base: float, salt: int) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        for i, p in enumerate(players):
            out.append({
                "id": f"{prefix}_{p['id']}",
                "tipo": "player",
                "rotulo": f"{p['name']} ({p['tag']})",
                "valor": j(base + (i % 8) * 0.35, idx, salt + i, lo=3.0, hi=15.0),
            })
        return out

    push("marca_qualquer", "Marca um Gol em Qualquer Momento do Jogo", player_odds(roster_h + roster_a, "any", 3.5, 310))

    push(
        "tg_1t",
        "Total de Gols no 1º Tempo",
        [
            {"id": "1tg_o05", "tipo": "ou", "rotulo": "Mais de 0,5", "valor": j(1.55, idx, 400)},
            {"id": "1tg_o15", "tipo": "ou", "rotulo": "Mais de 1,5", "valor": j(3.40, idx, 401)},
            {"id": "1tg_o25", "tipo": "ou", "rotulo": "Mais de 2,5", "valor": j(6.80, idx, 402)},
            {"id": "1tg_u05", "tipo": "ou", "rotulo": "Menos de 0,5", "valor": j(2.09, idx, 403)},
            {"id": "1tg_u15", "tipo": "ou", "rotulo": "Menos de 1,5", "valor": j(1.21, idx, 404)},
            {"id": "1tg_u25", "tipo": "ou", "rotulo": "Menos de 2,5", "valor": j(1.05, idx, 405, lo=1.01)},
        ],
    )

    ht2_cs = ["0:0", "0:1", "0:2", "1:0", "1:1", "1:2", "2:0", "2:1", "2:2", "Outro"]
    push(
        "cs_2t",
        "2º Tempo - resultado exato",
        [{"id": f"2cs_{i}", "tipo": "cs", "rotulo": sc, "valor": j(2.6 + i * 0.7, idx, 410 + i, lo=2.0, hi=15.0)} for i, sc in enumerate(ht2_cs)],
    )

    push(
        "fg_2t",
        "2º Tempo - 1º gol",
        [
            {"id": "2fg_h", "tipo": "fg", "rotulo": "Casa", "valor": j(2.54, idx, 420)},
            {"id": "2fg_a", "tipo": "fg", "rotulo": "Fora", "valor": j(2.42, idx, 421)},
            {"id": "2fg_n", "tipo": "fg", "rotulo": "Nenhum", "valor": j(2.60, idx, 422)},
        ],
    )

    corn_lines = [7.5, 8.5, 9.5, 10.5, 11.5]
    corn: List[Dict[str, Any]] = []
    for i, line in enumerate(corn_lines):
        corn.append({"id": f"co_{line}", "tipo": "corners", "rotulo": f"Mais de {line}", "valor": j(1.26 + line * 0.08, idx, 430 + i)})
        corn.append({"id": f"cu_{line}", "tipo": "corners", "rotulo": f"Menos de {line}", "valor": j(3.15 - line * 0.15, idx, 440 + i, lo=1.05)})
    push("total_escanteios", "Total de escanteios", corn)

    push(
        "escanteios_1x2",
        "Escanteios 1x2",
        [
            {"id": "c1x2_h", "tipo": "corners", "rotulo": "Casa", "valor": j(1.99, idx, 450)},
            {"id": "c1x2_d", "tipo": "corners", "rotulo": "Empate", "valor": j(8.0, idx, 451)},
            {"id": "c1x2_a", "tipo": "corners", "rotulo": "Fora", "valor": j(2.04, idx, 452)},
        ],
    )
    push(
        "escanteios_1t_1x2",
        "1ª tempo - escanteios 1x2",
        [
            {"id": "c1t_h", "tipo": "corners", "rotulo": "Casa", "valor": j(2.15, idx, 453)},
            {"id": "c1t_d", "tipo": "corners", "rotulo": "Empate", "valor": j(5.0, idx, 454)},
            {"id": "c1t_a", "tipo": "corners", "rotulo": "Fora", "valor": j(2.19, idx, 455)},
        ],
    )
    push(
        "esc_ip",
        "Escanteios ímpar/par",
        [
            {"id": "cip_i", "tipo": "parity", "rotulo": "Ímpar", "valor": j(1.72, idx, 456)},
            {"id": "cip_p", "tipo": "parity", "rotulo": "Par", "valor": j(1.73, idx, 457)},
        ],
    )
    push(
        "primeiro_escanteio",
        "1º escanteio",
        [
            {"id": "ce_h", "tipo": "corners", "rotulo": "Casa", "valor": j(1.81, idx, 458)},
            {"id": "ce_a", "tipo": "corners", "rotulo": "Fora", "valor": j(1.83, idx, 459)},
            {"id": "ce_n", "tipo": "corners", "rotulo": "Nenhum", "valor": j(15.0, idx, 460, hi=15.0)},
        ],
    )

    push("ultimo_gol_jogador", "Que Jogador Marca o Último Gol?", player_odds(roster_h + roster_a, "last", 7.0, 470) + [
        {"id": "last_ag", "tipo": "player", "rotulo": "auto-gol", "valor": j(12.0, idx, 500, hi=15.0)},
        {"id": "last_ng", "tipo": "player", "rotulo": "sem gol", "valor": j(5.40, idx, 501)},
        {"id": "last_ot", "tipo": "player", "rotulo": "outro", "valor": j(11.0, idx, 502, hi=15.0)},
    ])

    push(
        "escala_escanteios",
        "Escala de escanteios",
        [
            {"id": "es_08", "tipo": "corners", "rotulo": "0-8", "valor": j(2.31, idx, 510)},
            {"id": "es_911", "tipo": "corners", "rotulo": "9-11", "valor": j(2.48, idx, 511)},
            {"id": "es_12p", "tipo": "corners", "rotulo": "12+", "valor": j(2.70, idx, 512)},
        ],
    )

    push("primeiro_gol_jogador", "Que Jogador Marca o 1º Gol?", player_odds(roster_h + roster_a, "first", 7.0, 520) + [
        {"id": "first_ag", "tipo": "player", "rotulo": "auto-gol", "valor": j(12.0, idx, 550, hi=15.0)},
        {"id": "first_ng", "tipo": "player", "rotulo": "sem gol", "valor": j(5.40, idx, 551)},
        {"id": "first_ot", "tipo": "player", "rotulo": "outro", "valor": j(11.0, idx, 552, hi=15.0)},
    ])

    total = sum(len(m["odds"]) for m in markets)
    return markets, total
