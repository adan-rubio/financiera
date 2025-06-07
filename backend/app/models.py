# backend/app/models.py
from pydantic import BaseModel

class Vale(BaseModel):
    cliente_id: int
    promotor_id: int
    monto: float
    interes: float
    pagos: int
    expediente: str
    condiciones: str

class User(BaseModel):
    username: str
    rol: str

class Cliente(BaseModel):
    nombre: str

class Promotor(BaseModel):
    nombre: str
    fondo_disponible: float = 50000.00

class Cajero(BaseModel):
    username: str
    password: str