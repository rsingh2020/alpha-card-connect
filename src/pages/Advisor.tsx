import { AIAdvisorChat } from '@/components/AIAdvisorChat';
import { BottomNav } from '@/components/BottomNav';

export default function Advisor() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-lg mx-auto w-full pb-20">
        <AIAdvisorChat />
      </div>
      <BottomNav />
    </div>
  );
}
