from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from .database import get_db
from .models import Vale, User, Cliente, Promotor, Cajero
import psycopg2
from psycopg2.extras import RealDictCursor
from .auth import verify_token, create_access_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://financiera.tu-dominio.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

class TokenData(BaseModel):
    username: str
    rol: str

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM usuarios WHERE username = %s", (form_data.username,))
    user = cur.fetchone()
    cur.close()
    if not user or not pwd_context.verify(form_data.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
    access_token = create_access_token(data={"sub": user["username"], "rol": user["rol"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/user")
async def get_user(token: str = Depends(oauth2_scheme)):
    try:
        credentials = verify_token(token)
        return {"username": credentials["sub"], "rol": credentials["rol"]}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

@app.get("/api/promotores")
async def get_promotores(search: str = "", token: str = Depends(oauth2_scheme)):
    credentials = verify_token(token)
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT id, nombre FROM promotores WHERE nombre ILIKE %s", (f"%{search}%",))
    promotores = cur.fetchall()
    cur.close()
    return promotores

@app.post("/api/promotores")
async def crear_promotor(promotor: Promotor, token: str = Depends(oauth2_scheme)):
    credentials = verify_token(token)
    if credentials["rol"] not in ["supervisor", "director"]:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            "INSERT INTO promotores (nombre, creado_por) VALUES (%s, (SELECT id FROM usuarios WHERE username = %s)) RETURNING id, nombre",
            (promotor.nombre, credentials["sub"])
        )
        result = cur.fetchone()
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=400, detail="Promotor ya existe")
    finally:
        cur.close()
    return result

@app.post("/api/vales")
async def crear_vale(vale: dict, token: str = Depends(oauth2_scheme)):
    credentials = verify_token(token)
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cliente_nombre = vale.get("cliente_nombre")
    promotor_nombre = vale.get("promotor_nombre")
    
    if not cliente_nombre or not promotor_nombre:
        raise HTTPException(status_code=400, detail="Nombre del cliente y promotor son obligatorios")
    
    # Crear o obtener cliente
    cur.execute("SELECT id FROM clientes WHERE nombre = %s", (cliente_nombre,))
    cliente = cur.fetchone()
    if not cliente:
        cur.execute(
            "INSERT INTO clientes (nombre, creado_por) VALUES (%s, (SELECT id FROM usuarios WHERE username = %s)) RETURNING id",
            (cliente_nombre, credentials["sub"])
        )
        cliente = cur.fetchone()
    
    # Obtener promotor
    cur.execute("SELECT id FROM promotores WHERE nombre = %s", (promotor_nombre,))
    promotor = cur.fetchone()
    if not promotor:
        raise HTTPException(status_code=400, detail="Promotor no encontrado")

    if not (1000 <= vale["monto"] <= 10000):
        raise HTTPException(status_code=400, detail="Monto debe estar entre 1000 y 10000")
    primer_pago = datetime.now().date() + timedelta(days=30)
    ultimo_pago = primer_pago + timedelta(days=30 * vale["pagos"])
    interes_total = vale["monto"] * (vale["interes"] / 100)
    pago_mensual = (vale["monto"] + interes_total) / vale["pagos"]
    cur.execute("""
        INSERT INTO vales (cliente_id, promotor_id, cajero_id, monto, interes, pagos_totales, primer_pago, ultimo_pago, pago_mensual, expediente, condiciones)
        VALUES (%s, %s, (SELECT id FROM usuarios WHERE username = %s), %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, cliente_id, promotor_id, cajero_id, monto, interes, pagos_totales, primer_pago, ultimo_pago, pago_mensual, expediente, condiciones
    """, (cliente["id"], promotor["id"], credentials["sub"], vale["monto"], vale["interes"], vale["pagos"], primer_pago, ultimo_pago, pago_mensual, vale["expediente"], vale["condiciones"]))
    result = cur.fetchone()
    conn.commit()
    cur.close()
    return result

@app.post("/api/cajeros")
async def crear_cajero(cajero: Cajero, token: str = Depends(oauth2_scheme), conn=Depends(get_db)):
    credentials = verify_token(token)
    if credentials["rol"] not in ["supervisor", "director"]:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    cur = conn.cursor(cursor_factory=RealDictCursor)
    hashed_password = pwd_context.hash(cajero.password)
    try:
        cur.execute(
            "INSERT INTO usuarios (username, password, rol) VALUES (%s, %s, 'cajero') RETURNING id, username",
            (cajero.username, hashed_password)
        )
        result = cur.fetchone()
        conn.commit()
        return {"message": "Cajero creado exitosamente", "id": result["id"], "username": result["username"]}
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=400, detail="Usuario ya existe")
    finally:
        cur.close()

@app.get("/api/clientes")
async def get_clientes(search: str = "", token: str = Depends(oauth2_scheme)):
    credentials = verify_token(token)
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    if credentials["rol"] == "cajero":
        cur.execute(
            """
            SELECT c.id, c.nombre, u.username AS creado_por, c.created_at
            FROM clientes c
            LEFT JOIN usuarios u ON c.creado_por = u.id
            WHERE c.creado_por = (SELECT id FROM usuarios WHERE username = %s) AND c.nombre ILIKE %s
            """,
            (credentials["sub"], f"%{search}%")
        )
    else:
        cur.execute(
            """
            SELECT c.id, c.nombre, u.username AS creado_por, c.created_at
            FROM clientes c
            LEFT JOIN usuarios u ON c.creado_por = u.id
            WHERE c.nombre ILIKE %s
            """,
            (f"%{search}%",)
        )
    clientes = cur.fetchall()
    cur.close()
    return clientes

@app.get("/api/cajeros")
async def get_cajeros(search: str = "", token: str = Depends(oauth2_scheme)):
    credentials = verify_token(token)
    if credentials["rol"] not in ["supervisor", "director"]:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT id, username as nombre FROM usuarios WHERE rol = 'cajero' AND username ILIKE %s", (f"%{search}%",))
    cajeros = cur.fetchall()
    cur.close()
    return cajeros

@app.delete("/api/cajeros/{cajero_id}", status_code=204)
async def delete_cajero(cajero_id: int, token: str = Depends(oauth2_scheme), conn = Depends(get_db)):
    credentials = verify_token(token)
    if credentials["rol"] not in ["supervisor", "director"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("DELETE FROM usuarios WHERE id = %s AND rol = 'cajero'", (cajero_id,))
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="Cajero no encontrado")
    conn.commit()
    cur.close()
    return

@app.delete("/api/promotores/{promotor_id}", status_code=204)
async def delete_promotor(promotor_id: int, token: str = Depends(oauth2_scheme), conn = Depends(get_db)):
    credentials = verify_token(token)
    if credentials["rol"] not in ["supervisor", "director"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("DELETE FROM promotores WHERE id = %s", (promotor_id,))
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="Promotor no encontrado")
    conn.commit()
    cur.close()
    return

@app.get("/api/dashboard/cajero")
async def get_dashboard_cajero(token: str = Depends(oauth2_scheme)):
    credentials = verify_token(token)
    if credentials["rol"] != "cajero":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT COUNT(*) as total_vales, SUM(monto) as monto_total, SUM(pago_mensual) as pagos_pendientes
        FROM vales WHERE cajero_id = (SELECT id FROM usuarios WHERE username = %s)
    """, (credentials["sub"],))
    data = cur.fetchone()
    cur.execute("""
        SELECT v.id, c.nombre as cliente, p.nombre as promotor, v.monto, v.interes, v.pagos_totales, v.primer_pago, v.ultimo_pago, v.pago_mensual, v.expediente, v.condiciones
        FROM vales v JOIN clientes c ON v.cliente_id = c.id JOIN promotores p ON v.promotor_id = p.id
        WHERE v.cajero_id = (SELECT id FROM usuarios WHERE username = %s)
        LIMIT 10
    """, (credentials["sub"],))
    data["vales"] = cur.fetchall()
    cur.close()
    return data

@app.get("/api/dashboard/supervisor")
async def get_dashboard_supervisor(token: str = Depends(oauth2_scheme)):
    credentials = verify_token(token)
    if credentials["rol"] not in ["supervisor", "director"]:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT SUM(monto) as total_empresa, COUNT(*) as total_vales FROM vales")
    data = cur.fetchone()
    cur.execute("""
        SELECT p.nombre, COUNT(v.id) as total_vales, SUM(v.monto) as monto_total
        FROM promotores p LEFT JOIN vales v ON p.id = v.promotor_id
        GROUP BY p.id, p.nombre
    """)
    data["promotores"] = cur.fetchall()
    cur.execute("""
        SELECT u.username as nombre, COUNT(v.id) as total_vales, SUM(v.monto) as monto_total
        FROM usuarios u LEFT JOIN vales v ON u.id = v.cajero_id
        WHERE u.rol = 'cajero'
        GROUP BY u.id, u.username
    """)
    data["cajeros"] = cur.fetchall()
    cur.close()
    return data

@app.get("/api/dashboard/director")
async def get_dashboard_director(token: str = Depends(oauth2_scheme)):
    credentials = verify_token(token)
    if credentials["rol"] != "director":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT SUM(monto) as total_empresa, COUNT(*) as total_vales, SUM(pago_mensual) as pagos_pendientes
        FROM vales
    """)
    data = cur.fetchone()
    cur.execute("""
        SELECT p.nombre, COUNT(v.id) as total_vales, SUM(v.monto) as monto_total, SUM(v.pago_mensual) as pagos_pendientes
        FROM promotores p LEFT JOIN vales v ON p.id = v.promotor_id
        GROUP BY p.id, p.nombre
    """)
    data["promotores"] = cur.fetchall()
    cur.execute("""
        SELECT u.username as nombre, COUNT(v.id) as total_vales, SUM(v.monto) as monto_total, SUM(v.pago_mensual) as pagos_pendientes
        FROM usuarios u LEFT JOIN vales v ON u.id = v.cajero_id
        WHERE u.rol = 'cajero'
        GROUP BY u.id, u.username
    """)
    data["cajeros"] = cur.fetchall()
    cur.execute("""
        SELECT c.nombre, COUNT(v.id) as total_vales, SUM(v.monto) as monto_total, SUM(v.pago_mensual) as pagos_pendientes
        FROM clientes c LEFT JOIN vales v ON c.id = v.cliente_id
        GROUP BY c.id, c.nombre
    """)
    data["clientes"] = cur.fetchall()
    cur.close()
    return data