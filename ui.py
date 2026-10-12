import sys

# Garante compatibilidade UTF-8 no terminal Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.align import Align
from rich import box
from typing import List, Dict, Any
from odds_calculator import calculate_payout

console = Console(force_terminal=True)

def render_banner():
    """Exibe o cabeçalho estilizado estilo Casa de Aposta no terminal."""
    banner_text = (
        "[bold #00FF87]===========================================================[/bold #00FF87]\n"
        "[bold #00FF87]       ⚽  RADAR BET - JOGOS & COTAÇÕES DO BRASIL  ⚽      [/bold #00FF87]\n"
        "[bold #60EFFF]             Futebol Brasileiro • Horário de Brasília      [/bold #60EFFF]\n"
        "[bold #00FF87]===========================================================[/bold #00FF87]"
    )
    panel = Panel(
        Align.center(banner_text),
        border_style="#00FF87",
        box=box.DOUBLE,
        subtitle="[bold #FFE600]Live Sports Data • Série A, Série B & Copas[/bold #FFE600]"
    )
    console.print(panel)

def render_matches_table(matches: List[Dict[str, Any]], title: str = "JOGOS ENCONTRADOS"):
    """Renderiza a tabela de jogos com design moderno, compacto e responsivo."""
    if not matches:
        console.print(
            Panel(
                "[bold yellow]Nenhum jogo encontrado para o período ou filtro selecionado.[/bold yellow]",
                border_style="yellow",
                box=box.ROUNDED
            )
        )
        return

    table = Table(
        title=f"\n[bold #60EFFF]⚽ {title.upper()} ({len(matches)} PARTIDAS)[/bold #60EFFF]",
        title_justify="left",
        box=box.ROUNDED,
        header_style="bold #00FF87",
        border_style="#44475A",
        show_lines=True
    )

    table.add_column("#", justify="center", style="dim")
    table.add_column("Data / Hora", justify="center")
    table.add_column("Liga", justify="center")
    table.add_column("Confronto", justify="left")
    table.add_column("Status", justify="center")
    table.add_column("Odds (1 | X | 2)", justify="center", style="bold #FFE600")

    for idx, m in enumerate(matches, 1):
        # Formatando data e hora
        if m["is_today"]:
            data_str = f"[bold green]HOJE[/bold green]\n{m['time_display']}"
        else:
            data_str = f"{m['date_display']}\n[dim]{m['dia_semana'][:3]}[/dim] {m['time_display']}"

        # Confronto & Placar
        if m["status_type"] == "finished":
            confronto_str = (
                f"[bold white]{m['home_team']}[/] "
                f"[bold cyan]{m['home_score']} x {m['away_score']}[/] "
                f"[bold white]{m['away_team']}[/]"
            )
            status_str = "[bold blue]Finalizado[/bold blue]"
        elif m["status_type"] == "live":
            confronto_str = (
                f"[bold white]{m['home_team']}[/] "
                f"[bold red blink]{m['home_score']} x {m['away_score']}[/] "
                f"[bold white]{m['away_team']}[/]"
            )
            status_str = f"[bold red blink]● {m['status']}[/bold red blink]"
        else:
            confronto_str = (
                f"[bold white]{m['home_team']}[/] "
                f"[yellow]vs[/yellow] "
                f"[bold white]{m['away_team']}[/]"
            )
            status_str = "[yellow]Agendado[/yellow]"

        # Adiciona estádio se disponível
        if m.get("venue") and m["venue"] != "A definir":
            confronto_str += f"\n[dim]📍 {m['venue']}[/dim]"

        # Odds 1X2
        odds_obj = m.get("odds", {})
        odd_home = odds_obj.get("home", 1.85)
        odd_draw = odds_obj.get("draw", 3.20)
        odd_away = odds_obj.get("away", 3.40)
        odds_str = f"[green]{odd_home:.2f}[/green] | [yellow]{odd_draw:.2f}[/yellow] | [cyan]{odd_away:.2f}[/cyan]"

        table.add_row(
            str(idx),
            data_str,
            f"{m['league_badge']}",
            confronto_str,
            status_str,
            odds_str
        )

    console.print(table)
    console.print("[dim italic]Legenda Cotações: [green]1 = Mandante[/green] | [yellow]X = Empate[/yellow] | [cyan]2 = Visitante[/cyan][/dim italic]\n")

def render_bet_simulation(match: Dict[str, Any], bet_choice: str, amount: float):
    """Exibe painel de simulação de bilhete de aposta."""
    odds_obj = match.get("odds", {})
    
    if bet_choice == "1":
        pick_name = f"Vitória do {match['home_team']}"
        odd_val = odds_obj.get("home", 1.80)
    elif bet_choice == "X":
        pick_name = "Empate"
        odd_val = odds_obj.get("draw", 3.20)
    else:
        pick_name = f"Vitória do {match['away_team']}"
        odd_val = odds_obj.get("away", 2.20)

    payout = calculate_payout(odd_val, amount)
    profit = round(payout - amount, 2)

    sim_text = f"""
[bold white]Confronto:[/] [green]{match['home_team']}[/] vs [cyan]{match['away_team']}[/]
[bold white]Campeonato:[/] {match['league_name']} ({match['date_display']} às {match['time_display']})
[bold white]Seu Palpite:[/] [bold #FFE600]{pick_name}[/] (Odd: [bold #00FF87]{odd_val:.2f}[/])
[bold white]Valor Apostado:[/] R$ {amount:.2f}
[bold white]Retorno Potencial:[/] [bold #00FF87]R$ {payout:.2f}[/]
[bold white]Lucro Estimado:[/] [bold #FFE600]+R$ {profit:.2f}[/]
    """
    
    panel = Panel(
        sim_text.strip(),
        title="[bold #00FF87]🎟️ BILHETE DE APOSTA SIMULADO[/bold #00FF87]",
        border_style="#00FF87",
        box=box.DOUBLE
    )
    console.print(panel)
