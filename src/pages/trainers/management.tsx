
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrainerConfigurationPanel } from '@/components/trainer/TrainerConfigurationPanel';
import { NotificationCenter } from '@/components/trainer/NotificationCenter';
import { TrainerBookingInterface } from '@/components/trainer/TrainerBookingInterface';
import { TrainerDashboard } from '@/components/trainer/TrainerDashboard';
import { TrainerUtilizationDashboard } from '@/components/trainer/TrainerUtilizationDashboard';
import { enhancedTrainers } from '@/mock/enhanced-trainers';
import { 
  Settings, 
  Bell, 
  Calendar, 
  BarChart3, 
  Users, 
  Plus,
  TrendingUp,
  Clock
} from 'lucide-react';

export const TrainerManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const branchId = 'branch_001';

  const totalTrainers = enhancedTrainers.length;
  const activeTrainers = enhancedTrainers.filter(t => t.isActive && t.status === 'active').length;
  const avgRating = enhancedTrainers.reduce((sum, t) => sum + t.rating, 0) / enhancedTrainers.length;
  const totalSessions = enhancedTrainers.reduce((sum, t) => sum + t.totalSessions, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trainer Management</h1>
          <p className="text-muted-foreground">
            Comprehensive trainer management and booking system
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Trainer
          </Button>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Book Session
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTrainers}</p>
                <p className="text-sm text-muted-foreground">Total Trainers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeTrainers}</p>
                <p className="text-sm text-muted-foreground">Active Trainers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSessions.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="booking">Book Session</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TrainerDashboard trainerId="trainer_001" />
        </TabsContent>

        <TabsContent value="booking">
          <TrainerBookingInterface 
            branchId={branchId}
            onBookingComplete={(bookingId) => {
              console.log('Booking completed:', bookingId);
            }}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <TrainerUtilizationDashboard />
        </TabsContent>

        <TabsContent value="settings">
          <TrainerConfigurationPanel 
            branchId={branchId}
            onConfigChange={(config) => {
              console.log('Configuration updated:', config);
            }}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter trainerId="trainer_001" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
