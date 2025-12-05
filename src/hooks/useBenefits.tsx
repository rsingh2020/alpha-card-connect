import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Benefit } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useBenefits() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: benefits = [], isLoading } = useQuery({
    queryKey: ['benefits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Benefit[];
    },
  });

  const updateBenefit = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Benefit> & { id: string }) => {
      const { data, error } = await supabase
        .from('benefits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
    },
  });

  const addBenefit = useMutation({
    mutationFn: async (benefit: Omit<Benefit, 'id' | 'user_id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('benefits')
        .insert({ ...benefit, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      toast({ title: 'Benefit added' });
    },
  });

  return { benefits, isLoading, updateBenefit, addBenefit };
}
