CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100),
  description TEXT,
  trainer_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
