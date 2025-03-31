-- Crear la base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS waikiki;
USE waikiki;

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,       
    nombre VARCHAR(255) NOT NULL,           
    email VARCHAR(255) NOT NULL UNIQUE,     
    telefono VARCHAR(15),                   
    password VARCHAR(255) NOT NULL,       
    codigoPais VARCHAR(10),                 
    role ENUM('usuario', 'admin') NOT NULL,  
    isBlocked BOOLEAN DEFAULT FALSE        
    perfil VARCHAR(255)
);


-- Tabla de Canchas
CREATE TABLE canchas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL, 
    price_per_hour DECIMAL(10, 2) NOT NULL
);

-- Tabla de Horarios
CREATE TABLE horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cancha_id INT NOT NULL,
    date DATE NOT NULL, 
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    estado ENUM('disponible', 'ocupado') DEFAULT 'disponible',
    FOREIGN KEY (cancha_id) REFERENCES canchas(id) ON DELETE CASCADE
);

-- Tabla de Pagos (actualizada)
CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('efectivo', 'pago movil', 'zelle', 'punto de venta') NOT NULL,
    payment_proof VARCHAR(255),
    payment_status ENUM('pendiente', 'completado', 'rechazado') DEFAULT 'pendiente',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Reservaciones (actualizada)
CREATE TABLE reservaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    horario_id INT NOT NULL,
    pago_id INT,
    status ENUM('pendiente', 'confirmada', 'cancelada', 'terminada') DEFAULT 'pendiente',
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE CASCADE,
    FOREIGN KEY (pago_id) REFERENCES pagos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE clases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    horario_id INT NOT NULL,
    status ENUM('pendiente', 'realizada', 'cancelada') DEFAULT 'pendiente',
    FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tasa (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    monto DECIMAL(10, 2) NOT NULL COMMENT 'Valor de la tasa con 2 decimales',
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT 'Tabla de tasas aplicables';

INSERT INTO usuarios (
    nombre, 
    email, 
    telefono, 
    password, 
    codigoPais, 
    role, 
    isBlocked, 
    perfil
) VALUES (
    'Administrador', 
    'admin@admin.com', 
    '12345678910', 
    'scrypt:32768:8:1$AspUy3lyrVrHDT66$a1aa3cf4b4ed3797bd8bfcd8881b1db7bb0d934004d57b0bfa10eb4c84d261fc62185eb93771b7e1aa2c20a43849a39215592a43b9e6ab64ca284d253fc7cf4b',  -- Reemplazar con hash real
    '+58', 
    'admin', 
    FALSE, 
    null
);

INSERT INTO tasa (monto) VALUES (70.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Cancha 1', '/cancha1.webp', 10.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Cancha 2', '/cancha2.webp', 10.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Cancha 3', '/cancha3.webp', 10.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Cancha 4', '/cancha4.webp', 10.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Cancha 5', '/cancha5.webp', 10.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Cancha 6', '/cancha6.webp', 10.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Cancha 7', '/cancha7.webp', 10.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Cancha Central', '/ccentral.webp', 12.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Estadio 1', '/estadio1.webp', 20.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Estadio 2', '/estadio2.webp', 20.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Individual', '/individual1.webp', 10.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Pickeball 1', '/pickeball1.webp', 10.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Pickeball 2', '/pickeball2.webp', 10.00);

-- Insertar un solo registro
INSERT INTO canchas (name, image, price_per_hour)
VALUES ('Pickeball 3', '/pickeball3.webp', 10.00);
