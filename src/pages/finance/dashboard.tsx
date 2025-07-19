
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  BarChart3,
  Calendar
} from 'lucide-react';
import { mockFinancialSummary, mockMonthlyData, mockTransactions } from '@/mock/finance';
import { FinanceOverviewCards } from '@/components/finance/FinanceOverviewCards';
import { MonthlyTrendChart } from '@/components/finance/MonthlyTrendChart';
import { CategoryBreakdownChart } from '@/components/finance/CategoryBreakdownChart';
import { RecentTransactions } from '@/components/finance/RecentTransactions';
import { QuickActions } from '@/components/finance/QuickActions';

export default function FinanceDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
        <p className="text-muted-foreground">
          Track your gym's financial performance and manage transactions
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Overview Cards */}
      <FinanceOverviewCards summary={mockFinancialSummary} />

      {/* Charts and Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monthly Trends
            </CardTitle>
            <CardDescription>
              Income, expenses, and profit over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart data={mockMonthlyData} />
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Category Breakdown
            </CardTitle>
            <CardDescription>
              Income and expense distribution by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBreakdownChart transactions={mockTransactions} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Latest financial activities in your gym
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTransactions transactions={mockTransactions.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  );
}
