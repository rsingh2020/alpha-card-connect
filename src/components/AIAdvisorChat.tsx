import { useState, useRef, useEffect } from 'react';
import { useAIAdvisor } from '@/hooks/useAIAdvisor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Sparkles, Trash2, User } from 'lucide-react';

const QUICK_PROMPTS = [
  "Which card should I use for dining?",
  "How can I maximize my rewards?",
  "Analyze my spending patterns",
  "Am I using my cards efficiently?",
];

export function AIAdvisorChat() {
  const { messages, isLoading, sendMessage, clearMessages } = useAIAdvisor();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!isLoading) {
      sendMessage(prompt);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Clear button */}
      {messages.length > 0 && (
        <div className="flex justify-end px-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="text-muted-foreground hover:text-destructive gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </Button>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full gold-gradient mx-auto mb-4 flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Hi! I'm your AI Financial Advisor
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                I analyze your cards, spending, and rewards to help you make smarter financial decisions.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Quick questions</p>
              <div className="grid grid-cols-1 gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-left p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <Card
                  className={`p-3 max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'glass border-border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </Card>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <Card className="p-3 glass border-border">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your cards, rewards, or spending..."
            className="bg-input border-border"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="gold-gradient text-primary-foreground"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
