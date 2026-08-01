CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  age INT,
  height FLOAT,
  weight FLOAT,
  gender VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Örnek veri ekleme
INSERT INTO users (name, email, age, height, weight, gender)
VALUES ('Test User', 'test@example.com', 28, 175.5, 70.2, 'male');
