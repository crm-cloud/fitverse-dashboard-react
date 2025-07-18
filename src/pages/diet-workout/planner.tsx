
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Apple, 
  Dumbbell, 
  Plus, 
  TrendingUp, 
  Target,
  Calendar,
  Users,
  Heart,
  Brain
} from 'lucide-react';
import { DietPlanList } from '@/components/diet-workout/DietPlanList';
import { WorkoutPlanList } from '@/components/diet-workout/WorkoutPlanList';
import { MemberDashboardView } from '@/components/diet-workout/MemberDashboardView';
import { AIInsightsPanel } from '@/components/diet-workout/AIInsightsPanel';
import { PlanStatsOverview } from '@/components/diet-workout/PlanStatsOverview';

export const DietWorkoutPlannerPage = () => {
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!authState.user) return null;

  const isMember = authState.user.role === 'member';
  const canCreatePlans = ['admin', 'trainer'].includes(authState.user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Diet & Workout Planner</h1>
          <p className="text-muted-foreground">
            {isMember 
              ? 'Track your fitness journey and follow personalized plans'
              : 'Create and manage diet and workout plans for members'
            }
          </p>
        </div>
        <Badge variant="secondary">
          {authState.user.role.charAt(0).toUpperCase() + authState.user.role.slice(1)}
        </Badge>
      </div>

      {isMember ? (
        <MemberDashboardView memberId={authState.user.id} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="diet-plans" className="flex items-center gap-2">
              <Apple className="w-4 h-4" />
              Diet Plans
            </TabsTrigger>
            <TabsTrigger value="workout-plans" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Workout Plans
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PlanStatsOverview />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Diet Plans</CardTitle>
                  <div className="flex items-center gap-2">
                    <Apple className="w-4 h-4 text-green-500" />
                    <span className="text-2xl font-bold">12</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">+2 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Workout Plans</CardTitle>
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-blue-500" />
                    <span className="text-2xl font-bold">8</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">+1 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Member Assignments</CardTitle>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="text-2xl font-bold">45</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">85% completion rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Progress</CardTitle>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    <span className="text-2xl font-bold">78%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">+5% from last month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="diet-plans">
            <DietPlanList canCreate={canCreatePlans} />
          </TabsContent>

          <TabsContent value="workout-plans">
            <WorkoutPlanList canCreate={canCreatePlans} />
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Member Plan Assignments</CardTitle>
                <CardDescription>Manage diet and workout plan assignments for members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Assignment management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <AIInsightsPanel />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
