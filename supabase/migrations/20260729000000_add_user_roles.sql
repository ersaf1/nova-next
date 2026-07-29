-- user_roles: stores a single role per authenticated user.
-- Used for RBAC across the platform (user, admin, super_admin).

CREATE TABLE IF NOT EXISTS user_roles (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text        NOT NULL CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

-- The COMMENT must come after the table exists
COMMENT ON TABLE user_roles IS 'Stores the role assigned to each authenticated user for RBAC. Each user has exactly one role.';

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: users can read their own role
CREATE POLICY "Users can read own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: super_admin can read all roles
CREATE POLICY "Super admin can read all roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'super_admin'
    )
  );

-- Policy: super_admin can manage all roles (INSERT, UPDATE, DELETE)
CREATE POLICY "Super admin can manage all roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'super_admin'
    )
  );
