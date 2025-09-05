import { useState } from 'react';
import { useSupabaseQuery } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export const useBranches = () => {
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  
  const queryResult = useSupabaseQuery(
    ['branches'],
    async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  );

  return {
    ...queryResult,
    branches: queryResult.data || [],
    selectedBranch,
    setSelectedBranch
  };
};