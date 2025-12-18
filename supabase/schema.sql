-- Mercado Libre Analyzer - Database Schema

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL,
  available_quantity INTEGER NOT NULL,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  category_id TEXT,
  permalink TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE listing_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  plain_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  recommendations JSONB NOT NULL,
  analyzed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_listings_item_id ON listings(item_id);
CREATE INDEX idx_ai_analyses_listing_id ON ai_analyses(listing_id);

