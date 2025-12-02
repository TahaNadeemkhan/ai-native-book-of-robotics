ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation_policy ON users
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
