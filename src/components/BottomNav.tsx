import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Sparkles, Gift, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/best', icon: Sparkles, label: 'Best' },
  { path: '/benefits', icon: Gift, label: 'Benefits' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'text-primary scale-110' 
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'animate-pulse-gold' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
