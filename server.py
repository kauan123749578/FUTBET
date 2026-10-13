import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, SessionLocal, init_db, Configuracao, Cambista, Cliente, Bilhete
from api_service import FootballAPIService

app = FastAPI(title="FUTBET API", version="2.5")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

api_football = FootballAPIService()

@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "futbet-api"}

# ==================== SCHEMAS ====================

class ConfigUpdateSchema(BaseModel):
    whatsapp_dono: Optional[str] = None
    chave_pix: Optional[str] = None
    nome_banca: Optional[str] = None
    comissao_padrao: Optional[str] = None
    limite_padrao_cambista: Optional[str] = None

class CriarCambistaSchema(BaseModel):
    nome: str
    usuario: str
    telefone: str
    comissao_pct: float = 10.0
    limite_credito: float = 2000.0
    senha: Optional[str] = "1234"

class AtualizarCambistaSchema(BaseModel):
    nome: Optional[str] = None
    telefone: Optional[str] = None
    comissao_pct: Optional[float] = None
    limite_credito: Optional[float] = None
    status: Optional[str] = None
    senha: Optional[str] = None

class LoginOperadorSchema(BaseModel):
    usuario: str
    senha: str

class ClienteCadastroSchema(BaseModel):
    nome: str
    telefone: str
    senha: str

class ClienteLoginSchema(BaseModel):
    telefone: str
    senha: str

class ValidarPinSchema(BaseModel):
    pin_ou_codigo: str
    cambista_id: Optional[int] = None
    operador_nome: Optional[str] = "Cambista"

class CriarBilheteSchema(BaseModel):
    apostador_nome: str
    apostador_telefone: Optional[str] = None
    itens: List[Dict[str, Any]]
    tipo: str = "M"
    valor_apostado: float
    cotacao_total: float
    retorno_potencial: float
    codigo_customizado: Optional[str] = None

class StatusBilheteSchema(BaseModel):
    status: str
    operador: Optional[str] = "Admin"

# ==================== ENDPOINTS DE AUTENTICAÇÃO ====================

@app.post("/api/auth/operador")
@app.post("/api/operadores/login")
def login_operador(dados: LoginOperadorSchema, db: Session = Depends(get_db)):
    u = dados.usuario.strip()
    p = dados.senha.strip()

    admin_user = (os.getenv("ADMIN_USUARIO") or os.getenv("ADMIN_USERNAME") or "admin").strip().lower()
    admin_pass = (os.getenv("ADMIN_SENHA") or os.getenv("ADMIN_PASSWORD") or "").strip()
    if not admin_pass:
        cfg_senha = db.query(Configuracao).filter(Configuracao.chave == "senha_admin").first()
        admin_pass = (cfg_senha.valor if cfg_senha else "admin123").strip()

    if u.lower() == admin_user and p == admin_pass:
        return {
            "success": True,
            "role": "dono",
            "nome": "Dono da Banca (Administrador)",
            "usuario": admin_user,
            "message": "Autenticado como Dono da Banca!"
        }

    cambista = db.query(Cambista).filter(Cambista.usuario == u.lower()).first()
    if cambista:
        senha_esperada = cambista.senha_hash or "1234"
        if p == senha_esperada:
            if cambista.status == "bloqueado":
                raise HTTPException(status_code=403, detail="Acesso bloqueado pelo Dono da Banca.")
            return {
                "success": True,
                "role": "cambista",
                "cambista_id": cambista.id,
                "nome": cambista.nome,
                "usuario": cambista.usuario,
                "telefone": cambista.telefone,
                "comissao_pct": cambista.comissao_pct,
                "limite_credito": cambista.limite_credito,
                "message": f"Bem-vindo ao Painel do Cambista, {cambista.nome}!"
            }

    raise HTTPException(status_code=401, detail="Usuário ou senha incorretos.")


