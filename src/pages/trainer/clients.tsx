
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Search, MessageSquare, Calendar, Activity, TrendingUp } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';

export default function TrainerClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const clients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=150',
      sessions: 24,
      nextSession: 'Tomorrow 9:00 AM',
      progress: 85,
      goals: ['Weight Loss', 'Strength Building'],
      joinDate: '2023-06-01',
      status: 'active'
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      sessions: 18,
      nextSession: 'Today 10:30 AM',
      progress: 72,
      goals: ['Muscle Gain', 'Endurance'],
      joinDate: '2023-07-15',
      status: 'active'
    },
    {
      id: 3,
      name: 'Lisa Rodriguez',
      email: 'lisa@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      sessions: 32,
      nextSession: 'Today 2:00 PM',
      progress: 91,
      goals: ['Flexibility', 'Core Strength'],
      joinDate: '2023-05-10',
      status: 'active'
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Clients</h1>
          <p className="text-muted-foreground">
            Manage your client relationships and track their progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" />
            {clients.length} Active Clients
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <CardDescription>{client.email}</CardDescription>
                    </div>
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {client.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{client.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${client.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Sessions:</span> {client.sessions}</p>
                    <p><span className="text-muted-foreground">Next:</span> {client.nextSession}</p>
                    <p><span className="text-muted-foreground">Member since:</span> {new Date(client.joinDate).toLocaleDateString()}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Goals:</p>
                    <div className="flex flex-wrap gap-1">
                      {client.goals.map((goal, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <PermissionGate permission="trainer.clients.manage">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                    </PermissionGate>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Client Progress Overview
              </CardTitle>
              <CardDescription>Track your clients' fitness journey and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={client.avatar} alt={client.name} />
                        <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.sessions} sessions completed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{client.progress}%</p>
                        <p className="text-xs text-muted-foreground">Progress</p>
                      </div>
                      <PermissionGate permission="trainer.progress.track">
                        <Button size="sm" variant="outline">
                          <Activity className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Communications</CardTitle>
              <CardDescription>Message history with your clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No recent communications</p>
                <Button variant="outline">
                  Send New Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
