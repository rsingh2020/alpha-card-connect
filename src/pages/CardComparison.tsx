import { useState } from 'react';
import { useCards } from '@/hooks/useCards';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, GitCompare, Check, X, DollarSign, Percent, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SPENDING_CATEGORIES, SpendingCategory } from '@/types';
import { Card as CardType } from '@/types';

export default function CardComparison() {
  const { cards, isLoading } = useCards();
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  const toggleCard = (cardId: string) => {
    setSelectedCardIds(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : prev.length < 4 ? [...prev, cardId] : prev
    );
  };

  const selectedCards = cards.filter(card => selectedCardIds.includes(card.id));

  const getRewardRate = (card: CardType, category: SpendingCategory): number => {
    const rates = card.reward_rates as Record<string, number> || {};
    return rates[category] || rates['Other'] || 1;
  };

  const getBestRate = (category: SpendingCategory): number => {
    if (selectedCards.length === 0) return 0;
    return Math.max(...selectedCards.map(card => getRewardRate(card, category)));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/wallet">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <GitCompare className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">Compare Cards</h1>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 max-w-4xl mx-auto">
        {/* Card Selection */}
        <Card className="p-4 glass gold-border">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            Select up to 4 cards to compare
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cards.map(card => (
              <button
                key={card.id}
                onClick={() => toggleCard(card.id)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  selectedCardIds.includes(card.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Checkbox 
                    checked={selectedCardIds.includes(card.id)} 
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{card.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{card.issuer}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Comparison Table */}
        {selectedCards.length >= 2 && (
          <div className="space-y-4 animate-slide-up">
            {/* Card Headers */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-muted-foreground font-medium text-sm w-32">Feature</th>
                    {selectedCards.map(card => (
                      <th key={card.id} className="p-3 text-center">
                        <div 
                          className="h-2 rounded-full mb-2"
                          style={{ backgroundColor: card.color || '#1a1a2e' }}
                        />
                        <p className="text-sm font-semibold text-foreground truncate">{card.name}</p>
                        <p className="text-xs text-muted-foreground">{card.issuer}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Annual Fee */}
                  <tr className="border-t border-border">
                    <td className="p-3 text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Annual Fee
                    </td>
                    {selectedCards.map(card => {
                      const lowestFee = Math.min(...selectedCards.map(c => Number(c.annual_fee) || 0));
                      const isLowest = (Number(card.annual_fee) || 0) === lowestFee;
                      return (
                        <td key={card.id} className="p-3 text-center">
                          <span className={`text-sm font-medium ${isLowest ? 'gold-text' : 'text-foreground'}`}>
                            ${Number(card.annual_fee || 0).toLocaleString()}
                          </span>
                          {isLowest && selectedCards.length > 1 && (
                            <Star className="w-3 h-3 text-primary inline ml-1" />
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Credit Limit */}
                  <tr className="border-t border-border">
                    <td className="p-3 text-sm text-muted-foreground">Credit Limit</td>
                    {selectedCards.map(card => {
                      const highestLimit = Math.max(...selectedCards.map(c => Number(c.credit_limit) || 0));
                      const isHighest = (Number(card.credit_limit) || 0) === highestLimit;
                      return (
                        <td key={card.id} className="p-3 text-center">
                          <span className={`text-sm font-medium ${isHighest ? 'gold-text' : 'text-foreground'}`}>
                            ${Number(card.credit_limit || 0).toLocaleString()}
                          </span>
                          {isHighest && selectedCards.length > 1 && (
                            <Star className="w-3 h-3 text-primary inline ml-1" />
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Reward Type */}
                  <tr className="border-t border-border">
                    <td className="p-3 text-sm text-muted-foreground">Reward Type</td>
                    {selectedCards.map(card => (
                      <td key={card.id} className="p-3 text-center">
                        <span className="text-sm font-medium text-foreground capitalize">
                          {card.reward_type || 'Points'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Reward Rates Header */}
                  <tr className="border-t-2 border-primary/30">
                    <td className="p-3 text-sm font-semibold gold-text flex items-center gap-2" colSpan={1}>
                      <Percent className="w-4 h-4" />
                      Reward Rates
                    </td>
                    {selectedCards.map(card => (
                      <td key={card.id} className="p-3"></td>
                    ))}
                  </tr>

                  {/* Reward Rates by Category */}
                  {SPENDING_CATEGORIES.map(category => {
                    const bestRate = getBestRate(category);
                    return (
                      <tr key={category} className="border-t border-border">
                        <td className="p-3 text-sm text-muted-foreground pl-8">{category}</td>
                        {selectedCards.map(card => {
                          const rate = getRewardRate(card, category);
                          const isBest = rate === bestRate && bestRate > 0;
                          return (
                            <td key={card.id} className="p-3 text-center">
                              <span className={`text-sm font-medium ${isBest ? 'gold-text' : 'text-foreground'}`}>
                                {rate}%
                              </span>
                              {isBest && selectedCards.length > 1 && rate > 1 && (
                                <Star className="w-3 h-3 text-primary inline ml-1" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Current Balance */}
                  <tr className="border-t-2 border-primary/30">
                    <td className="p-3 text-sm text-muted-foreground">Current Balance</td>
                    {selectedCards.map(card => (
                      <td key={card.id} className="p-3 text-center">
                        <span className="text-sm font-medium text-foreground">
                          ${Number(card.balance || 0).toLocaleString()}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Utilization */}
                  <tr className="border-t border-border">
                    <td className="p-3 text-sm text-muted-foreground">Utilization</td>
                    {selectedCards.map(card => {
                      const utilization = card.credit_limit && card.credit_limit > 0 
                        ? (Number(card.balance || 0) / Number(card.credit_limit)) * 100 
                        : 0;
                      return (
                        <td key={card.id} className="p-3 text-center">
                          <span className={`text-sm font-medium ${
                            utilization > 30 ? 'text-destructive' : 'text-primary'
                          }`}>
                            {utilization.toFixed(1)}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Rewards Balance */}
                  <tr className="border-t border-border">
                    <td className="p-3 text-sm text-muted-foreground">Rewards Balance</td>
                    {selectedCards.map(card => (
                      <td key={card.id} className="p-3 text-center">
                        <span className="text-sm font-medium gold-text">
                          {Number(card.reward_balance || 0).toLocaleString()} pts
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-primary" />
                <span>Best in category</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty/Instruction State */}
        {selectedCards.length < 2 && (
          <Card className="p-8 glass gold-border text-center">
            <GitCompare className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {cards.length < 2 ? 'Add More Cards' : 'Select Cards to Compare'}
            </h3>
            <p className="text-muted-foreground">
              {cards.length < 2 
                ? 'You need at least 2 cards to use the comparison feature.'
                : 'Select at least 2 cards above to see a detailed comparison.'}
            </p>
            {cards.length < 2 && (
              <Link to="/wallet">
                <Button className="mt-4 gold-gradient text-primary-foreground">
                  Go to Wallet
                </Button>
              </Link>
            )}
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
