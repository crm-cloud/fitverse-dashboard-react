import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Dumbbell,
  Trophy,
  DollarSign,
  Target,
  Clock,
  Star
} from 'lucide-react';

const AdminDashboard = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
      <Badge variant="destructive">Admin Access</Badge>
    </div>
    
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-primary text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/90">Total Members</CardTitle>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-2xl font-bold">1,247</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-white/70">+12% from last month</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-secondary text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/90">Active Classes</CardTitle>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-2xl font-bold">24</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-white/70">6 scheduled today</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-accent text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/90">Monthly Revenue</CardTitle>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-2xl font-bold">$42,8K</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-white/70">+8% from last month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Equipment Status</CardTitle>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-success" />
            <span className="text-2xl font-bold text-foreground">98%</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">2 items under maintenance</p>
        </CardContent>
      </Card>
    </div>

    {/* Quick Actions */}
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used administrative tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20 flex flex-col gap-2">
            <Users className="w-6 h-6" />
            <span className="text-sm">Add Member</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Calendar className="w-6 h-6" />
            <span className="text-sm">Schedule Class</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Dumbbell className="w-6 h-6" />
            <span className="text-sm">Equipment Check</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm">View Reports</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

const TeamDashboard = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-foreground">Team Dashboard</h1>
      <Badge>Staff Access</Badge>
    </div>
    
    {/* Today's Schedule */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Today's Classes</CardTitle>
          <CardDescription>Your scheduled sessions for today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { time: '09:00 AM', class: 'Morning Yoga', members: 12, capacity: 15 },
            { time: '11:00 AM', class: 'HIIT Training', members: 8, capacity: 10 },
            { time: '02:00 PM', class: 'Strength Building', members: 15, capacity: 15 },
            { time: '06:00 PM', class: 'Cardio Blast', members: 20, capacity: 25 }
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium">{session.class}</p>
                  <p className="text-sm text-muted-foreground">{session.time}</p>
                </div>
              </div>
              <Badge variant="outline">
                {session.members}/{session.capacity}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-success-light rounded-lg">
            <Trophy className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-success">4.8</p>
            <p className="text-sm text-success">Average Rating</p>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">124</p>
            <p className="text-sm text-primary">Active Members</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const MemberDashboard = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
      <Badge variant="secondary">Member</Badge>
    </div>
    
    {/* Fitness Overview */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="bg-gradient-primary text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/90">This Week</CardTitle>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="text-2xl font-bold">5</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-white/70">Workouts completed</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-secondary text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/90">Next Goal</CardTitle>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="text-2xl font-bold">85%</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-white/70">Weight loss progress</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-warning" />
            <span className="text-2xl font-bold text-foreground">12</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Days in a row</p>
        </CardContent>
      </Card>
    </div>

    {/* Upcoming Classes */}
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Classes</CardTitle>
        <CardDescription>Your booked sessions this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { date: 'Today', time: '6:00 PM', class: 'Yoga Flow', instructor: 'Sarah M.' },
            { date: 'Tomorrow', time: '7:00 AM', class: 'HIIT Training', instructor: 'Mike R.' },
            { date: 'Wed', time: '5:30 PM', class: 'Strength Training', instructor: 'Alex K.' }
          ].map((booking, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{booking.class}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.date} at {booking.time} • {booking.instructor}
                </p>
              </div>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function Dashboard() {
  const { authState } = useAuth();
  
  if (!authState.user) return null;
  
  switch (authState.user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'team':
      return <TeamDashboard />;
    case 'member':
      return <MemberDashboard />;
    default:
      return <div>Invalid role</div>;
  }
}