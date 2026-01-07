-- Rollback demo_requests table
DROP TRIGGER IF EXISTS update_demo_requests_updated_at ON demo_requests;
DROP TABLE IF EXISTS demo_requests CASCADE;
