-- Add default admin permissions using valid categories
INSERT INTO permissions (name, display_name, description, module, category)
VALUES
  ('tasks.view', 'View Tasks', 'View tasks and assignments', 'operations', 'read'),
  ('tasks.create', 'Create Tasks', 'Create new tasks', 'operations', 'create'),
  ('tasks.edit', 'Edit Tasks', 'Edit existing tasks', 'operations', 'write'),
  ('tasks.delete', 'Delete Tasks', 'Delete tasks', 'operations', 'delete'),
  ('devices.view', 'View Devices', 'View attendance devices', 'operations', 'read'),
  ('devices.manage', 'Manage Devices', 'Manage attendance devices', 'operations', 'write')
ON CONFLICT (name) DO NOTHING;