import { AIAdvisorChat } from '@/components/AIAdvisorChat';
import { BottomNav } from '@/components/BottomNav';
import { AppHeader } from '@/components/AppHeader';
import { Bot } from 'lucide-react';

export default function Advisor() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader 
        title="AI Advisor" 
        icon={<Bot className="w-6 h-6 text-primary" />}
      />
      <div className="flex-1 max-w-lg mx-auto w-full pb-20">
        <AIAdvisorChat />
      </div>
      <BottomNav />
    </div>
  );
}
