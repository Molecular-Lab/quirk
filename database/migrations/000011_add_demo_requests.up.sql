-- Create demo_requests table
CREATE TABLE demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,

  -- Company Information
  company_name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  company_size VARCHAR(50) NOT NULL,
  capital_volume NUMERIC(20,2) NOT NULL,
  industry VARCHAR(100) NOT NULL,

  -- Status & Tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_demo_requests_email ON demo_requests(email);
CREATE INDEX idx_demo_requests_status ON demo_requests(status);
CREATE INDEX idx_demo_requests_created_at ON demo_requests(created_at DESC);

-- Updated at trigger
CREATE TRIGGER update_demo_requests_updated_at
  BEFORE UPDATE ON demo_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
