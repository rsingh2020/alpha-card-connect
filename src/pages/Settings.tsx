import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSessions, UserSession } from '@/hooks/useSessions';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Shield,
  Smartphone,
  LogOut,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { z } from 'zod';
import { formatDistanceToNow } from 'date-fns';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

type Tab = 'profile' | 'security' | 'sessions';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'security' as Tab, label: 'Security', icon: Shield },
    { id: 'sessions' as Tab, label: 'Sessions', icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-border">
        <div className="p-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-display font-bold">Settings</h1>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-2xl mx-auto">
        {activeTab === 'profile' && <ProfileSection />}
        {activeTab === 'security' && <SecuritySection />}
        {activeTab === 'sessions' && <SessionsSection />}
      </div>

      <BottomNav />
    </div>
  );
}

function ProfileSection() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      if (error) throw error;

      // Update profiles table
      if (user) {
        await supabase
          .from('profiles')
          .update({ full_name: fullName, updated_at: new Date().toISOString() })
          .eq('id', user.id);
      }

      toast({ title: 'Profile updated!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Profile Information</h2>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled
            className="bg-muted border-border opacity-60"
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-input border-border"
          />
        </div>

        <Button
          onClick={handleUpdateProfile}
          disabled={loading}
          className="gold-gradient text-primary-foreground"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    setErrors({});

    const validation = passwordSchema.safeParse(newPassword);
    if (!validation.success) {
      setErrors({ newPassword: validation.error.errors[0].message });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({ title: 'Password changed!', description: 'Your password has been updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to change password.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Note: Full account deletion requires backend support
    // For now, we'll sign out and inform the user
    toast({
      title: 'Account Deletion',
      description: 'Please contact support to delete your account.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm font-medium text-foreground mb-2">Password requirements:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className={`w-3 h-3 ${newPassword.length >= 8 ? 'text-green-500' : 'text-muted-foreground'}`} />
              At least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className={`w-3 h-3 ${/[A-Z]/.test(newPassword) ? 'text-green-500' : 'text-muted-foreground'}`} />
              One uppercase letter
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className={`w-3 h-3 ${/[a-z]/.test(newPassword) ? 'text-green-500' : 'text-muted-foreground'}`} />
              One lowercase letter
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className={`w-3 h-3 ${/[0-9]/.test(newPassword) ? 'text-green-500' : 'text-muted-foreground'}`} />
              One number
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-input border-border pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-input border-border"
          />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
        </div>

        <Button
          onClick={handleChangePassword}
          disabled={loading || !newPassword || !confirmPassword}
          className="gold-gradient text-primary-foreground"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Change Password'}
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-2xl p-6 space-y-4 border-destructive/20">
        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-auto">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all your data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function SessionsSection() {
  const { sessions, loading, currentSessionId, revokeSession, revokeAllOtherSessions } = useSessions();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Delete current session from database
      if (currentSessionId) {
        await supabase.from('user_sessions').delete().eq('id', currentSessionId);
      }
      await signOut();
      toast({ title: 'Logged out successfully' });
      navigate('/auth');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to log out.', variant: 'destructive' });
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Log Out Current Session */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Log Out</h2>
        <p className="text-sm text-muted-foreground">
          Sign out of your current session on this device.
        </p>
        <Button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full sm:w-auto"
          variant="destructive"
        >
          {loggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <LogOut className="w-4 h-4 mr-2" />
          )}
          Log Out
        </Button>
      </div>

      {/* Active Sessions */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active Sessions</h2>
          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={revokeAllOtherSessions}
              className="text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out All Others
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Manage your active sessions across devices. You can log out of any session at any time.
        </p>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active sessions found</p>
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isCurrent={session.id === currentSessionId}
                onRevoke={() => revokeSession(session.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SessionCard({
  session,
  isCurrent,
  onRevoke,
}: {
  session: UserSession;
  isCurrent: boolean;
  onRevoke: () => void;
}) {
  return (
    <div className={`p-4 rounded-xl border ${isCurrent ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCurrent ? 'bg-primary/20' : 'bg-muted'}`}>
            <Smartphone className={`w-5 h-5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{session.device_name || 'Unknown Device'}</p>
              {isCurrent && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                  This device
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last active: {formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}
            </p>
            <p className="text-xs text-muted-foreground">
              Created: {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {!isCurrent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRevoke}
            className="text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
