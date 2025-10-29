-- MAIN DATABASE (PostgreSQL version for Supabase)

-- 1. Companies (Entertainment Agencies)
CREATE TABLE IF NOT EXISTS companies (
    company_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    headquarters VARCHAR(150),
    founded_year INTEGER,
    ceo_name VARCHAR(150)
);

-- 2. Artists
CREATE TABLE IF NOT EXISTS artists (
    artist_id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    debut_year INTEGER,
    fandom_name VARCHAR(100),
    CONSTRAINT fk_artist_company FOREIGN KEY (company_id)
        REFERENCES companies(company_id)
);

-- 3. Albums
CREATE TABLE IF NOT EXISTS albums (
    album_id SERIAL PRIMARY KEY,
    artist_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    release_date DATE,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    CONSTRAINT fk_album_artist FOREIGN KEY (artist_id)
        REFERENCES artists(artist_id)
);

-- 4. Users
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Orders
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID','SHIPPED','CANCELLED')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

-- 6. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    album_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_orderitem_order FOREIGN KEY (order_id)
        REFERENCES orders(order_id),
    CONSTRAINT fk_orderitem_album FOREIGN KEY (album_id)
        REFERENCES albums(album_id)
);

-- 7. Payments
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(20) CHECK (method IN ('CREDIT_CARD','PAYPAL','GCASH','BANK_TRANSFER')),
    amount DECIMAL(10,2),
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
);

-- Sample data for companies
INSERT INTO companies (name, headquarters, founded_year, ceo_name)
VALUES 
('SM Entertainment', 'Seoul, South Korea', 1995, 'Lee Sung-soo'),
('JYP Entertainment', 'Seoul, South Korea', 1997, 'Park Jin-young'),
('YG Entertainment', 'Seoul, South Korea', 1996, 'Hwang Bo-kyung');

-- Sample data for artists
INSERT INTO artists (company_id, name, debut_year, fandom_name)
VALUES 
(1, 'EXO', 2012, 'EXO-L'),
(1, 'Red Velvet', 2014, 'ReVeluv'),
(2, 'TWICE', 2015, 'ONCE'),
(2, 'Stray Kids', 2018, 'STAY'),
(3, 'BLACKPINK', 2016, 'BLINK');

-- Sample data for albums
INSERT INTO albums (artist_id, title, release_date, price, stock_quantity)
VALUES 
(1, 'EXIST', '2023-07-10', 15.99, 100),
(1, 'Don''t Fight the Feeling', '2021-06-07', 14.99, 50),
(2, 'The ReVe Festival 2022', '2022-08-16', 16.99, 75),
(2, 'Feel My Rhythm', '2022-03-21', 15.99, 60),
(3, 'Formula of Love', '2021-11-12', 17.99, 80),
(3, 'Taste of Love', '2021-06-11', 16.99, 90),
(4, '5-STAR', '2023-06-02', 18.99, 120),
(4, 'MAXIDENT', '2022-10-07', 17.99, 100),
(5, 'BORN PINK', '2022-09-16', 19.99, 150),
(5, 'The Album', '2020-10-02', 18.99, 130);

-- Sample data for users
INSERT INTO users (username, email, password_hash)
VALUES 
('kpop_fan123', 'fan123@email.com', 'hashed_password_1'),
('music_lover', 'music@email.com', 'hashed_password_2'),
('collector99', 'collector@email.com', 'hashed_password_3');

-- Sample data for orders
INSERT INTO orders (user_id, order_date, status, total_amount)
VALUES 
(1, '2024-01-15 10:30:00', 'PAID', 47.97),
(2, '2024-01-20 14:15:00', 'SHIPPED', 35.98),
(3, '2024-02-05 09:45:00', 'PAID', 56.97);

-- Sample data for order items
INSERT INTO order_items (order_id, album_id, quantity, price)
VALUES 
(1, 1, 2, 15.99),
(1, 3, 1, 16.99),
(2, 5, 2, 17.99),
(3, 9, 2, 19.99),
(3, 2, 1, 14.99);

-- Sample data for payments
INSERT INTO payments (order_id, payment_date, method, amount)
VALUES 
(1, '2024-01-15 10:35:00', 'CREDIT_CARD', 47.97),
(2, '2024-01-20 14:20:00', 'PAYPAL', 35.98),
(3, '2024-02-05 09:50:00', 'GCASH', 56.97);
