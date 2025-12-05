import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // User should have a session from clicking the reset link
      setValidSession(!!session);
    };
    
    checkSession();

    // Listen for password recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate password
    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      setErrors({ password: validation.error.errors[0].message });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: 'Password updated!',
        description: 'Your password has been successfully reset.',
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      const message = err?.message?.toLowerCase() || '';
      if (message.includes('same password')) {
        setErrors({ password: 'New password must be different from your current password' });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to reset password. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (validSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full gold-gradient animate-pulse" />
      </div>
    );
  }

  // Invalid/expired link
  if (!validSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-destructive/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/20 mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">Invalid or Expired Link</h1>
            <p className="text-muted-foreground">
              This password reset link has expired or is invalid. Please request a new one.
            </p>
          </div>

          <Button
            onClick={() => navigate('/forgot-password')}
            className="w-full gold-gradient text-primary-foreground font-semibold h-12"
          >
            Request New Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gold-gradient mb-4">
            <CreditCard className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 glass p-8 rounded-2xl">
          {/* Password requirements */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm font-medium text-foreground mb-2">Password requirements:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className={`w-3 h-3 ${password.length >= 8 ? 'text-green-500' : 'text-muted-foreground'}`} />
                At least 8 characters
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className={`w-3 h-3 ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}`} />
                One uppercase letter
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className={`w-3 h-3 ${/[a-z]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}`} />
                One lowercase letter
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className={`w-3 h-3 ${/[0-9]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}`} />
                One number
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-input border-border"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full gold-gradient text-primary-foreground font-semibold h-12"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
