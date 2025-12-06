import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ className, size = 'md' }: UserAvatarProps) {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
  };

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    }
    
    fetchProfile();
  }, [user?.id]);

  const getInitials = () => {
    const fullName = user?.user_metadata?.full_name || user?.email || 'U';
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      <AvatarImage src={avatarUrl || undefined} alt="Profile" />
      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}