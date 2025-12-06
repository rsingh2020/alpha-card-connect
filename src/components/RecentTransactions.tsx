import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ShoppingBag, Utensils, Plane, Car, Film, ShoppingCart, MoreHorizontal } from 'lucide-react';

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  transaction_date: string;
  rewards_earned: number;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  limit?: number;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Shopping: <ShoppingBag className="w-4 h-4" />,
  Dining: <Utensils className="w-4 h-4" />,
  Travel: <Plane className="w-4 h-4" />,
  Gas: <Car className="w-4 h-4" />,
  Entertainment: <Film className="w-4 h-4" />,
  Groceries: <ShoppingCart className="w-4 h-4" />,
  Other: <MoreHorizontal className="w-4 h-4" />,
};

export function RecentTransactions({ transactions, limit = 5 }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, limit);

  if (recentTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent transactions
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentTransactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {categoryIcons[tx.category] || categoryIcons.Other}
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{tx.merchant}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(tx.transaction_date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">
              -${Number(tx.amount).toLocaleString()}
            </p>
            {Number(tx.rewards_earned) > 0 && (
              <p className="text-xs text-primary">
                +{Number(tx.rewards_earned)} pts
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
