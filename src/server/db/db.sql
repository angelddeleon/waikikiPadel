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
    profileImage VARCHAR(255)
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

-- Tabla de Reservaciones
CREATE TABLE reservaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    horario_id INT NOT NULL, 
    status ENUM('pendiente', 'confirmada', 'cancelada', 'terminada') DEFAULT 'pendiente',
    comprobanteImage VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE CASCADE
);

-- Tabla de Pagos
CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reserva_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('efectivo', 'pago movil', 'zelle') NOT NULL,
    payment_proof VARCHAR(255),
    payment_status ENUM('pendiente', 'completado', 'rechazado') DEFAULT 'pendiente',
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (reserva_id) REFERENCES reservaciones(id) ON DELETE CASCADE
);

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
