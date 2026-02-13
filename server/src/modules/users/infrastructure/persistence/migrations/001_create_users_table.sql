-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name_encrypted TEXT NOT NULL, -- PII encrypted
    last_name_encrypted TEXT NOT NULL,  -- PII encrypted
    phone_encrypted TEXT,                -- PII encrypted
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Check constraint for role
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_role') THEN
        ALTER TABLE users ADD CONSTRAINT check_role CHECK (role IN ('USER', 'ADMIN'));
    END IF;
END $$;
