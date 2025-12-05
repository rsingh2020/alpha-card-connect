import { CATEGORY_COLORS, SpendingCategory } from '@/types';

interface SpendingChartProps {
  data: Record<string, number>;
  size?: number;
}

export function SpendingChart({ data, size = 200 }: SpendingChartProps) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-full border-4 border-dashed border-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">No spending data</span>
        </div>
      </div>
    );
  }

  let cumulativePercentage = 0;
  const segments = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => {
      const percentage = (value / total) * 100;
      const startPercentage = cumulativePercentage;
      cumulativePercentage += percentage;
      return {
        category: category as SpendingCategory,
        value,
        percentage,
        startPercentage,
        color: CATEGORY_COLORS[category as SpendingCategory] || CATEGORY_COLORS.Other,
      };
    });

  const radius = size / 2;
  const innerRadius = radius * 0.6;

  const createArc = (startPercent: number, endPercent: number) => {
    const startAngle = (startPercent / 100) * 360 - 90;
    const endAngle = (endPercent / 100) * 360 - 90;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = radius + (radius - 4) * Math.cos(startRad);
    const y1 = radius + (radius - 4) * Math.sin(startRad);
    const x2 = radius + (radius - 4) * Math.cos(endRad);
    const y2 = radius + (radius - 4) * Math.sin(endRad);
    
    const x3 = radius + innerRadius * Math.cos(endRad);
    const y3 = radius + innerRadius * Math.sin(endRad);
    const x4 = radius + innerRadius * Math.cos(startRad);
    const y4 = radius + innerRadius * Math.sin(startRad);
    
    const largeArc = endPercent - startPercent > 50 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius - 4} ${radius - 4} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="drop-shadow-lg">
          {segments.map((segment, index) => (
            <path
              key={segment.category}
              d={createArc(segment.startPercentage, segment.startPercentage + segment.percentage)}
              fill={segment.color}
              className="transition-all duration-500 hover:opacity-80"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold gold-text">
            ${total.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
        {segments.map((segment) => (
          <div key={segment.category} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-xs text-muted-foreground">{segment.category}</span>
            <span className="text-xs text-foreground ml-auto">${segment.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
