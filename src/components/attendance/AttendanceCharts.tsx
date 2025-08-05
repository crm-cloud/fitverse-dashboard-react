import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceSummary } from '@/types/attendance';

interface AttendanceChartsProps {
  summary: AttendanceSummary;
  isLoading?: boolean;
}

export const AttendanceCharts = ({ 
  summary, 
  isLoading = false 
}: AttendanceChartsProps) => {
  
  // Colors for charts
  const colors = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
    destructive: 'hsl(var(--destructive))',
    muted: 'hsl(var(--muted-foreground))'
  };

  const pieColors = [colors.primary, colors.secondary, colors.success, colors.warning];

  // Transform data for charts
  const peakHoursData = summary.peakHours.map(item => ({
    hour: `${item.hour}:00`,
    count: item.count,
    time: item.hour
  }));

  const busyDaysData = summary.busyDays.map(item => ({
    day: item.day.substring(0, 3), // Mon, Tue, etc.
    count: item.count,
    fullDay: item.day
  }));

  const methodData = Object.entries(summary.methodBreakdown).map(([method, count]) => ({
    name: method.charAt(0).toUpperCase() + method.slice(1),
    value: count,
    percentage: ((count / summary.totalRecords) * 100).toFixed(1)
  }));

  const branchData = summary.branchBreakdown.map(branch => ({
    name: branch.branchName.replace(' Branch', ''),
    count: branch.count,
    fullName: branch.branchName
  }));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Peak Hours Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Peak Hours Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Busiest times throughout the day
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="hour" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [value, 'Check-ins']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Bar 
                dataKey="count" 
                fill={colors.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Busy Days Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Weekly Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Most active days of the week
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={busyDaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [value, 'Total Visits']}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={colors.success}
                strokeWidth={3}
                dot={{ fill: colors.success, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: colors.success }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Entry Methods Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Entry Methods</CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribution of check-in methods used
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={methodData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                labelLine={false}
              >
                {methodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [value, 'Count']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Branch Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Branch Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Attendance distribution across branches
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={branchData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={80}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [value, 'Total Visits']}
                labelFormatter={(label) => `Branch: ${label}`}
              />
              <Bar 
                dataKey="count" 
                fill={colors.secondary}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};