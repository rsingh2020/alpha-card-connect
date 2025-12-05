import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Offer } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useOffers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Offer[];
    },
  });

  const toggleOffer = useMutation({
    mutationFn: async ({ id, is_activated }: { id: string; is_activated: boolean }) => {
      const { data, error } = await supabase
        .from('offers')
        .update({ is_activated })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast({ title: data.is_activated ? 'Offer activated' : 'Offer deactivated' });
    },
  });

  const addOffer = useMutation({
    mutationFn: async (offer: Omit<Offer, 'id' | 'user_id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('offers')
        .insert({ ...offer, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast({ title: 'Offer added' });
    },
  });

  return { offers, isLoading, toggleOffer, addOffer };
}
