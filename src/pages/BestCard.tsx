import { useState, useMemo } from 'react';
import { useCards } from '@/hooks/useCards';
import { BottomNav } from '@/components/BottomNav';
import { AppHeader } from '@/components/AppHeader';
import { CreditCard3D } from '@/components/CreditCard3D';
import { CircularProgress } from '@/components/CircularProgress';
import { getBestCard } from '@/lib/bestCardEngine';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Search } from 'lucide-react';
import { SPENDING_CATEGORIES, SpendingCategory } from '@/types';

export default function BestCard() {
  const { cards, isLoading } = useCards();
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<SpendingCategory>('Dining');
  const [amount, setAmount] = useState(50);

  const recommendation = useMemo(() => {
    return getBestCard(cards, category, amount);
  }, [cards, category, amount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 pb-24">
        <div className="max-w-lg mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader 
        title="Best Card" 
        subtitle="AI-Optimized Recommendation"
        icon={<Sparkles className="w-6 h-6 text-primary" />}
      />

      <div className="px-6 space-y-6 max-w-lg mx-auto">
        {/* Input Form */}
        <Card className="p-6 glass gold-border">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Merchant
              </Label>
              <Input
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g., Starbucks, Amazon, Delta..."
                className="bg-input border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as SpendingCategory)}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPENDING_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={1}
                  className="bg-input border-border"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Recommendation Result */}
        {recommendation ? (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-6 glass gold-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Recommended Card
                  </h2>
                  <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                </div>
                <CircularProgress
                  value={recommendation.score}
                  size={80}
                  strokeWidth={6}
                />
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl gold-gradient">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {recommendation.rewardRate}%
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reward Rate</p>
                  <p className="text-foreground font-medium">
                    On {category} purchases
                  </p>
                </div>
              </div>
            </Card>

            <CreditCard3D card={recommendation.card} />

            <Card className="p-4 glass gold-border">
              <p className="text-sm text-muted-foreground">
                Estimated rewards for ${amount.toLocaleString()}:
              </p>
              <p className="text-2xl font-bold gold-text">
                {((amount * recommendation.rewardRate) / 100).toFixed(2)} {recommendation.card.reward_type}
              </p>
            </Card>
          </div>
        ) : cards.length === 0 ? (
          <Card className="p-8 glass gold-border text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Add Cards First
            </h3>
            <p className="text-muted-foreground">
              Add your credit cards in the Wallet to get recommendations
            </p>
          </Card>
        ) : (
          <Card className="p-8 glass gold-border text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Enter Purchase Details
            </h3>
            <p className="text-muted-foreground">
              Fill in the form above to get card recommendations
            </p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
