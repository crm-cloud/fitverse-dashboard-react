
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Clock,
  Star,
  CheckCircle,
  MessageSquare,
  Clipboard,
  Coffee
} from 'lucide-react';

export const StaffDashboard = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
      <Badge variant="secondary">Staff Access</Badge>
    </div>
    
    {/* Today's Schedule */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Your tasks and appointments for today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { time: '09:00 AM', task: 'Front desk duty', status: 'completed' },
            { time: '11:00 AM', task: 'Member orientation - John Doe', status: 'current' },
            { time: '02:00 PM', task: 'Equipment maintenance check', status: 'upcoming' },
            { time: '04:00 PM', task: 'Member consultation - Sarah K.', status: 'upcoming' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium">{item.task}</p>
                  <p className="text-sm text-muted-foreground">{item.time}</p>
                </div>
              </div>
              <Badge variant={
                item.status === 'completed' ? 'default' :
                item.status === 'current' ? 'destructive' : 'outline'
              }>
                {item.status === 'completed' ? <CheckCircle className="w-3 h-3 mr-1" /> : null}
                {item.status}
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
            <Star className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-success">4.9</p>
            <p className="text-sm text-success">Member Rating</p>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">28</p>
            <p className="text-sm text-primary">Members Helped Today</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Quick Actions */}
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common daily tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20 flex flex-col gap-2">
            <Users className="w-6 h-6" />
            <span className="text-sm">Check In Member</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <MessageSquare className="w-6 h-6" />
            <span className="text-sm">Member Support</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Clipboard className="w-6 h-6" />
            <span className="text-sm">Daily Report</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Coffee className="w-6 h-6" />
            <span className="text-sm">Break Time</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
