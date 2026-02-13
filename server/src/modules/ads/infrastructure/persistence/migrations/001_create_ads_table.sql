-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price_amount DECIMAL(10, 2) NOT NULL,
    price_currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(5) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'France',
    category VARCHAR(50) NOT NULL,
    seller_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    images TEXT[], -- Array of image URLs
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ads_seller_id ON ads(seller_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_category ON ads(category);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_city ON ads(city);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_ads_title_description ON ads USING GIN(to_tsvector('french', title || ' ' || description));

-- Check constraint for status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_status') THEN
        ALTER TABLE ads ADD CONSTRAINT check_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'SOLD', 'ARCHIVED'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_price_positive') THEN
        ALTER TABLE ads ADD CONSTRAINT check_price_positive CHECK (price_amount >= 0);
    END IF;
END $$;
