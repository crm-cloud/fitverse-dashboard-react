-- Create tasks table for task management system
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  category TEXT CHECK (category IN ('maintenance', 'member-service', 'finance', 'administration', 'training', 'cleaning', 'other')),
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Dates
  due_date TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Context
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  
  -- Metadata
  tags TEXT[],
  estimated_time INTEGER, -- minutes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Staff can view tasks assigned to them or in their branch
CREATE POLICY "Staff can view own tasks" ON public.tasks
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    is_staff_or_above(auth.uid())
  );

-- Staff can create tasks
CREATE POLICY "Staff can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (is_staff_or_above(auth.uid()));

-- Staff can update tasks
CREATE POLICY "Staff can update tasks" ON public.tasks
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    is_staff_or_above(auth.uid())
  );

-- Staff can delete tasks
CREATE POLICY "Staff can delete tasks" ON public.tasks
  FOR DELETE USING (
    is_staff_or_above(auth.uid())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_branch_id ON public.tasks(branch_id);
CREATE INDEX IF NOT EXISTS idx_tasks_gym_id ON public.tasks(gym_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);

-- Trigger to update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hierarchical_settings_updated_at();

-- Enable realtime for tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;