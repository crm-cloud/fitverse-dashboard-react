import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// User related queries
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  return data;
};

export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
  return data;
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
  return data;
};
