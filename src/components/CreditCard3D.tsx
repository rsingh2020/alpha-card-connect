import { Card } from '@/types';
import { CreditCard, Wifi } from 'lucide-react';

interface CreditCard3DProps {
  card: Card;
  onClick?: () => void;
  className?: string;
}

export function CreditCard3D({ card, onClick, className = '' }: CreditCard3DProps) {
  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      className={`relative w-full max-w-sm aspect-[1.586/1] rounded-2xl overflow-hidden cursor-pointer 
        transform transition-all duration-500 hover:scale-105 hover:-translate-y-2
        gold-glow ${className}`}
      style={{
        background: `linear-gradient(135deg, ${card.color || '#1a1a2e'} 0%, #0d0d1a 100%)`,
      }}
    >
      {/* Card shine effect */}
      <div className="absolute inset-0 card-shine opacity-50" />
      
      {/* Gold border accent */}
      <div className="absolute inset-0 rounded-2xl gold-border" />
      
      {/* Card content */}
      <div className="relative h-full p-6 flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{card.issuer}</p>
            <h3 className="text-lg font-semibold text-foreground">{card.name}</h3>
          </div>
          <Wifi className="w-6 h-6 text-primary rotate-90" />
        </div>
        
        {/* Chip */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-9 rounded-md gold-gradient opacity-80" />
          <span className="text-foreground/80 tracking-[0.25em] font-mono">
            •••• {card.last_four || '0000'}
          </span>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-xl font-bold gold-text">{formatBalance(Number(card.balance))}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Rewards</p>
            <p className="text-lg font-semibold text-primary">
              {Number(card.reward_balance).toLocaleString()} {card.reward_type}
            </p>
          </div>
        </div>
        
        {/* Network logo */}
        <div className="absolute bottom-6 right-6">
          <CreditCard className="w-8 h-8 text-primary/60" />
        </div>
      </div>
    </div>
  );
}
