# ⚽ Radar Bet CLI - Jogos & Cotações do Futebol Brasileiro

Um aplicativo de terminal moderno e elegante feito em **Python**, no estilo das maiores **casas de aposta esportiva (Bet365 / Betano)**. Ele consulta APIs esportivas em tempo real para exibir os jogos da rodada, datas, horários em **Horário de Brasília (BRT)**, estádios, status ao vivo/finalizado e **odds de aposta (1X2)**!

---

## 🚀 Funcionalidades

- 📅 **Jogos da Semana:** Próximos 7 dias de jogos organizados por data e horário.
- ⚽ **Jogos de Hoje:** Filtro dinâmico das partidas do dia atual.
- 🏆 **Rodada Atual & Placar ao Vivo:** Resultados recentes e jogos em andamento com placar.
- 🇧🇷 **Cobertura do Futebol Nacional:** Brasileirão Série A, Série B, Copa Libertadores e Sul-Americana.
- 🔍 **Busca por Time:** Digite o nome de qualquer time (ex: *Flamengo, Palmeiras, Grêmio, São Paulo, Corinthians*) para ver o calendário completo.
- 🎟️ **Simulador de Apostas:** Escolha um jogo, selecione seu palpite (Mandante, Empate ou Visitante) e veja o cálculo de retorno e lucro potencial com base nas Odds!
- 🎨 **Visual Terminal Premium:** Interface rica construída com `rich`, com cores vibrantes, ícones e compatibilidade total com Windows (UTF-8).

---

## 📦 Como Usar

### 1. Iniciar o Modo Interativo (Menu Completo):
```bash
python main.py
```

### 2. Comandos Diretos via Terminal:
Se você quiser consultar rapidamente sem abrir o menu:

- **Ver jogos dos próximos 7 dias:**
  ```bash
  python main.py --semana
  ```

- **Ver jogos de hoje:**
  ```bash
  python main.py --hoje
  ```

- **Ver resultados da rodada atual:**
  ```bash
  python main.py --rodada
  ```

- **Ver jogos da Série B:**
  ```bash
  python main.py --serie-b
  ```

- **Buscar jogos de um time específico:**
  ```bash
  python main.py --time flamengo
  python main.py --time palmeiras
  python main.py --time corinthians
  ```

---

## 🛠️ Estrutura do Projeto

```
radar_jogos/
├── config.py           # Configurações de fuso horário, cores e ligas
├── api_service.py      # Integração com a API de futebol e conversão de dados
├── odds_calculator.py  # Motor de cálculo e simulação de odds (1X2)
├── ui.py               # Renderização de tabelas e banners com a biblioteca Rich
├── main.py             # CLI com menu interativo e argumentos de linha de comando
├── requirements.txt    # Dependências do projeto
└── README.md           # Documentação
```
