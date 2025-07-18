
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Clock,
  Star,
  Trophy,
  Activity,
  Target,
  Dumbbell
} from 'lucide-react';

export const TrainerDashboard = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-foreground">Trainer Dashboard</h1>
      <Badge>Trainer Access</Badge>
    </div>
    
    {/* Today's Classes */}
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
          <CardTitle>Performance</CardTitle>
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
            <p className="text-sm text-primary">Active Clients</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Training Tools */}
    <Card>
      <CardHeader>
        <CardTitle>Training Tools</CardTitle>
        <CardDescription>Quick access to training resources</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20 flex flex-col gap-2">
            <Calendar className="w-6 h-6" />
            <span className="text-sm">Schedule Class</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Target className="w-6 h-6" />
            <span className="text-sm">Member Goals</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Activity className="w-6 h-6" />
            <span className="text-sm">Progress Track</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Dumbbell className="w-6 h-6" />
            <span className="text-sm">Workout Plans</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
