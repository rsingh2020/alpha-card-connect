import { useState } from 'react';
import { useBenefits } from '@/hooks/useBenefits';
import { useCards } from '@/hooks/useCards';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Gift, Plus, Clock, DollarSign, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Benefits() {
  const { benefits, isLoading, addBenefit } = useBenefits();
  const { cards } = useCards();
  const [isOpen, setIsOpen] = useState(false);
  const [newBenefit, setNewBenefit] = useState({
    card_id: '',
    name: '',
    description: '',
    reward_amount: 0,
    progress: 0,
    target: 0,
    expires_at: '',
    is_active: true,
  });

  const handleAddBenefit = async () => {
    if (!newBenefit.name || !newBenefit.target) return;
    
    await addBenefit.mutateAsync({
      ...newBenefit,
      card_id: newBenefit.card_id || undefined,
      expires_at: newBenefit.expires_at || undefined,
    });
    setIsOpen(false);
    setNewBenefit({
      card_id: '',
      name: '',
      description: '',
      reward_amount: 0,
      progress: 0,
      target: 0,
      expires_at: '',
      is_active: true,
    });
  };

  const activeBonuses = benefits.filter(b => b.target > 0 && b.progress < b.target);
  const completedBonuses = benefits.filter(b => b.target > 0 && b.progress >= b.target);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 pb-24">
        <div className="max-w-lg mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">Benefits</h1>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="gold-gradient text-primary-foreground">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-border">
              <DialogHeader>
                <DialogTitle className="font-display gold-text">Add Bonus Tracker</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Bonus Name</Label>
                  <Input
                    value={newBenefit.name}
                    onChange={(e) => setNewBenefit({ ...newBenefit, name: e.target.value })}
                    placeholder="e.g., Sign-up Bonus"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Card (Optional)</Label>
                  <Select
                    value={newBenefit.card_id}
                    onValueChange={(v) => setNewBenefit({ ...newBenefit, card_id: v })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select a card" />
                    </SelectTrigger>
                    <SelectContent>
                      {cards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Spend Target ($)</Label>
                    <Input
                      type="number"
                      value={newBenefit.target || ''}
                      onChange={(e) => setNewBenefit({ ...newBenefit, target: Number(e.target.value) })}
                      placeholder="4000"
                      className="bg-input border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Reward Amount</Label>
                    <Input
                      type="number"
                      value={newBenefit.reward_amount || ''}
                      onChange={(e) => setNewBenefit({ ...newBenefit, reward_amount: Number(e.target.value) })}
                      placeholder="60000"
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Expires</Label>
                  <Input
                    type="date"
                    value={newBenefit.expires_at}
                    onChange={(e) => setNewBenefit({ ...newBenefit, expires_at: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>

                <Button
                  onClick={handleAddBenefit}
                  disabled={addBenefit.isPending || !newBenefit.name || !newBenefit.target}
                  className="w-full gold-gradient text-primary-foreground"
                >
                  {addBenefit.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Add Bonus'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="px-6 space-y-6 max-w-lg mx-auto">
        {/* Active Bonuses */}
        {activeBonuses.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Active Bonuses</h2>
            {activeBonuses.map((benefit, index) => {
              const progress = (Number(benefit.progress) / Number(benefit.target)) * 100;
              const card = cards.find(c => c.id === benefit.card_id);
              
              return (
                <Card
                  key={benefit.id}
                  className="p-5 glass gold-border animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{benefit.name}</h3>
                      {card && <p className="text-sm text-muted-foreground">{card.name}</p>}
                    </div>
                    <div className="p-2 rounded-xl gold-gradient">
                      <DollarSign className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${Number(benefit.progress).toLocaleString()} / ${Number(benefit.target).toLocaleString()}
                      </span>
                      <span className="gold-text font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {benefit.expires_at && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        Expires {formatDistanceToNow(new Date(benefit.expires_at), { addSuffix: true })}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">Reward:</p>
                    <p className="text-lg font-bold gold-text">
                      {Number(benefit.reward_amount).toLocaleString()} points
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Completed Bonuses */}
        {completedBonuses.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Completed</h2>
            {completedBonuses.map((benefit) => (
              <Card key={benefit.id} className="p-4 glass border-primary/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl gold-gradient">
                    <Gift className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{benefit.name}</h3>
                    <p className="text-sm gold-text">
                      {Number(benefit.reward_amount).toLocaleString()} points earned!
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {benefits.length === 0 && (
          <Card className="p-8 glass gold-border text-center">
            <Gift className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Track Your Bonuses
            </h3>
            <p className="text-muted-foreground">
              Add sign-up bonuses and spending requirements to track your progress
            </p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
