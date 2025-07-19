import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Dumbbell, Shield, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

const roleConfig = {
  'super-admin': {
    icon: Shield,
    color: 'bg-red-600',
    title: 'Super Admin',
    description: 'Full system administration access',
    email: 'superadmin@gymfit.com'
  },
  admin: {
    icon: Shield,
    color: 'bg-destructive',
    title: 'Admin Portal',
    description: 'Full system access and management',
    email: 'admin@gymfit.com'
  },
  team: {
    icon: Users,
    color: 'bg-blue-600',
    title: 'Team Portal',
    description: 'Team member access (Manager/Staff/Trainer)',
    email: 'team@gymfit.com'
  },
  member: {
    icon: User,
    color: 'bg-success',
    title: 'Member Portal',
    description: 'Track your fitness journey',
    email: 'member@gymfit.com'
  }
};

export default function Login() {
  const { authState, login } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (authState.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Set different emails based on role for team members
    const emails = {
      'super-admin': 'superadmin@gymfit.com',
      'admin': 'admin@gymfit.com',
      'team': 'manager@gymfit.com', // Default to manager for team
      'member': 'member@gymfit.com'
    };
    setCredentials({ email: emails[role], password: 'demo123' });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      await login({ ...credentials, role: selectedRole });
      toast({
        title: 'Welcome to GymFit Pro!',
        description: `Logged in as ${selectedRole}`,
      });
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-glow mb-6">
              <Dumbbell className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome to GymFit Pro
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Choose your role to access the appropriate dashboard
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(Object.entries(roleConfig) as [UserRole, typeof roleConfig.admin][]).map(([role, config]) => {
              const IconComponent = config.icon;
              return (
                <Card 
                  key={role}
                  className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-strong bg-white/95 backdrop-blur border-0"
                  onClick={() => handleRoleSelect(role)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 ${config.color} rounded-full mx-auto mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{config.title}</CardTitle>
                    <CardDescription className="text-sm">{config.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button className="w-full" variant="outline">
                      Continue as {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const selectedConfig = roleConfig[selectedRole];
  const IconComponent = selectedConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur border-0 shadow-strong">
        <CardHeader className="text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 ${selectedConfig.color} rounded-full mx-auto mb-4`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">{selectedConfig.title}</CardTitle>
          <CardDescription>{selectedConfig.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedRole(null)}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Demo Credentials:</strong><br />
              Email: {selectedConfig.email}<br />
              Password: demo123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
