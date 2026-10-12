import sys

# Garante compatibilidade UTF-8 no terminal Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import argparse
from rich.prompt import Prompt
from rich.console import Console
from rich.panel import Panel

from api_service import FootballAPIService
from ui import render_banner, render_matches_table, render_bet_simulation

console = Console(force_terminal=True)

def handle_bet_simulation_flow(matches):
    if not matches:
        console.print("[yellow]Nenhum jogo disponível para simular aposta.[/yellow]")
        return
        
    render_matches_table(matches, "SELECIONE UM JOGO PARA APOSTAR")
    
    match_idx_str = Prompt.ask(
        "\n[bold green]Digite o número (#) do jogo que deseja simular[/bold green]",
        default="1"
    )
    
    try:
        match_idx = int(match_idx_str) - 1
        if match_idx < 0 or match_idx >= len(matches):
            console.print("[red]Número de jogo inválido![/red]")
            return
    except ValueError:
        console.print("[red]Entrada inválida![/red]")
        return
        
    selected_match = matches[match_idx]
    
    console.print(f"\n[bold white]Você escolheu:[/] [green]{selected_match['home_team']}[/] vs [cyan]{selected_match['away_team']}[/]")
    console.print("[1] Vitória Mandante (1)")
    console.print("[X] Empate (X)")
    console.print("[2] Vitória Visitante (2)")
    
    bet_choice = Prompt.ask("[bold yellow]Escolha seu palpite (1, X ou 2)[/bold yellow]", choices=["1", "x", "X", "2"]).upper()
    
    amount_str = Prompt.ask("[bold green]Valor da aposta em R$[/bold green]", default="50.00")
    try:
        amount = float(amount_str.replace(",", "."))
    except ValueError:
        amount = 50.0
        
    render_bet_simulation(selected_match, bet_choice, amount)

def interactive_menu():
    api = FootballAPIService()
    
    while True:
        console.clear()
        render_banner()
        
        console.print("[bold #00FF87]SELECIONE UMA OPÇÃO:[/bold #00FF87]")
        console.print(" [1] 📅 [bold white]Jogos da Semana[/bold white] (Próximos 7 dias - Série A, B e Copas)")
        console.print(" [2] ⚽ [bold white]Jogos de Hoje[/bold white] (Partidas do dia atual)")
        console.print(" [3] 🏆 [bold white]Rodada Atual / Recente[/bold white] (Brasileirão Série A)")
        console.print(" [4] 🇧🇷 [bold white]Brasileirão Série B[/bold white] (Jogos da semana)")
        console.print(" [5] 🔍 [bold white]Buscar por Time[/bold white] (Ex: Flamengo, Palmeiras, Grêmio...)")
        console.print(" [6] 🎟️  [bold white]Simular Aposta / Bilhete de Bet[/bold white]")
        console.print(" [0] 🚪 [dim]Sair do Radar[/dim]")
        
        choice = Prompt.ask("\n[bold #60EFFF]Digite a opção desejada[/bold #60EFFF]", choices=["1", "2", "3", "4", "5", "6", "0"], default="1")
        
        if choice == "0":
            console.print("\n[bold green]Valeu parceiro! Até a próxima rodada! ⚽ Boa sorte nas bets![/bold green]\n")
            break
            
        elif choice == "1":
            with console.status("[bold green]Consultando jogos da semana via API...", spinner="dots"):
                matches = api.fetch_week_matches(days_ahead=7)
            render_matches_table(matches, "JOGOS DOS PRÓXIMOS 7 DIAS")
            Prompt.ask("\n[dim]Pressione Enter para voltar ao menu...[/dim]")
            
        elif choice == "2":
            with console.status("[bold green]Buscando jogos de hoje via API...", spinner="dots"):
                matches = api.fetch_today_matches()
            if not matches:
                console.print(
                    Panel(
                        "[bold yellow]ℹ️ Nenhuma partida agendada para hoje no futebol brasileiro.[/bold yellow]\n"
                        "[dim cyan]Exibindo automaticamente os próximos jogos da rodada:[/dim cyan]",
                        border_style="yellow"
                    )
                )
                with console.status("[bold green]Buscando próximos jogos da semana...", spinner="dots"):
                    matches = api.fetch_week_matches(days_ahead=7)
                render_matches_table(matches, "PRÓXIMOS JOGOS DA SEMANA")
            else:
                render_matches_table(matches, "JOGOS DE HOJE")
            Prompt.ask("\n[dim]Pressione Enter para voltar ao menu...[/dim]")
            
        elif choice == "3":
            with console.status("[bold green]Carregando rodada do Brasileirão Série A...", spinner="dots"):
                matches = api.fetch_current_round("serie_a")
            render_matches_table(matches, "RODADA DO BRASILEIRÃO SÉRIE A")
            Prompt.ask("\n[dim]Pressione Enter para voltar ao menu...[/dim]")
            
        elif choice == "4":
            with console.status("[bold green]Carregando jogos da Série B...", spinner="dots"):
                matches = api.fetch_week_matches(days_ahead=7, league_keys=["serie_b"])
            render_matches_table(matches, "BRASILEIRÃO SÉRIE B")
            Prompt.ask("\n[dim]Pressione Enter para voltar ao menu...[/dim]")
            
        elif choice == "5":
            team_query = Prompt.ask("[bold yellow]Digite o nome do time[/bold yellow]")
            with console.status(f"[bold green]Buscando jogos do {team_query}...", spinner="dots"):
                matches = api.search_by_team(team_query)
            if not matches:
                console.print(
                    Panel(
                        f"[bold yellow]Nenhum jogo encontrado para '{team_query}' nos próximos 14 dias.[/bold yellow]",
                        border_style="yellow"
                    )
                )
            else:
                render_matches_table(matches, f"JOGOS DO {team_query.upper()}")
            Prompt.ask("\n[dim]Pressione Enter para voltar ao menu...[/dim]")
            
        elif choice == "6":
            with console.status("[bold green]Carregando partidas para simulação...", spinner="dots"):
                matches = api.fetch_week_matches(days_ahead=7)
            handle_bet_simulation_flow(matches)
            Prompt.ask("\n[dim]Pressione Enter para voltar ao menu...[/dim]")

