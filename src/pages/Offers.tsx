import { useState } from 'react';
import { useOffers } from '@/hooks/useOffers';
import { useCards } from '@/hooks/useCards';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag, Plus, Clock, Zap, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Offers() {
  const { offers, isLoading, toggleOffer, addOffer } = useOffers();
  const { cards } = useCards();
  const [isOpen, setIsOpen] = useState(false);
  const [newOffer, setNewOffer] = useState({
    card_id: '',
    merchant: '',
    description: '',
    multiplier: 1,
    reward_rate: 0,
    expires_at: '',
    is_activated: false,
  });

  const handleAddOffer = async () => {
    if (!newOffer.merchant) return;
    
    await addOffer.mutateAsync({
      ...newOffer,
      card_id: newOffer.card_id || undefined,
      expires_at: newOffer.expires_at || undefined,
    });
    setIsOpen(false);
    setNewOffer({
      card_id: '',
      merchant: '',
      description: '',
      multiplier: 1,
      reward_rate: 0,
      expires_at: '',
      is_activated: false,
    });
  };

  const activeOffers = offers.filter(o => o.is_activated);
  const availableOffers = offers.filter(o => !o.is_activated);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 pb-24">
        <div className="max-w-lg mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
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
            <Tag className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">Offers</h1>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="gold-gradient text-primary-foreground">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-border">
              <DialogHeader>
                <DialogTitle className="font-display gold-text">Add Offer</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Merchant</Label>
                  <Input
                    value={newOffer.merchant}
                    onChange={(e) => setNewOffer({ ...newOffer, merchant: e.target.value })}
                    placeholder="e.g., Amazon, Uber Eats"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Card</Label>
                  <Select
                    value={newOffer.card_id}
                    onValueChange={(v) => setNewOffer({ ...newOffer, card_id: v })}
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
                    <Label>Multiplier (x)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newOffer.multiplier}
                      onChange={(e) => setNewOffer({ ...newOffer, multiplier: Number(e.target.value) })}
                      className="bg-input border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Reward Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newOffer.reward_rate}
                      onChange={(e) => setNewOffer({ ...newOffer, reward_rate: Number(e.target.value) })}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                    placeholder="e.g., Extra 5% cashback"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expires</Label>
                  <Input
                    type="date"
                    value={newOffer.expires_at}
                    onChange={(e) => setNewOffer({ ...newOffer, expires_at: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>

                <Button
                  onClick={handleAddOffer}
                  disabled={addOffer.isPending || !newOffer.merchant}
                  className="w-full gold-gradient text-primary-foreground"
                >
                  {addOffer.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Add Offer'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="px-6 space-y-6 max-w-lg mx-auto">
        {/* Top Offers - Horizontal Scroll */}
        {offers.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Top Offers</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
              {offers.slice(0, 5).map((offer) => (
                <div
                  key={offer.id}
                  className="flex-shrink-0 w-20 flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center animate-pulse-gold">
                    <span className="text-lg font-bold text-primary-foreground">
                      {Number(offer.multiplier) > 1 ? `${offer.multiplier}x` : `${offer.reward_rate}%`}
                    </span>
                  </div>
                  <span className="text-xs text-center text-muted-foreground truncate w-full">
                    {offer.merchant}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Offers */}
        {activeOffers.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Activated
            </h2>
            {activeOffers.map((offer, index) => {
              const card = cards.find(c => c.id === offer.card_id);
              
              return (
                <Card
                  key={offer.id}
                  className="p-4 glass border-primary/30 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">
                          {Number(offer.multiplier) > 1 ? `${offer.multiplier}x` : `${offer.reward_rate}%`}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{offer.merchant}</h3>
                        {offer.description && (
                          <p className="text-sm text-muted-foreground">{offer.description}</p>
                        )}
                        {card && (
                          <p className="text-xs text-primary">{card.name}</p>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={offer.is_activated}
                      onCheckedChange={(checked) => 
                        toggleOffer.mutate({ id: offer.id, is_activated: checked })
                      }
                    />
                  </div>
                  {offer.expires_at && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        Expires {formatDistanceToNow(new Date(offer.expires_at), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Available Offers */}
        {availableOffers.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Available</h2>
            {availableOffers.map((offer, index) => {
              const card = cards.find(c => c.id === offer.card_id);
              
              return (
                <Card
                  key={offer.id}
                  className="p-4 glass gold-border animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <span className="text-sm font-bold text-muted-foreground">
                          {Number(offer.multiplier) > 1 ? `${offer.multiplier}x` : `${offer.reward_rate}%`}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{offer.merchant}</h3>
                        {offer.description && (
                          <p className="text-sm text-muted-foreground">{offer.description}</p>
                        )}
                        {card && (
                          <p className="text-xs text-muted-foreground">{card.name}</p>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={offer.is_activated}
                      onCheckedChange={(checked) => 
                        toggleOffer.mutate({ id: offer.id, is_activated: checked })
                      }
                    />
                  </div>
                  {offer.expires_at && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        Expires {formatDistanceToNow(new Date(offer.expires_at), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {offers.length === 0 && (
          <Card className="p-8 glass gold-border text-center">
            <Tag className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No Offers Yet
            </h3>
            <p className="text-muted-foreground">
              Add special offers and promotions from your credit cards
            </p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
