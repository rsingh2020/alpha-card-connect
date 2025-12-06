import { BottomNav } from '@/components/BottomNav';
import { AppHeader } from '@/components/AppHeader';
import { useCards } from '@/hooks/useCards';
import { useTransactions } from '@/hooks/useTransactions';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { BarChart3 } from 'lucide-react';

const efficiencyData = [
  { month: 'Jan', value: 2.5 },
  { month: 'Feb', value: 3.2 },
  { month: 'Mar', value: 3.8 },
  { month: 'Apr', value: 4.1 },
  { month: 'May', value: 4.5 },
  { month: 'Jun', value: 5.2 },
  { month: 'Jul', value: 5.8 },
  { month: 'Aug', value: 6.2 },
  { month: 'Sep', value: 6.5 },
  { month: 'Oct', value: 6.8 },
  { month: 'Nov', value: 7.1 },
  { month: 'Dec', value: 7.5 },
];

const categorySpendData = [
  { category: 'Dining', amount: 8500 },
  { category: 'Travel', amount: 12000 },
  { category: 'Groceries', amount: 15000 },
  { category: 'Shopping', amount: 22000 },
  { category: 'Other', amount: 32000 },
];

const funnelData = [
  { stage: 'Visitors', value: 100, color: '#7dd3fc' },
  { stage: 'Sign Ups', value: 75, color: '#38bdf8' },
  { stage: 'Active Users', value: 50, color: '#0ea5e9' },
  { stage: 'Subscribers', value: 25, color: '#0284c7' },
];

const featureUsageData = [
  { feature: 'Auto-Activate', usage: 87 },
  { feature: 'Benefits Hints', usage: 56 },
  { feature: 'Welcome Tracker', usage: 42 },
  { feature: 'Smart Categories', usage: 31 },
];

export default function Analytics() {
  const { cards } = useCards();
  const { transactions } = useTransactions();

  // Calculate aggregated metrics
  const totalCards = cards.length;
  const avgEfficiency = totalCards > 0 ? Math.round(75 + Math.random() * 15) : 0;
  const totalUsers = 1254; // Demo data - in production this would come from aggregated backend data

  // Calculate category spending from transactions
  const categoryTotals = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const dynamicCategoryData = Object.entries(categoryTotals).length > 0
    ? Object.entries(categoryTotals).map(([category, amount]) => ({ category, amount }))
    : categorySpendData;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader 
        title="Analytics" 
        subtitle="Internal metrics dashboard"
        icon={<BarChart3 className="w-6 h-6 text-primary" />} 
      />

      <div className="px-4 space-y-6">
        {/* Aggregated Metrics */}
        <div className="card-dark p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Aggregated Metrics</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">1,254</p>
              <p className="text-xs text-muted-foreground mt-1">Number of Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">3,672</p>
              <p className="text-xs text-muted-foreground mt-1">Total Cards</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">5.8</p>
              <p className="text-xs text-muted-foreground mt-1">Avg Efficiency</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avg. Efficiency Over Time */}
          <div className="card-dark p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Avg. Efficiency Over Time</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 10 }}
                    domain={[0, 8]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Spend */}
          <div className="card-dark p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Category Spend</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="category" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 9 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
                  />
                  <Bar dataKey="amount" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature Usage Table - Left */}
          <div className="card-dark p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Feature Usage</h2>
            <div className="space-y-0">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Feature</span>
                <span className="text-sm text-muted-foreground">Usage</span>
              </div>
              {featureUsageData.map((item) => (
                <div key={item.feature} className="flex justify-between py-3 border-b border-border/50">
                  <span className="text-sm text-foreground">{item.feature}</span>
                  <span className="text-sm text-foreground">{item.usage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Funnel */}
          <div className="card-dark p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Subscription Funnel</h2>
            <div className="flex flex-col items-center space-y-2">
              {funnelData.map((item, index) => (
                <div
                  key={item.stage}
                  className="flex items-center justify-center text-white text-sm font-medium py-3 rounded transition-all"
                  style={{
                    backgroundColor: item.color,
                    width: `${100 - index * 15}%`,
                  }}
                >
                  {item.stage}
                </div>
              ))}
            </div>
            {/* Feature Usage below funnel */}
            <div className="mt-6 space-y-0">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Feature</span>
                <span className="text-sm text-muted-foreground">Usage</span>
              </div>
              {featureUsageData.map((item) => (
                <div key={item.feature} className="flex justify-between py-3 border-b border-border/50">
                  <span className="text-sm text-foreground">{item.feature}</span>
                  <span className="text-sm text-foreground">{item.usage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
