import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Weight, Activity } from 'lucide-react';
import { format } from 'date-fns';

export const MemberProgress = () => {
  const { data: member, isLoading: memberLoading } = useMemberProfile();
  
  const { data: measurements, isLoading: measurementsLoading } = useSupabaseQuery(
    ['member-measurements', member?.id],
    async () => {
      if (!member?.id) throw new Error('Member not found');
      
      const { data, error } = await supabase
        .from('member_measurements')
        .select('*')
        .eq('member_id', member.id)
        .order('measured_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!member?.id
    }
  );

  if (memberLoading || measurementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">Member profile not found.</p>
      </div>
    );
  }

  const chartData = measurements?.map(m => ({
    date: format(new Date(m.measured_date), 'MMM dd'),
    weight: m.weight,
    bodyFat: m.body_fat_percentage,
    muscleMass: m.muscle_mass,
    bmi: m.bmi
  })) || [];

  const latestMeasurement = measurements?.[measurements.length - 1];
  const firstMeasurement = measurements?.[0];

  const weightChange = latestMeasurement && firstMeasurement 
    ? (latestMeasurement.weight || 0) - (firstMeasurement.weight || 0)
    : 0;

  const bodyFatChange = latestMeasurement && firstMeasurement
    ? (latestMeasurement.body_fat_percentage || 0) - (firstMeasurement.body_fat_percentage || 0)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Progress</h1>
        <p className="text-muted-foreground">Track your fitness journey and measurements</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : 'N/A'}
            </div>
            {weightChange !== 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {weightChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-orange-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
                {Math.abs(weightChange).toFixed(1)} kg from start
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Fat %</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMeasurement?.body_fat_percentage 
                ? `${latestMeasurement.body_fat_percentage}%` 
                : 'N/A'}
            </div>
            {bodyFatChange !== 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {bodyFatChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-orange-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
                {Math.abs(bodyFatChange).toFixed(1)}% from start
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BMI</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMeasurement?.bmi ? latestMeasurement.bmi.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Body Mass Index</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Muscle Mass</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMeasurement?.muscle_mass 
                ? `${latestMeasurement.muscle_mass} kg` 
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Current muscle mass</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Weight Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Weight (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Body Composition</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="bodyFat" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    name="Body Fat %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="muscleMass" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Muscle Mass (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Measurements Yet</h3>
            <p className="text-muted-foreground text-center">
              Your progress measurements will appear here once they are recorded by staff.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
