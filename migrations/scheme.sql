/* I added an index for faster username lookups, and index for refresh token lookups (for the first 255 chars) */

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    refresh_token TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_refresh_token ON users(refresh_token(255));

CREATE TABLE IF NOT EXISTS positions (
  position_id INT AUTO_INCREMENT PRIMARY KEY,
  position_code VARCHAR(100) NOT NULL,
  position_name VARCHAR(300) NOT NULL,
  id INT NOT NULL,
  CONSTRAINT fk_positions_user FOREIGN KEY (id) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_positions_user (id)
);