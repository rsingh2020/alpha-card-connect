import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock } from 'lucide-react';

interface InactivityWarningProps {
  open: boolean;
  secondsRemaining: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export function InactivityWarning({
  open,
  secondsRemaining,
  onStayLoggedIn,
  onLogout,
}: InactivityWarningProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="glass border-border">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">Session Timeout Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground">
            You've been inactive for a while. For your security, you'll be automatically logged out in{' '}
            <span className="text-primary font-bold">{secondsRemaining}</span> seconds.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onLogout} className="border-border">
            Log Out Now
          </AlertDialogCancel>
          <AlertDialogAction onClick={onStayLoggedIn} className="gold-gradient text-primary-foreground">
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
