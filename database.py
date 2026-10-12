import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from dotenv import load_dotenv

load_dotenv()

# Detecta se está na Railway ou ambiente com PostgreSQL
# Railway injeta DATABASE_URL no formato postgres://... que o SQLAlchemy 2.0 requer como postgresql://...
raw_database_url = os.getenv("DATABASE_URL", "")

if raw_database_url:
    if raw_database_url.startswith("postgres://"):
        DATABASE_URL = raw_database_url.replace("postgres://", "postgresql://", 1)
    else:
        DATABASE_URL = raw_database_url
else:
    # Fallback local para SQLite
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'radar_banca.db')}"

print(f"[DATABASE] Conectando ao banco de dados: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Configuracao(Base):
    __tablename__ = "configuracoes"
    chave = Column(String(50), primary_key=True)
    valor = Column(Text, nullable=False)


class Cambista(Base):
    __tablename__ = "cambistas"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    usuario = Column(String(50), unique=True, index=True, nullable=False)
    telefone = Column(String(30), nullable=False)
    comissao_pct = Column(Float, default=10.0) # Ex: 10%
    limite_credito = Column(Float, default=2000.0)
    saldo_utilizado = Column(Float, default=0.0)
    status = Column(String(20), default="ativo") # 'ativo' ou 'bloqueado'
    senha_hash = Column(String(100), default="1234")
    criado_em = Column(DateTime, default=datetime.utcnow)

    bilhetes = relationship("Bilhete", back_populates="cambista")


class Cliente(Base):
    __tablename__ = "clientes"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    telefone = Column(String(30), default="")
    senha_hash = Column(String(100), default="")
    is_registered = Column(Boolean, default=False)
    saldo = Column(Float, default=0.0)
    total_apostado = Column(Float, default=0.0)
    total_bilhetes = Column(Integer, default=0)
    criado_em = Column(DateTime, default=datetime.utcnow)


class Bilhete(Base):
    __tablename__ = "bilhetes"
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False) # Ex: TCQG-H6UC
    criado_em = Column(DateTime, default=datetime.utcnow)
    data_formatada = Column(String(30), default="") # Ex: 07/10/2026 15:08:36
    status = Column(String(20), default="Aberto") # 'Aberto', 'Ganhou', 'Perdeu', 'Cancelado', 'Pendente'
    valor_apostado = Column(Float, nullable=False)
    comissao_valor = Column(Float, default=0.0)
    cotacao_total = Column(Float, nullable=False)
    retorno_potencial = Column(Float, nullable=False)
    tipo = Column(String(5), default="M") # 'M' (Múltipla) ou 'S' (Simples)
    cliente_nome = Column(String(100), nullable=False) # Ex: Kevin, Batata
    cliente_telefone = Column(String(30), default="")
    
    cambista_id = Column(Integer, ForeignKey("cambistas.id"), nullable=True)
    cambista = relationship("Cambista", back_populates="bilhetes")
    
    itens_json = Column(Text, default="[]") # JSON com lista de seleções/jogos
    hash_seguranca = Column(String(50), default="")
    chave_pix_usada = Column(String(100), default="")
    validado_por = Column(String(100), default="Admin / Dono")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Cria tabelas e popula dados iniciais com base na imagem do usuário."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Configurações Iniciais da Banca
    configs_padrao = {
        "whatsapp_dono": "5511999999999", # Número do Dono para receber o PIX
        "chave_pix": "11999999999",       # Chave PIX do Dono
        "nome_banca": "FUTBET",
        "comissao_padrao": "10.0",        # 10%
        "limite_padrao_cambista": "2000.00",
        "senha_admin": "admin123",
    }

    for k, v in configs_padrao.items():
        if not db.query(Configuracao).filter(Configuracao.chave == k).first():
            db.add(Configuracao(chave=k, valor=v))
    db.commit()

    # 2. Cambistas Iniciais
    if db.query(Cambista).count() == 0:
        cambistas_demo = [
            Cambista(nome="Kevin Cambista", usuario="kevin", telefone="11988881111", comissao_pct=10.0, limite_credito=3000.0, status="ativo"),
            Cambista(nome="Batata Representante", usuario="batata", telefone="11988882222", comissao_pct=10.0, limite_credito=2000.0, status="ativo"),
            Cambista(nome="Henrique Cambista", usuario="henrique", telefone="11988883333", comissao_pct=10.0, limite_credito=5000.0, status="ativo"),
            Cambista(nome="Arthur Central", usuario="arthur", telefone="11988884444", comissao_pct=10.0, limite_credito=2500.0, status="ativo"),
        ]
        db.add_all(cambistas_demo)
        db.commit()

    # 3. Bilhetes da Foto do Usuário (Identidade 100% fiel ao print)
    if db.query(Bilhete).count() == 0:
        cambista_kevin = db.query(Cambista).filter(Cambista.usuario == "kevin").first()
        c_id = cambista_kevin.id if cambista_kevin else 1

        bilhetes_foto = [
            {
                "codigo": "TCQG-H6UC",
                "data_formatada": "07/10/2026 15:08:36",
                "status": "Aberto",
                "valor_apostado": 10.00,
                "comissao_valor": 1.00,
                "cotacao_total": 9.13,
                "retorno_potencial": 91.20,
                "tipo": "M",
                "cliente_nome": "Kevin",
                "cliente_telefone": "(11) 98765-1111",
                "itens": [
                    {"jogo": "São Paulo FC x EC Vitória", "palpite": "São Paulo Vence", "odd": 1.55},
                    {"jogo": "Flamengo x Palmeiras", "palpite": "Ambas Marcam", "odd": 1.75},
                    {"jogo": "CA Tigre x CA Banfield", "palpite": "CA Tigre Vence", "odd": 1.63},
                    {"jogo": "Cruzeiro x Grêmio", "palpite": "+1.5 Gols", "odd": 1.25}
                ]
            },
            {
                "codigo": "F47G-B7R4",
                "data_formatada": "07/10/2026 15:08:10",
                "status": "Aberto",
                "valor_apostado": 5.00,
                "comissao_valor": 0.50,
                "cotacao_total": 75.04,
                "retorno_potencial": 376.20,
                "tipo": "M",
                "cliente_nome": "Kevin",
                "cliente_telefone": "(11) 98765-1111",
                "itens": [
                    {"jogo": "São Paulo FC x EC Vitória", "palpite": "São Paulo e +2.5", "odd": 2.80},
                    {"jogo": "Flamengo x Palmeiras", "palpite": "Palmeiras Vence", "odd": 3.45},
                    {"jogo": "Real Madrid x Barcelona", "palpite": "Real Madrid", "odd": 2.10},
                    {"jogo": "Arsenal x Chelsea", "palpite": "Arsenal Vence", "odd": 1.85},
                    {"jogo": "Milan x Inter", "palpite": "Inter Vence", "odd": 2.15}
                ]
            },
            {
                "codigo": "7MT7-7Q8Q",
                "data_formatada": "07/10/2026 15:00:56",
                "status": "Aberto",
                "valor_apostado": 10.00,
                "comissao_valor": 1.00,
                "cotacao_total": 16.77,
                "retorno_potencial": 167.70,
                "tipo": "M",
                "cliente_nome": "Batata",
                "cliente_telefone": "(11) 98765-2222",
                "itens": [
                    {"jogo": "Santos x Ponte Preta", "palpite": "Santos Vence", "odd": 1.50},
                    {"jogo": "Vasco x Botafogo", "palpite": "Ambas Marcam", "odd": 1.80},
                    {"jogo": "Boca Juniors x Racing", "palpite": "Empate", "odd": 3.10},
                    {"jogo": "Bahia x Fortaleza", "palpite": "+2.5 Gols", "odd": 2.00}
                ]
            },
            {
                "codigo": "APY8-E9QI",
                "data_formatada": "07/10/2026 14:34:27",
                "status": "Aberto",
                "valor_apostado": 50.00,
                "comissao_valor": 5.00,
                "cotacao_total": 129.78,
                "retorno_potencial": 6489.00,
                "tipo": "M",
                "cliente_nome": "Henrique Gabriel",
                "cliente_telefone": "(11) 98765-3333",
                "itens": [
                    {"jogo": "Liverpool x Man City", "palpite": "Liverpool Vence", "odd": 2.45},
                    {"jogo": "Bayern x Dortmund", "palpite": "Bayern -1.5", "odd": 2.20},
                    {"jogo": "PSG x Marseille", "palpite": "+3.5 Gols", "odd": 2.50},
                    {"jogo": "Benfica x Porto", "palpite": "Benfica Vence", "odd": 2.15},
                    {"jogo": "Atlético-MG x Cruzeiro", "palpite": "Ambas Marcam", "odd": 1.95}
                ]
            },
            {
                "codigo": "PDTM-BTZN",
                "data_formatada": "07/10/2026 14:30:33",
                "status": "Aberto",
                "valor_apostado": 10.00,
                "comissao_valor": 1.00,
                "cotacao_total": 22.25,
                "retorno_potencial": 222.50,
                "tipo": "M",
                "cliente_nome": "Yari",
                "cliente_telefone": "(11) 98765-4444",
                "itens": [
                    {"jogo": "Internacional x Coritiba", "palpite": "Inter Vence", "odd": 1.45},
                    {"jogo": "Athletico-PR x Juventude", "palpite": "Athletico Vence", "odd": 1.65},
                    {"jogo": "Cuiabá x Criciúma", "palpite": "Menos de 2.5 Gols", "odd": 1.60},
                    {"jogo": "Sport x Ceará", "palpite": "Ambas Marcam", "odd": 1.90},
                    {"jogo": "Goiás x Vila Nova", "palpite": "Goiás Vence", "odd": 2.10}
                ]
            },
            {
                "codigo": "YCOG-XWHN",
                "data_formatada": "07/10/2026 12:47:47",
                "status": "Aberto",
                "valor_apostado": 40.00,
                "comissao_valor": 4.00,
                "cotacao_total": 5.65,
                "retorno_potencial": 226.00,
                "tipo": "M",
                "cliente_nome": "Arthur",
                "cliente_telefone": "(11) 98765-5555",
                "itens": [
                    {"jogo": "Flamengo x Palmeiras", "palpite": "Flamengo ou Empate (1X)", "odd": 1.32},
                    {"jogo": "São Paulo FC x EC Vitória", "palpite": "São Paulo Vence", "odd": 1.55},
                    {"jogo": "Real Madrid x Barcelona", "palpite": "Ambas Marcam", "odd": 1.55},
                    {"jogo": "Chelsea x Tottenham", "palpite": "+1.5 Gols", "odd": 1.20}
                ]
            },
            {
                "codigo": "1FV7E-OY4X",
                "data_formatada": "07/10/2026 12:29:43",
                "status": "Aberto",
                "valor_apostado": 20.00,
                "comissao_valor": 2.00,
                "cotacao_total": 8.90,
                "retorno_potencial": 178.00,
                "tipo": "M",
                "cliente_nome": "Jonathas",
                "cliente_telefone": "(11) 98765-6666",
                "itens": [
                    {"jogo": "Manchester United x Everton", "palpite": "United Vence", "odd": 1.70},
                    {"jogo": "Juventus x Napoli", "palpite": "Menos de 2.5 Gols", "odd": 1.75},
                    {"jogo": "Vasco x Botafogo", "palpite": "+1.5 Gols", "odd": 1.35},
                    {"jogo": "Grêmio x Fluminense", "palpite": "Ambas Marcam", "odd": 1.85}
                ]
            },
            {
                "codigo": "LLAV-G9YW",
                "data_formatada": "07/10/2026 11:48:29",
                "status": "Aberto",
                "valor_apostado": 25.00,
                "comissao_valor": 2.50,
                "cotacao_total": 14.56,
                "retorno_potencial": 364.00,
                "tipo": "M",
                "cliente_nome": "Yaquinho",
                "cliente_telefone": "(11) 98765-7777",
                "itens": [
                    {"jogo": "Corinthians x Santos", "palpite": "Empate", "odd": 3.10},
                    {"jogo": "Palmeiras x Red Bull Bragantino", "palpite": "Palmeiras Vence", "odd": 1.55},
                    {"jogo": "Cruzeiro x Atlético-MG", "palpite": "+2.5 Gols", "odd": 2.10}
                ]
            },
            {
                "codigo": "J337-M6W5",
                "data_formatada": "07/10/2026 11:34:05",
                "status": "Aberto",
                "valor_apostado": 10.00,
                "comissao_valor": 1.00,
                "cotacao_total": 59.85,
                "retorno_potencial": 598.50,
                "tipo": "M",
                "cliente_nome": "WL",
                "cliente_telefone": "(11) 98765-8888",
                "itens": [
                    {"jogo": "Arsenal x Brighton", "palpite": "Arsenal -1.5", "odd": 2.20},
                    {"jogo": "Aston Villa x Newcastle", "palpite": "Ambas Marcam e +2.5", "odd": 2.30},
                    {"jogo": "PSG x Lyon", "palpite": "PSG Vence", "odd": 1.40},
                    {"jogo": "Porto x Braga", "palpite": "Porto Vence", "odd": 1.70},
                    {"jogo": "Ajax x Feyenoord", "palpite": "+3.5 Gols", "odd": 2.45}
                ]
            },
            {
                "codigo": "08ZX-X5J7",
                "data_formatada": "07/10/2026 11:30:40",
                "status": "Aberto",
                "valor_apostado": 60.00,
                "comissao_valor": 6.00,
                "cotacao_total": 87.67,
                "retorno_potencial": 5260.20,
                "tipo": "M",
                "cliente_nome": "Allan PGD",
                "cliente_telefone": "(11) 98765-9999",
                "itens": [
                    {"jogo": "Flamengo x Palmeiras", "palpite": "Palmeiras Vence", "odd": 3.45},
                    {"jogo": "São Paulo x Vitória", "palpite": "São Paulo -1.5", "odd": 2.30},
                    {"jogo": "Real Madrid x Barcelona", "palpite": "Real Madrid Vence", "odd": 2.10},
                    {"jogo": "Man City x Chelsea", "palpite": "+3.5 Gols", "odd": 2.25},
                    {"jogo": "Inter Miami x LA Galaxy", "palpite": "Messi Marca", "odd": 1.95}
                ]
            },
            {
                "codigo": "48TB-S1W9",
                "data_formatada": "07/10/2026 11:21:12",
                "status": "Aberto",
                "valor_apostado": 10.00,
                "comissao_valor": 1.00,
                "cotacao_total": 22.93,
                "retorno_potencial": 229.30,
                "tipo": "M",
                "cliente_nome": "Dayane",
                "cliente_telefone": "(11) 98765-0001",
                "itens": [
                    {"jogo": "Bahia x Vasco", "palpite": "Bahia Vence", "odd": 1.85},
                    {"jogo": "Fortaleza x Ceará", "palpite": "Ambas Marcam", "odd": 1.90},
                    {"jogo": "Criciúma x Juventude", "palpite": "Menos de 2.5 Gols", "odd": 1.65},
                    {"jogo": "Fluminense x Botafogo", "palpite": "Botafogo Vence", "odd": 2.30}
                ]
            },
            {
                "codigo": "DAY7-M33H",
                "data_formatada": "07/10/2026 11:20:38",
                "status": "Aberto",
                "valor_apostado": 15.00,
                "comissao_valor": 1.50,
                "cotacao_total": 119.98,
                "retorno_potencial": 1799.70,
                "tipo": "M",
                "cliente_nome": "Juzana",
                "cliente_telefone": "(11) 98765-0002",
                "itens": [
                    {"jogo": "São Paulo x Vitória", "palpite": "São Paulo Vence", "odd": 1.55},
                    {"jogo": "Cruzeiro x Grêmio", "palpite": "Empate", "odd": 3.20},
                    {"jogo": "Vasco x Botafogo", "palpite": "+2.5 Gols", "odd": 2.10},
                    {"jogo": "Santos x Novorizontino", "palpite": "Santos Vence", "odd": 1.65},
                    {"jogo": "Sport x Coritiba", "palpite": "Sport Vence", "odd": 2.10},
                    {"jogo": "Avaí x Chapecoense", "palpite": "Ambas Marcam", "odd": 1.95}
                ]
            },
            {
                "codigo": "T7K4-HJOD",
                "data_formatada": "07/10/2026 11:14:40",
                "status": "Aberto",
                "valor_apostado": 10.00,
                "comissao_valor": 1.00,
                "cotacao_total": 190.34,
                "retorno_potencial": 1903.40,
                "tipo": "M",
                "cliente_nome": "Henrique Gabriel",
                "cliente_telefone": "(11) 98765-3333",
                "itens": [
                    {"jogo": "Milan x Juventus", "palpite": "Empate", "odd": 3.20},
                    {"jogo": "Roma x Lazio", "palpite": "Roma Vence", "odd": 2.35},
                    {"jogo": "Napoli x Atalanta", "palpite": "+2.5 Gols", "odd": 1.85},
                    {"jogo": "Atlético de Madrid x Sevilla", "palpite": "Atlético Vence", "odd": 1.60},
                    {"jogo": "Villarreal x Valencia", "palpite": "Ambas Marcam", "odd": 1.80},
                    {"jogo": "Betis x Real Sociedad", "palpite": "+1.5 Gols", "odd": 1.40}
                ]
            },
            {
                "codigo": "L6A5-0DO1",
                "data_formatada": "07/10/2026 11:09:49",
                "status": "Perdeu",
                "valor_apostado": 10.00,
                "comissao_valor": 1.00,
                "cotacao_total": 10.79,
                "retorno_potencial": 107.90,
                "tipo": "M",
                "cliente_nome": "Raisson Rodrigues",
                "cliente_telefone": "(11) 98765-0003",
                "itens": [
                    {"jogo": "Chelsea x Everton", "palpite": "Chelsea Vence", "odd": 1.50},
                    {"jogo": "Tottenham x Wolves", "palpite": "Tottenham Vence (Errou)", "odd": 1.65},
                    {"jogo": "Dortmund x Wolfsburg", "palpite": "+2.5 Gols", "odd": 1.60},
                    {"jogo": "Lille x Monaco", "palpite": "Ambas Marcam", "odd": 1.80}
                ]
            },
            {
                "codigo": "1MNW-Z401",
                "data_formatada": "07/10/2026 10:54:14",
                "status": "Aberto",
                "valor_apostado": 10.00,
                "comissao_valor": 1.00,
                "cotacao_total": 51.54,
                "retorno_potencial": 515.40,
                "tipo": "M",
                "cliente_nome": "Pablo Muniz",
                "cliente_telefone": "(11) 98765-0004",
                "itens": [
                    {"jogo": "Corinthians x Athletico-PR", "palpite": "Corinthians Vence", "odd": 1.95},
                    {"jogo": "Internacional x Cuiabá", "palpite": "Inter Vence", "odd": 1.50},
                    {"jogo": "Bahia x Atlético-MG", "palpite": "Empate", "odd": 3.10},
                    {"jogo": "Juventude x Vasco", "palpite": "Ambas Marcam", "odd": 1.90},
                    {"jogo": "Criciúma x Vitória", "palpite": "+1.5 Gols", "odd": 1.40}
                ]
            },
            {
                "codigo": "5BD1-RX70",
                "data_formatada": "06/10/2026 21:00:22",
                "status": "Ganhou",
                "valor_apostado": 30.00,
                "comissao_valor": 3.00,
                "cotacao_total": 18.40,
                "retorno_potencial": 552.00,
                "tipo": "M",
                "cliente_nome": "Juan Pablo",
                "cliente_telefone": "(11) 98765-0005",
                "itens": [
                    {"jogo": "São Paulo FC x Coritiba", "palpite": "São Paulo Vence (Acertou)", "odd": 1.60},
                    {"jogo": "Flamengo x Fluminense", "palpite": "Ambas Marcam (Acertou)", "odd": 1.80},
                    {"jogo": "Palmeiras x Santos", "palpite": "Palmeiras Vence (Acertou)", "odd": 1.55},
                    {"jogo": "Grêmio x Internacional", "palpite": "Menos de 2.5 Gols (Acertou)", "odd": 1.70},
                    {"jogo": "Cruzeiro x Vasco", "palpite": "Cruzeiro Vence (Acertou)", "odd": 1.95}
                ]
            },
            {
                "codigo": "C5NK-7Z8C",
                "data_formatada": "06/10/2026 20:52:42",
                "status": "Ganhou",
                "valor_apostado": 20.00,
                "comissao_valor": 2.00,
                "cotacao_total": 13.72,
                "retorno_potencial": 274.40,
                "tipo": "M",
                "cliente_nome": "Raisson Rodrigues",
                "cliente_telefone": "(11) 98765-0003",
                "itens": [
                    {"jogo": "Real Madrid x Celta Vigo", "palpite": "Real Vence (Acertou)", "odd": 1.35},
                    {"jogo": "Barcelona x Sevilla", "palpite": "Barcelona Vence (Acertou)", "odd": 1.45},
                    {"jogo": "Bayern x Stuttgart", "palpite": "+2.5 Gols (Acertou)", "odd": 1.40},
                    {"jogo": "Man City x Wolves", "palpite": "City Vence (Acertou)", "odd": 1.25},
                    {"jogo": "PSG x Rennes", "palpite": "PSG Vence (Acertou)", "odd": 1.40},
                    {"jogo": "Porto x Boavista", "palpite": "Porto Vence (Acertou)", "odd": 1.30},
                    {"jogo": "Benfica x Rio Ave", "palpite": "Benfica Vence (Acertou)", "odd": 1.35}
                ]
            }
        ]

        for b_data in bilhetes_foto:
            novo_b = Bilhete(
                codigo=b_data["codigo"],
                data_formatada=b_data["data_formatada"],
                status=b_data["status"],
                valor_apostado=b_data["valor_apostado"],
                comissao_valor=b_data["comissao_valor"],
                cotacao_total=b_data["cotacao_total"],
                retorno_potencial=b_data["retorno_potencial"],
                tipo=b_data["tipo"],
                cliente_nome=b_data["cliente_nome"],
                cliente_telefone=b_data["cliente_telefone"],
                cambista_id=c_id,
                itens_json=json.dumps(b_data["itens"], ensure_ascii=False),
                hash_seguranca=f"SEC-{b_data['codigo']}-{datetime.utcnow().strftime('%y%m%d')}",
                chave_pix_usada="11999999999",
                validado_por="Kevin Cambista"
            )
            db.add(novo_b)
            
            # Atualiza cliente
            cli = db.query(Cliente).filter(Cliente.nome == b_data["cliente_nome"]).first()
            if not cli:
                cli = Cliente(
                    nome=b_data["cliente_nome"],
                    telefone=b_data["cliente_telefone"],
                    total_apostado=b_data["valor_apostado"],
                    total_bilhetes=1
                )
                db.add(cli)
            else:
                cli.total_apostado += b_data["valor_apostado"]
                cli.total_bilhetes += 1

        db.commit()

    db.close()
    print("[DATABASE] Tabelas e sementes inicializadas com sucesso!")


if __name__ == "__main__":
    init_db()
