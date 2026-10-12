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
    """Cria tabelas e configurações padrão da banca (sem dados demo)."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    configs_padrao = {
        "whatsapp_dono": "5511999999999",
        "chave_pix": "11999999999",
        "nome_banca": "FUTBET",
        "comissao_padrao": "10.0",
        "limite_padrao_cambista": "2000.00",
        "senha_admin": "admin123",
    }

    for k, v in configs_padrao.items():
        if not db.query(Configuracao).filter(Configuracao.chave == k).first():
            db.add(Configuracao(chave=k, valor=v))
    db.commit()

    db.close()
    print("[DATABASE] Tabelas e configurações inicializadas.")


if __name__ == "__main__":
    init_db()
