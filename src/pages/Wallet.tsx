import { useState } from 'react';
import { useCards } from '@/hooks/useCards';
import { BottomNav } from '@/components/BottomNav';
import { AppHeader } from '@/components/AppHeader';
import { CreditCard3D } from '@/components/CreditCard3D';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Wallet as WalletIcon, Loader2, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SPENDING_CATEGORIES } from '@/types';

const CARD_COLORS = [
  '#1a1a2e',
  '#16213e',
  '#0f3460',
  '#1a1a1a',
  '#2d132c',
  '#1e5128',
];

export default function Wallet() {
  const { cards, isLoading, addCard } = useCards();
  const [isOpen, setIsOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    name: '',
    issuer: '',
    network: 'Visa',
    last_four: '',
    balance: 0,
    credit_limit: 10000,
    annual_fee: 0,
    reward_type: 'points',
    reward_balance: 0,
    reward_rates: {} as Record<string, number>,
    color: CARD_COLORS[0],
  });

  const handleAddCard = async () => {
    if (!newCard.name || !newCard.issuer) return;
    
    await addCard.mutateAsync(newCard);
    setIsOpen(false);
    setNewCard({
      name: '',
      issuer: '',
      network: 'Visa',
      last_four: '',
      balance: 0,
      credit_limit: 10000,
      annual_fee: 0,
      reward_type: 'points',
      reward_balance: 0,
      reward_rates: {},
      color: CARD_COLORS[0],
    });
  };

  const totalBalance = cards.reduce((sum, card) => sum + Number(card.balance), 0);
  const totalCredit = cards.reduce((sum, card) => sum + Number(card.credit_limit), 0);
  const utilization = totalCredit > 0 ? (totalBalance / totalCredit) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 pb-24">
        <div className="max-w-lg mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader 
        title="Wallet" 
        icon={<WalletIcon className="w-6 h-6 text-primary" />}
      />
      
      {/* Action buttons */}
      <div className="px-6 mb-4 flex justify-end gap-2 max-w-lg mx-auto">
        {cards.length >= 2 && (
          <Link to="/compare">
            <Button variant="outline" size="icon" className="border-primary text-primary hover:bg-primary/10">
              <GitCompare className="w-5 h-5" />
            </Button>
          </Link>
        )}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="gold-gradient text-primary-foreground">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display gold-text">Add New Card</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Card Name</Label>
                  <Input
                    value={newCard.name}
                    onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                    placeholder="e.g., Chase Sapphire Reserve"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Issuer</Label>
                  <Input
                    value={newCard.issuer}
                    onChange={(e) => setNewCard({ ...newCard, issuer: e.target.value })}
                    placeholder="e.g., Chase"
                    className="bg-input border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <Select
                      value={newCard.network}
                      onValueChange={(v) => setNewCard({ ...newCard, network: v })}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Visa">Visa</SelectItem>
                        <SelectItem value="Mastercard">Mastercard</SelectItem>
                        <SelectItem value="Amex">American Express</SelectItem>
                        <SelectItem value="Discover">Discover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Last 4 Digits</Label>
                    <Input
                      value={newCard.last_four}
                      onChange={(e) => setNewCard({ ...newCard, last_four: e.target.value.slice(0, 4) })}
                      placeholder="1234"
                      maxLength={4}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Credit Limit</Label>
                    <Input
                      type="number"
                      value={newCard.credit_limit}
                      onChange={(e) => setNewCard({ ...newCard, credit_limit: Number(e.target.value) })}
                      className="bg-input border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Annual Fee</Label>
                    <Input
                      type="number"
                      value={newCard.annual_fee}
                      onChange={(e) => setNewCard({ ...newCard, annual_fee: Number(e.target.value) })}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Card Color</Label>
                  <div className="flex gap-2">
                    {CARD_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCard({ ...newCard, color })}
                        className={`w-8 h-8 rounded-full transition-all ${
                          newCard.color === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reward Rates by Category (%)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SPENDING_CATEGORIES.map((cat) => (
                      <div key={cat} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20">{cat}</span>
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          value={newCard.reward_rates[cat] || ''}
                          onChange={(e) => setNewCard({
                            ...newCard,
                            reward_rates: {
                              ...newCard.reward_rates,
                              [cat]: Number(e.target.value),
                            },
                          })}
                          placeholder="1"
                          className="bg-input border-border h-8 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleAddCard}
                  disabled={addCard.isPending || !newCard.name || !newCard.issuer}
                  className="w-full gold-gradient text-primary-foreground"
                >
                  {addCard.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Add Card'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

      <div className="px-6 space-y-6 max-w-lg mx-auto">
        {/* Summary Card */}
        <Card className="p-6 glass gold-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Total Balance</p>
              <p className="text-lg font-bold text-foreground">${totalBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="text-lg font-bold gold-text">${(totalCredit - totalBalance).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Utilization</p>
              <p className={`text-lg font-bold ${utilization > 30 ? 'text-destructive' : 'text-primary'}`}>
                {utilization.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        {/* Card Stack */}
        <div className="space-y-4">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CreditCard3D card={card} />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {cards.length === 0 && (
          <Card className="p-8 glass gold-border text-center">
            <WalletIcon className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No Cards Yet
            </h3>
            <p className="text-muted-foreground">
              Add your first credit card to start tracking
            </p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
