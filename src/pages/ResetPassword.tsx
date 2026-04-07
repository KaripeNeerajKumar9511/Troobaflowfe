import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

/**
 * Legacy route for Supabase-style email recovery links.
 * Django session auth uses password change from Settings when signed in.
 */
export default function ResetPassword() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Password reset</CardTitle>
          <CardDescription className="text-left">
            Email-based password recovery is not enabled for this app. Sign in and update your password from
            {' '}
            <span className="font-medium text-foreground">Settings</span>
            , or ask your administrator for help.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => navigate('/login')}>
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
