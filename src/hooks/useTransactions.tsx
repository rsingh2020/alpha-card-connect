import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useTransactions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return data as Transaction[];
    },
  });

  const addTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert({ ...transaction, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Transaction added' });
    },
    onError: (error) => {
      toast({ title: 'Error adding transaction', description: error.message, variant: 'destructive' });
    },
  });

  const thisMonthSpending = transactions.reduce((sum, t) => {
    const transactionDate = new Date(t.transaction_date);
    const now = new Date();
    if (transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear()) {
      return sum + Number(t.amount);
    }
    return sum;
  }, 0);

  const categorySpending = transactions.reduce((acc, t) => {
    const transactionDate = new Date(t.transaction_date);
    const now = new Date();
    if (transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear()) {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    }
    return acc;
  }, {} as Record<string, number>);

  return { transactions, isLoading, addTransaction, thisMonthSpending, categorySpending };
}
