import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import type { Payment, PaymentAnalytics } from '@/types/payment';

interface PaymentDashboardProps {
  payments: Payment[];
  analytics: PaymentAnalytics[];
}

export function PaymentDashboard({ payments, analytics }: PaymentDashboardProps) {
  const getPaymentStats = () => {
    const total = payments.length;
    const successful = payments.filter(p => p.status === 'success').length;
    const pending = payments.filter(p => p.status === 'pending' || p.status === 'processing').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    
    const totalAmount = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
    const todayAmount = payments
      .filter(p => p.status === 'success' && isToday(p.completedAt))
      .reduce((sum, p) => sum + p.amount, 0);
    
    const successRate = total > 0 ? (successful / total) * 100 : 0;
    
    return {
      total,
      successful,
      pending,
      failed,
      totalAmount,
      todayAmount,
      successRate
    };
  };

  const isToday = (date?: Date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getGatewayPerformance = () => {
    const gatewayStats = payments.reduce((acc, payment) => {
      const gateway = payment.gatewayType;
      if (!acc[gateway]) {
        acc[gateway] = { total: 0, successful: 0, amount: 0 };
      }
      acc[gateway].total += 1;
      if (payment.status === 'success') {
        acc[gateway].successful += 1;
        acc[gateway].amount += payment.amount;
      }
      return acc;
    }, {} as Record<string, { total: number; successful: number; amount: number }>);

    return Object.entries(gatewayStats).map(([gateway, stats]) => ({
      gateway,
      successRate: stats.total > 0 ? (stats.successful / stats.total) * 100 : 0,
      totalTransactions: stats.total,
      successfulAmount: stats.amount
    }));
  };

  const getPaymentTypeDistribution = () => {
    const typeStats = payments.reduce((acc, payment) => {
      const type = payment.paymentType;
      if (!acc[type]) {
        acc[type] = { count: 0, amount: 0 };
      }
      acc[type].count += 1;
      if (payment.status === 'success') {
        acc[type].amount += payment.amount;
      }
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    return Object.entries(typeStats).map(([type, stats]) => ({
      name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: stats.amount,
      count: stats.count
    }));
  };

  const stats = getPaymentStats();
  const gatewayPerformance = getGatewayPerformance();
  const paymentTypeDistribution = getPaymentTypeDistribution();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const chartData = analytics.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: item.successfulAmount,
    transactions: item.successfulTransactions,
    successRate: item.successRate
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Today: ₹{stats.todayAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.successRate >= 90 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {stats.successful}/{stats.total} successful
                  </span>
                </div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <Progress value={stats.successRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Requires attention
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Payments</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Need investigation
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gateways">Gateway Performance</TabsTrigger>
          <TabsTrigger value="types">Payment Types</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue Trend
              </CardTitle>
              <CardDescription>
                Daily revenue and transaction volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'amount' ? `₹${value.toLocaleString()}` : value,
                      name === 'amount' ? 'Revenue' : 'Transactions'
                    ]}
                  />
                  <Bar dataKey="amount" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gateways" className="space-y-6">
          <div className="grid gap-4">
            {gatewayPerformance.map((gateway) => (
              <Card key={gateway.gateway}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium capitalize">{gateway.gateway}</h3>
                      <p className="text-sm text-muted-foreground">
                        {gateway.totalTransactions} transactions
                      </p>
                    </div>
                    <Badge variant={gateway.successRate >= 90 ? "default" : "secondary"}>
                      {gateway.successRate.toFixed(1)}% success
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>{gateway.successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={gateway.successRate} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Revenue</span>
                      <span>₹{gateway.successfulAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="types" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Payment Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={paymentTypeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Type Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentTypeDistribution.map((type, index) => (
                    <div key={type.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium">{type.name}</p>
                          <p className="text-sm text-muted-foreground">{type.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{type.value.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}