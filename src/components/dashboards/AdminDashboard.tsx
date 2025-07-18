
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
  Star,
  UserPlus,
  Settings
} from 'lucide-react';

export const AdminDashboard = () => (
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
            <UserPlus className="w-6 h-6" />
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

    {/* Recent Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Member Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: 'John Smith', action: 'New membership', time: '2 hours ago', type: 'join' },
            { name: 'Sarah Wilson', action: 'Upgraded to Premium', time: '4 hours ago', type: 'upgrade' },
            { name: 'Mike Johnson', action: 'Completed workout', time: '6 hours ago', type: 'activity' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="font-medium">{activity.name}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-success-light rounded-lg">
            <Trophy className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-success">4.8</p>
            <p className="text-sm text-success">Customer Satisfaction</p>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <Target className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">92%</p>
            <p className="text-sm text-primary">Goal Achievement Rate</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
