import { Card, SpendingCategory } from '@/types';

interface CardRecommendation {
  card: Card;
  score: number;
  reason: string;
  rewardRate: number;
}

export function getBestCard(
  cards: Card[],
  category: SpendingCategory,
  amount: number
): CardRecommendation | null {
  if (cards.length === 0) return null;

  const recommendations = cards.map((card) => {
    const rewardRates = card.reward_rates as Record<string, number> || {};
    const rewardRate = rewardRates[category] || rewardRates['Other'] || 1;
    
    // Calculate base score from reward rate
    let score = rewardRate * 20;
    
    // Bonus for low utilization cards
    const utilization = card.balance / card.credit_limit;
    if (utilization < 0.3) score += 10;
    
    // Penalty for high annual fee (if spending is low)
    if (amount < 100 && card.annual_fee > 0) {
      score -= Math.min(5, card.annual_fee / 100);
    }
    
    // Bonus for matching card type to category
    if (card.name.toLowerCase().includes(category.toLowerCase())) {
      score += 15;
    }

    // Determine reason
    let reason = `${rewardRate}% rewards on ${category}`;
    if (utilization < 0.3) {
      reason = `Low utilization card with ${rewardRate}% on ${category}`;
    }

    return {
      card,
      score: Math.min(100, Math.max(0, score)),
      reason,
      rewardRate,
    };
  });

  return recommendations.sort((a, b) => b.score - a.score)[0];
}

export function getCardEfficiency(card: Card): number {
  const rewardRates = card.reward_rates as Record<string, number> || {};
  const avgRewardRate = Object.values(rewardRates).reduce((a, b) => a + b, 0) / 
    Math.max(1, Object.values(rewardRates).length);
  
  const utilization = card.credit_limit > 0 ? card.balance / card.credit_limit : 0;
  const utilizationScore = utilization < 0.3 ? 100 : utilization < 0.5 ? 80 : utilization < 0.7 ? 60 : 40;
  
  const feeImpact = card.annual_fee > 0 ? Math.max(0, 100 - card.annual_fee / 5) : 100;
  
  return Math.round((avgRewardRate * 10 + utilizationScore + feeImpact) / 3);
}

export function getBestCardByCategory(
  cards: Card[],
  category: SpendingCategory
): Card | null {
  if (cards.length === 0) return null;

  return cards.reduce((best, card) => {
    const bestRates = best.reward_rates as Record<string, number> || {};
    const cardRates = card.reward_rates as Record<string, number> || {};
    
    const bestRate = bestRates[category] || bestRates['Other'] || 0;
    const cardRate = cardRates[category] || cardRates['Other'] || 0;
    
    return cardRate > bestRate ? card : best;
  }, cards[0]);
}
