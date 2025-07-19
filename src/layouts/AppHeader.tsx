
import { Bell, User, LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationCenter } from '@/components/ui/notification-center';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BranchSelector } from '@/components/BranchSelector';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const AppHeader = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  if (!authState.user) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'team': return 'default';
      case 'member': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          
          {/* Branch Selector for Admin Users */}
          {authState.user.role === 'admin' && (
            <BranchSelector />
          )}
          
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-foreground">
              Welcome back, {authState.user.name.split(' ')[0]}!
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <NotificationCenter />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={authState.user.avatar} alt={authState.user.name} />
                  <AvatarFallback className="bg-gradient-primary text-white text-sm">
                    {getInitials(authState.user.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3 p-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={authState.user.avatar} alt={authState.user.name} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {getInitials(authState.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{authState.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{authState.user.email}</p>
                    <Badge variant={getRoleBadgeVariant(authState.user.role)} className="text-xs mt-1">
                      {authState.user.role.charAt(0).toUpperCase() + authState.user.role.slice(1)}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleProfileClick}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