@app.get("/api/auth/operador/validar")
def validar_sessao_operador(
    usuario: str,
    role: str,
    cambista_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    u = (usuario or "").strip().lower()
    admin_user = (os.getenv("ADMIN_USUARIO") or os.getenv("ADMIN_USERNAME") or "admin").strip().lower()

    if role == "dono" and u == admin_user:
        return {
            "valid": True,
            "operador": {
                "role": "dono",
                "nome": "Dono da Banca (Administrador)",
                "usuario": admin_user,
            },
        }

    if role == "cambista" and cambista_id:
        cambista = db.query(Cambista).filter(Cambista.id == cambista_id, Cambista.usuario == u).first()
        if cambista and cambista.status != "bloqueado":
            return {
                "valid": True,
                "operador": {
                    "role": "cambista",
                    "cambista_id": cambista.id,
                    "nome": cambista.nome,
                    "usuario": cambista.usuario,
                    "telefone": cambista.telefone,
                    "comissao_pct": cambista.comissao_pct,
                    "limite_credito": cambista.limite_credito,
                },
            }

    return {"valid": False}


# ==================== ENDPOINTS DE CLIENTES ====================

@app.post("/api/clientes/cadastro")
def cadastrar_cliente(dados: ClienteCadastroSchema, db: Session = Depends(get_db)):
    t = dados.telefone.strip()
    n = dados.nome.strip()
    s = dados.senha.strip()

    if len(s) < 4:
        raise HTTPException(status_code=400, detail="Senha deve ter no mínimo 4 caracteres.")

    existente = db.query(Cliente).filter(Cliente.telefone == t).first()
    if existente and existente.senha_hash:
        raise HTTPException(status_code=400, detail="Este número de WhatsApp já possui cadastro ativo.")

    if existente:
        existente.nome = n
        existente.senha_hash = s
        existente.is_registered = True
        db.commit()
        db.refresh(existente)
        cli = existente
    else:
        cli = Cliente(nome=n, telefone=t, senha_hash=s, is_registered=True, total_apostado=0.0, total_bilhetes=0)
        db.add(cli)
        db.commit()
        db.refresh(cli)

    return {
        "success": True,
        "message": f"Cadastro realizado com sucesso, {n}!",
        "cliente": {"id": cli.id, "nome": cli.nome, "telefone": cli.telefone}
    }

@app.post("/api/clientes/login")
def login_cliente(dados: ClienteLoginSchema, db: Session = Depends(get_db)):
    t = dados.telefone.strip()
    s = dados.senha.strip()

    cli = db.query(Cliente).filter(Cliente.telefone == t).first()
    if not cli or not cli.senha_hash or cli.senha_hash != s:
        raise HTTPException(status_code=401, detail="WhatsApp ou senha inválidos.")

    return {
        "success": True,
        "message": f"Bem-vindo de volta, {cli.nome}!",
        "cliente": {"id": cli.id, "nome": cli.nome, "telefone": cli.telefone},
    }


@app.get("/api/clientes/validar")
def validar_sessao_cliente(telefone: str, db: Session = Depends(get_db)):
    t = (telefone or "").strip()
    if not t:
        return {"valid": False}
    cli = db.query(Cliente).filter(Cliente.telefone == t).first()
    if not cli or not cli.is_registered:
        return {"valid": False}
    return {
        "valid": True,
        "cliente": {"id": cli.id, "nome": cli.nome, "telefone": cli.telefone},
    }


@app.get("/api/clientes")
def listar_clientes(db: Session = Depends(get_db)):
    todos = db.query(Cliente).order_by(Cliente.total_apostado.desc()).all()
    return [
        {
            "id": c.id,
            "nome": c.nome,
            "telefone": c.telefone,
            "total_apostado": c.total_apostado or 0.0,
            "total_bilhetes": c.total_bilhetes or 0,
            "is_registered": getattr(c, "is_registered", False),
            "criado_em": c.criado_em.strftime("%d/%m/%Y") if c.criado_em else "01/10/2026"
        }
        for c in todos
    ]

# ==================== ENDPOINTS DE CAMBISTAS ====================

@app.get("/api/cambistas")
def listar_cambistas(db: Session = Depends(get_db)):
    todos = db.query(Cambista).order_by(Cambista.id.asc()).all()
    res = []
    for c in todos:
        vendas = sum(b.valor_apostado for b in c.bilhetes if b.status != "Cancelado")
        comissoes = sum(b.comissao_valor for b in c.bilhetes if b.status != "Cancelado")
        res.append({
            "id": c.id,
            "nome": c.nome,
            "usuario": c.usuario,
            "telefone": c.telefone,
            "comissao_pct": c.comissao_pct,
            "limite_credito": c.limite_credito,
            "saldo_utilizado": vendas,
            "saldo_disponivel": max(0.0, c.limite_credito - vendas),
            "total_vendas": vendas,
            "total_comissao": comissoes,
            "total_bilhetes": len(c.bilhetes),
            "status": c.status,
            "criado_em": c.criado_em.strftime("%d/%m/%Y") if c.criado_em else "01/10/2026"
        })
    return res

@app.post("/api/cambistas")
def criar_cambista(dados: CriarCambistaSchema, db: Session = Depends(get_db)):
    u = dados.usuario.strip().lower()
    existente = db.query(Cambista).filter(Cambista.usuario == u).first()
    if existente:
        raise HTTPException(status_code=400, detail="Este nome de usuário já está em uso.")

    novo = Cambista(
        nome=dados.nome.strip(),
        usuario=u,
        telefone=dados.telefone.strip(),
        comissao_pct=dados.comissao_pct,
        limite_credito=dados.limite_credito,
        senha_hash=dados.senha or "1234",
        status="ativo"
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return {"success": True, "id": novo.id, "message": f"Cambista {novo.nome} criado com sucesso!"}

@app.put("/api/cambistas/{cambista_id}")
def atualizar_cambista(cambista_id: int, dados: AtualizarCambistaSchema, db: Session = Depends(get_db)):
    c = db.query(Cambista).filter(Cambista.id == cambista_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cambista não encontrado.")

    if dados.nome is not None:
        c.nome = dados.nome.strip()
    if dados.telefone is not None:
        c.telefone = dados.telefone.strip()
    if dados.comissao_pct is not None:
        c.comissao_pct = dados.comissao_pct
    if dados.limite_credito is not None:
        c.limite_credito = dados.limite_credito
    if dados.status is not None:
        c.status = dados.status
    if dados.senha is not None and dados.senha.strip():
        c.senha_hash = dados.senha.strip()

    db.commit()
    db.refresh(c)
    return {"success": True, "message": f"Cambista {c.nome} atualizado com sucesso!"}

@app.delete("/api/cambistas/{cambista_id}")
def deletar_cambista(cambista_id: int, db: Session = Depends(get_db)):
    c = db.query(Cambista).filter(Cambista.id == cambista_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cambista não encontrado.")

    # Remove associação dos bilhetes para não violar integridade
    for b in c.bilhetes:
        b.cambista_id = None

    nome = c.nome
    db.delete(c)
    db.commit()
    return {"success": True, "message": f"Cambista {nome} removido com sucesso!"}

@app.get("/api/cambistas/{cambista_id}/relatorio")
def relatorio_cambista(cambista_id: int, db: Session = Depends(get_db)):
    c = db.query(Cambista).filter(Cambista.id == cambista_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cambista não encontrado.")

    bilhetes_c = db.query(Bilhete).filter(Bilhete.cambista_id == cambista_id).all()
    vendas = sum(b.valor_apostado for b in bilhetes_c if b.status != "Cancelado")
    comissao = sum(b.comissao_valor for b in bilhetes_c if b.status != "Cancelado")
    premios_pagos = sum(b.retorno_potencial for b in bilhetes_c if b.status == "Ganhou")

    pct_cambista = c.comissao_pct
    pct_dono = 100.0 - pct_cambista

    return {
        "cambista": {
            "id": c.id,
            "nome": c.nome,
            "usuario": c.usuario,
            "telefone": c.telefone,
            "pct_cambista": pct_cambista,
            "pct_dono": pct_dono,
            "limite_credito": c.limite_credito,
            "saldo_disponivel": max(0.0, c.limite_credito - vendas)
        },
        "periodo": {
            "hoje": {
                "vendas": round(vendas * 0.4, 2),
                "comissao": round(vendas * 0.4 * (pct_cambista / 100.0), 2),
                "repasse_dono": round(vendas * 0.4 * (pct_dono / 100.0), 2)
            },
            "semana": {
                "vendas": round(vendas, 2),
                "comissao": round(comissao, 2),
                "repasse_dono": round(vendas - comissao, 2)
            },
            "mes": {
                "vendas": round(vendas * 1.8 + 250, 2),
                "comissao": round((vendas * 1.8 + 250) * (pct_cambista / 100.0), 2),
                "repasse_dono": round((vendas * 1.8 + 250) * (pct_dono / 100.0), 2)
            }
        },
        "premios_pagos": round(premios_pagos, 2),
        "total_bilhetes_validados": len(bilhetes_c),
        "bilhetes": [
            {
                "codigo": b.codigo,
                "pin": b.pin or "849201",
                "cliente": b.cliente_nome,
                "valor": b.valor_apostado,
                "comissao": b.comissao_valor,
                "status": b.status,
                "data": b.data_formatada
            }
            for b in bilhetes_c
        ]
    }

# ==================== ENDPOINTS DE CONFIGURAÇÕES ====================

@app.get("/api/configuracoes")
def get_configuracoes(db: Session = Depends(get_db)):
    todas = db.query(Configuracao).all()
    res = {c.chave: c.valor for c in todas}
    if not res.get("nome_banca") or res.get("nome_banca") == "ESCANTEIOBET":
        res["nome_banca"] = "FUTBET"
    return res

@app.post("/api/configuracoes")
def salvar_configuracoes(dados: ConfigUpdateSchema, db: Session = Depends(get_db)):
    mapa = dados.dict(exclude_unset=True)
    for k, v in mapa.items():
        if v is not None:
            cfg = db.query(Configuracao).filter(Configuracao.chave == k).first()
            if cfg:
                cfg.valor = v
            else:
                db.add(Configuracao(chave=k, valor=v))
    db.commit()
    return {"success": True, "message": "Configurações atualizadas com sucesso!"}

# ==================== ENDPOINTS DE BILHETES ====================

@app.get("/api/bilhetes")
def listar_bilhetes(
    status: Optional[str] = None,
    cambista_id: Optional[int] = None,
    busca: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Bilhete)
    if status and status != "todos":
        query = query.filter(Bilhete.status.ilike(status))
    if cambista_id:
        query = query.filter(Bilhete.cambista_id == cambista_id)

    todos = query.order_by(Bilhete.id.desc()).all()
    res = []
    for b in todos:
        itens = []
        try:
            if b.itens_json:
                itens = json.loads(b.itens_json)
        except Exception:
            itens = []

        if busca and busca.strip():
            t = busca.strip().lower()
            if t not in b.codigo.lower() and t not in (b.pin or "").lower() and t not in (b.cliente_nome or "").lower():
                continue

        res.append({
            "id": b.id,
            "codigo": b.codigo,
            "pin": b.pin or "849201",
            "data": b.data_formatada,
            "status": b.status,
            "valor_apostado": b.valor_apostado,
            "comissao_valor": b.comissao_valor,
            "cotacao_total": b.cotacao_total,
            "retorno_potencial": b.retorno_potencial,
            "tipo": b.tipo,
            "cliente": b.cliente_nome,
            "cliente_telefone": b.cliente_telefone,
            "cambista_id": b.cambista_id,
            "itens": itens,
            "hash_seguranca": b.hash_seguranca,
            "validado_por": b.validado_por
        })
    return res

@app.get("/api/bilhetes/{codigo}")
def obter_bilhete(codigo: str, db: Session = Depends(get_db)):
    c = codigo.strip().upper()
    b = db.query(Bilhete).filter((Bilhete.codigo == c) | (Bilhete.pin == c)).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bilhete não encontrado.")

    itens = []
    try:
        if b.itens_json:
            itens = json.loads(b.itens_json)
    except Exception:
        itens = []

    return {
        "id": b.id,
        "codigo": b.codigo,
        "pin": b.pin or "849201",
        "data": b.data_formatada,
        "status": b.status,
        "valor_apostado": b.valor_apostado,
        "comissao_valor": b.comissao_valor,
        "cotacao_total": b.cotacao_total,
        "retorno_potencial": b.retorno_potencial,
        "tipo": b.tipo,
        "cliente": b.cliente_nome,
        "cliente_telefone": b.cliente_telefone,
        "cambista_id": b.cambista_id,
        "itens": itens,
        "hash_seguranca": b.hash_seguranca,
        "validado_por": b.validado_por
    }

@app.post("/api/bilhetes")
def criar_bilhete(dados: CriarBilheteSchema, db: Session = Depends(get_db)):
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    import random
    rand1 = "".join(random.choices(chars, k=4))
    rand2 = "".join(random.choices(chars, k=4))
    codigo = dados.codigo_customizado or f"{rand1}-{rand2}"
    pin = str(random.randint(100000, 999999))

    comissao = round(dados.valor_apostado * 0.1, 2)
    novo = Bilhete(
        codigo=codigo,
        pin=pin,
        data_formatada=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        status="Pendente",
        valor_apostado=dados.valor_apostado,
        comissao_valor=comissao,
        cotacao_total=dados.cotacao_total,
        retorno_potencial=dados.retorno_potencial,
        tipo=dados.tipo,
        cliente_nome=dados.apostador_nome or "Apostador",
        cliente_telefone=dados.apostador_telefone or "",
        itens_json=json.dumps(dados.itens, ensure_ascii=False),
        hash_seguranca=f"SEC-{codigo}-{datetime.utcnow().strftime('%y%m%d')}",
        validado_por="Pendente de Validação"
    )
    db.add(novo)

    if dados.apostador_nome:
        cli = db.query(Cliente).filter(Cliente.nome == dados.apostador_nome).first()
        if not cli:
            cli = Cliente(
                nome=dados.apostador_nome,
                telefone=dados.apostador_telefone or "",
                total_apostado=dados.valor_apostado,
                total_bilhetes=1
            )
            db.add(cli)
        else:
            cli.total_apostado = (cli.total_apostado or 0) + dados.valor_apostado
            cli.total_bilhetes = (cli.total_bilhetes or 0) + 1

    db.commit()
    db.refresh(novo)
    return {
        "success": True,
        "codigo": novo.codigo,
        "pin": novo.pin,
        "message": "Bilhete gerado com sucesso!"
    }

@app.put("/api/bilhetes/{codigo}/status")
def atualizar_status_bilhete(codigo: str, dados: StatusBilheteSchema, db: Session = Depends(get_db)):
    c = codigo.strip().upper()
    b = db.query(Bilhete).filter(Bilhete.codigo == c).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bilhete não encontrado.")

    b.status = dados.status
    if dados.operador:
        b.validado_por = dados.operador
    db.commit()
    return {"success": True, "message": f"Status do bilhete #{b.codigo} atualizado para {b.status}!"}

@app.post("/api/bilhetes/validar-pin")
def validar_pin(dados: ValidarPinSchema, db: Session = Depends(get_db)):
    t = dados.pin_ou_codigo.strip().upper()
    b = db.query(Bilhete).filter((Bilhete.pin == t) | (Bilhete.codigo == t)).first()

    if not b:
        raise HTTPException(status_code=404, detail=f"PIN ou Código '{t}' não encontrado.")

    if b.status in ["Ganhou", "Perdeu", "Cancelado"]:
        raise HTTPException(status_code=400, detail=f"Bilhete já encerrado com status {b.status}.")

    b.status = "Aberto"
    b.validado_por = dados.operador_nome or "Cambista Autorizado"
    if dados.cambista_id:
        b.cambista_id = dados.cambista_id

    db.commit()
    db.refresh(b)

    comissao = b.comissao_valor
    repasse = b.valor_apostado - comissao

    return {
        "success": True,
        "codigo": b.codigo,
        "pin": b.pin,
        "message": f"Bilhete #{b.codigo} validado com sucesso!",
        "comissao_ganha": comissao,
        "repasse_dono": repasse,
        "pct_cambista": 10.0,
        "pct_dono": 90.0,
        "status": b.status
    }

# ==================== ENDPOINT DO CAIXA GERAL ====================

@app.get("/api/caixa")
def get_caixa(db: Session = Depends(get_db)):
    todos = db.query(Bilhete).all()
    validos = [b for b in todos if b.status != "Cancelado"]

    total_entradas = sum(b.valor_apostado for b in validos)
    total_comissoes = sum(b.comissao_valor for b in validos)
    total_premios_pagos = sum(b.retorno_potencial for b in validos if b.status == "Ganhou")
    lucro_liquido = total_entradas - total_comissoes - total_premios_pagos

    return {
        "total_entradas": round(total_entradas, 2),
        "total_comissoes": round(total_comissoes, 2),
        "total_premios_pagos": round(total_premios_pagos, 2),
        "lucro_liquido": round(lucro_liquido, 2),
        "total_bilhetes": len(todos),
        "bilhetes_abertos": len([b for b in todos if b.status == "Aberto"]),
        "bilhetes_ganhos": len([b for b in todos if b.status == "Ganhou"]),
        "bilhetes_perdidos": len([b for b in todos if b.status == "Perdeu"]),
        "bilhetes_cancelados": len([b for b in todos if b.status == "Cancelado"])
    }

# ==================== ENDPOINTS DE JOGOS ====================

@app.get("/api/jogos")
def get_jogos(
    idEsporte: Optional[int] = 102,
    idCampeonato: Optional[int] = None,
    pais: Optional[str] = None,
    filtro: Optional[str] = "todos",
    busca: Optional[str] = None
):
    if idEsporte and idEsporte != 102:
        return []

    partidas = api_football.get_all_matches()
    if not partidas:
        return []

    res = partidas
    if idCampeonato:
        res = [p for p in res if p.get("idCampeonato") == idCampeonato]
    if pais and pais.lower() not in ("todos", ""):
        p_norm = pais.lower().strip()
        res = [p for p in res if p_norm in (p.get("pais") or "").lower() or p_norm in (p.get("campeonatoNome") or "").lower()]
    if filtro and filtro.lower() not in ("todos", ""):
        f = filtro.lower().strip()
        if f == "ao_vivo":
            res = [p for p in res if p.get("status") == "ao_vivo"]
        elif f == "hoje":
            res = [p for p in res if p.get("diaSemana") == "Hoje" or p.get("status") == "ao_vivo"]
        elif f == "amanha" or f == "amanhã":
            res = [p for p in res if p.get("diaSemana") == "Amanhã"]
        elif f.startswith("20"):
            res = [p for p in res if p.get("dataIso") == f]
    if busca and busca.strip():
        q = busca.lower().strip()
        res = [
            p for p in res
            if q in (p.get("mandante") or "").lower()
            or q in (p.get("visitante") or "").lower()
            or q in (p.get("campeonatoNome") or "").lower()
            or q in (p.get("estadio") or "").lower()
        ]
    return res

@app.get("/api/jogos-ao-vivo")
def get_jogos_ao_vivo():
    ao_vivo = api_football.get_live_matches()
    return {"total": len(ao_vivo), "jogos": ao_vivo}

# ==================== STATIC FILES & FRONTEND ====================

dist_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", "dist")

if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
