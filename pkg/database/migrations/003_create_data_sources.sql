-- Create data_sources table
CREATE TABLE IF NOT EXISTS data_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('spark', 'kafka', 'airflow', 'database', 'custom')),
    connection_string TEXT NOT NULL,
    username VARCHAR(255),
    password TEXT,
    description TEXT,
    status VARCHAR(50) DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on created_by for faster queries
CREATE INDEX IF NOT EXISTS idx_data_sources_created_by ON data_sources(created_by);

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources(type);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_data_sources_status ON data_sources(status);
