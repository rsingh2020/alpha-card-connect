import { useAuth } from '@/hooks/useAuth';
import { useCards } from '@/hooks/useCards';
import { useTransactions } from '@/hooks/useTransactions';
import { BottomNav } from '@/components/BottomNav';
import { CircularProgress } from '@/components/CircularProgress';
import { SpendingChart } from '@/components/SpendingChart';
import { CreditCard3D } from '@/components/CreditCard3D';
import { getCardEfficiency, getBestCardByCategory } from '@/lib/bestCardEngine';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Settings, TrendingUp, Coins, Sparkles, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { cards, isLoading: cardsLoading } = useCards();
  const { thisMonthSpending, categorySpending, isLoading: transactionsLoading } = useTransactions();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({ title: 'Logged out successfully' });
    navigate('/auth');
  };


  const totalRewards = cards.reduce((sum, card) => sum + Number(card.reward_balance), 0);
  const bestCard = cards.length > 0 ? cards.reduce((best, card) => {
    return getCardEfficiency(card) > getCardEfficiency(best) ? card : best;
  }, cards[0]) : null;

  const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
  const bestCardForTopCategory = topCategory ? getBestCardByCategory(cards, topCategory[0] as any) : null;

  if (cardsLoading || transactionsLoading) {
    return (
      <div className="min-h-screen bg-background p-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="p-6 space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Welcome back,</p>
            <h1 className="text-2xl font-display font-bold gold-text">
              {user?.user_metadata?.full_name || 'User'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 max-w-4xl mx-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 glass gold-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-lg font-bold text-foreground">
                  ${thisMonthSpending.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass gold-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rewards</p>
                <p className="text-lg font-bold gold-text">
                  {totalRewards.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Best Card Efficiency */}
        {bestCard && (
          <Card className="p-6 glass gold-border animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Top Performing Card
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <CircularProgress
                value={getCardEfficiency(bestCard)}
                label="Efficiency"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{bestCard.name}</h3>
                <p className="text-sm text-muted-foreground">{bestCard.issuer}</p>
                <p className="text-xs text-primary mt-2">
                  {Number(bestCard.reward_balance).toLocaleString()} {bestCard.reward_type} earned
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Category Spending */}
        <Card className="p-6 glass gold-border animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            Spending by Category
          </h2>
          <SpendingChart data={categorySpending} />
        </Card>

        {/* Best Card Recommendation */}
        {bestCardForTopCategory && topCategory && (
          <Card className="p-6 glass gold-border animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Best Card Now
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              For your top category: <span className="text-primary">{topCategory[0]}</span>
            </p>
            <div className="scale-90 origin-left">
              <CreditCard3D card={bestCardForTopCategory} />
            </div>
          </Card>
        )}

        {/* Empty state */}
        {cards.length === 0 && (
          <Card className="p-8 glass gold-border text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Add Your First Card
            </h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your credit cards and maximize your rewards
            </p>
            <Button
              onClick={() => navigate('/wallet')}
              className="gold-gradient text-primary-foreground"
            >
              Go to Wallet
            </Button>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
