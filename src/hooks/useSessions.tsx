import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UserSession {
  id: string;
  user_id: string;
  device_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  last_active: string;
  is_current: boolean;
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Unknown Device';
  
  // Detect browser
  let browser = 'Unknown Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  
  // Detect OS
  let os = 'Unknown OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Android')) os = 'Android';
  
  return `${browser} on ${os}`;
}

export function useSessions() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const fetchSessions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active', { ascending: false });
      
      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!user) return;

    try {
      const userAgent = navigator.userAgent;
      const deviceName = parseUserAgent(userAgent);
      
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          device_name: deviceName,
          user_agent: userAgent,
          is_current: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      setCurrentSessionId(data.id);
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const updateSessionActivity = async () => {
    if (!currentSessionId) return;
    
    try {
      await supabase
        .from('user_sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('id', currentSessionId);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
      
      if (sessionId === currentSessionId) {
        await signOut();
      } else {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        toast({ title: 'Session revoked', description: 'Device has been logged out.' });
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      toast({ title: 'Error', description: 'Failed to revoke session.', variant: 'destructive' });
    }
  };

  const revokeAllOtherSessions = async () => {
    if (!user || !currentSessionId) return;
    
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id)
        .neq('id', currentSessionId);
      
      if (error) throw error;
      
      setSessions((prev) => prev.filter((s) => s.id === currentSessionId));
      toast({ title: 'Success', description: 'All other devices have been logged out.' });
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      toast({ title: 'Error', description: 'Failed to revoke sessions.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
      createSession();
    }
  }, [user]);

  // Update activity every 5 minutes
  useEffect(() => {
    if (!currentSessionId) return;
    
    const interval = setInterval(updateSessionActivity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentSessionId]);

  return {
    sessions,
    loading,
    currentSessionId,
    revokeSession,
    revokeAllOtherSessions,
    refreshSessions: fetchSessions,
  };
}