def main():
    parser = argparse.ArgumentParser(description="Radar Bet CLI - Jogos e Cotações do Futebol Brasileiro")
    parser.add_argument("--hoje", action="store_true", help="Exibe os jogos de hoje")
    parser.add_argument("--semana", action="store_true", help="Exibe os jogos dos próximos 7 dias")
    parser.add_argument("--rodada", action="store_true", help="Exibe a rodada atual do Brasileirão Série A")
    parser.add_argument("--serie-b", action="store_true", help="Exibe os jogos da Série B")
    parser.add_argument("--time", type=str, help="Filtra jogos pelo nome do time")
    
    args = parser.parse_args()
    api = FootballAPIService()
    
    # Se passou algum argumento de linha de comando, roda direto sem menu
    if args.hoje or args.semana or args.rodada or args.serie_b or args.time:
        render_banner()
        if args.hoje:
            matches = api.fetch_today_matches()
            if not matches:
                console.print(
                    Panel(
                        "[bold yellow]ℹ️ Nenhuma partida agendada para hoje no futebol brasileiro.[/bold yellow]\n"
                        "[dim cyan]Exibindo automaticamente os próximos jogos da rodada:[/dim cyan]",
                        border_style="yellow"
                    )
                )
                matches = api.fetch_week_matches(days_ahead=7)
                render_matches_table(matches, "PRÓXIMOS JOGOS DA SEMANA")
            else:
                render_matches_table(matches, "JOGOS DE HOJE")
        elif args.semana:
            matches = api.fetch_week_matches(days_ahead=7)
            render_matches_table(matches, "JOGOS DOS PRÓXIMOS 7 DIAS")
        elif args.rodada:
            matches = api.fetch_current_round("serie_a")
            render_matches_table(matches, "RODADA DO BRASILEIRÃO SÉRIE A")
        elif args.serie_b:
            matches = api.fetch_week_matches(days_ahead=7, league_keys=["serie_b"])
            render_matches_table(matches, "BRASILEIRÃO SÉRIE B")
        elif args.time:
            matches = api.search_by_team(args.time)
            if not matches:
                console.print(
                    Panel(
                        f"[bold yellow]Nenhum jogo encontrado para '{args.time}' nos próximos 14 dias.[/bold yellow]",
                        border_style="yellow"
                    )
                )
            else:
                render_matches_table(matches, f"JOGOS DO {args.time.upper()}")
        return

    # Modo interativo padrão
    try:
        interactive_menu()
    except KeyboardInterrupt:
        console.print("\n\n[bold yellow]Sessão encerrada pelo usuário. Até mais![/bold yellow]\n")
        sys.exit(0)

if __name__ == "__main__":
    main()
