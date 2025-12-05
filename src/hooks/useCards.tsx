import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useCards() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Card[];
    },
  });

  const addCard = useMutation({
    mutationFn: async (card: Omit<Card, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('cards')
        .insert({ ...card, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast({ title: 'Card added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding card', description: error.message, variant: 'destructive' });
    },
  });

  const updateCard = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Card> & { id: string }) => {
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });

  const deleteCard = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cards').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast({ title: 'Card deleted' });
    },
  });

  return { cards, isLoading, addCard, updateCard, deleteCard };
}
