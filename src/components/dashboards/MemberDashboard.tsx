
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Target,
  Star,
  Calendar,
  Trophy,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';

export const MemberDashboard = () => (
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

    {/* Fitness Journey */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { title: 'First Week Complete', description: 'Completed 7 consecutive days', earned: true },
            { title: 'Strength Builder', description: 'Lifted 1000 lbs total', earned: true },
            { title: 'Cardio King', description: 'Ran 50 miles this month', earned: false }
          ].map((achievement, index) => (
            <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${achievement.earned ? 'bg-yellow-50 border border-yellow-200' : 'bg-muted'}`}>
              <Trophy className={`w-6 h-6 ${achievement.earned ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              <div>
                <p className="font-medium">{achievement.title}</p>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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

    {/* Quick Actions */}
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Start your fitness journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20 flex flex-col gap-2">
            <Calendar className="w-6 h-6" />
            <span className="text-sm">Book Class</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Target className="w-6 h-6" />
            <span className="text-sm">Set Goals</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm">View Progress</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Zap className="w-6 h-6" />
            <span className="text-sm">Quick Workout</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
