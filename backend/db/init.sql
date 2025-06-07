-- Crear tabla usuarios primero
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    rol VARCHAR(20) CHECK (rol IN ('cajero', 'supervisor', 'director')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tablas clientes y promotores, que dependen de usuarios
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    creado_por INT REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE promotores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    fondo_disponible DECIMAL(10,2) DEFAULT 50000.00,
    creado_por INT REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla vales, que depende de clientes, promotores y usuarios
CREATE TABLE vales (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes(id),
    promotor_id INT REFERENCES promotores(id),
    cajero_id INT REFERENCES usuarios(id),
    monto DECIMAL(10,2),
    interes DECIMAL(5,2),
    pagos_totales INT,
    primer_pago DATE,
    ultimo_pago DATE,
    pago_mensual DECIMAL(10,2),
    expediente TEXT,
    condiciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla pagos, que depende de vales
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    vale_id INT REFERENCES vales(id),
    monto DECIMAL(10,2),
    fecha_pago DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuarios iniciales
INSERT INTO usuarios (username, password, rol)
VALUES
    ('cajero1', '$2b$12$mGhYnu49d2IkQ.7CMGE6Te8To8poBgQZjOMq6/8o.aXZwGnWcPlBG', 'cajero'),
    ('supervisor1', '$2b$12$mGhYnu49d2IkQ.7CMGE6Te8To8poBgQZjOMq6/8o.aXZwGnWcPlBG', 'supervisor'),
    ('director1', '$2b$12$mGhYnu49d2IkQ.7CMGE6Te8To8poBgQZjOMq6/8o.aXZwGnWcPlBG', 'director');