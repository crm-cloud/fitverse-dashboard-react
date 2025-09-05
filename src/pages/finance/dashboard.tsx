
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  BarChart3,
  Calendar,
  Plus,
  FileText,
  CreditCard
} from 'lucide-react';
import { mockFinancialSummary, mockMonthlyData, mockTransactions } from '@/utils/mockData';
import { FinanceOverviewCards } from '@/components/finance/FinanceOverviewCards';
import { MonthlyTrendChart } from '@/components/finance/MonthlyTrendChart';
import { CategoryBreakdownChart } from '@/components/finance/CategoryBreakdownChart';
import { RecentTransactions } from '@/components/finance/RecentTransactions';
import { QuickActions } from '@/components/finance/QuickActions';
import { TransactionTable } from '@/components/finance/TransactionTable';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { AddIncomeDialog } from '@/components/finance/AddIncomeDialog';
import { AddExpenseDialog } from '@/components/finance/AddExpenseDialog';
import { InvoiceCreationDialog } from '@/components/finance/InvoiceCreationDialog';
import { CategoryManagementDialog } from '@/components/finance/CategoryManagementDialog';
import { PermissionGate } from '@/components/PermissionGate';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function FinanceDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddTransaction = (data: any) => {
    // In a real app, this would make an API call
    toast({
      title: "Transaction Added",
      description: "The transaction has been successfully recorded.",
    });
    setShowTransactionForm(false);
  };

  const handleViewAllTransactions = () => {
    navigate('/finance/transactions');
  };

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Your financial report is being prepared.",
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
          <p className="text-muted-foreground">
            Track your gym's financial performance and manage transactions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PermissionGate permission="finance.view">
            <Button variant="outline" onClick={handleGenerateReport}>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </PermissionGate>
          
          <PermissionGate permission="finance.create">
            <Button onClick={() => setShowTransactionForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions 
        onAddIncome={() => setShowIncomeDialog(true)}
        onAddExpense={() => setShowExpenseDialog(true)}
        onCreateInvoice={() => setShowInvoiceDialog(true)}
        onViewReports={() => navigate('/finance/reports')}
        onManageCategories={() => setShowCategoryDialog(true)}
      />

      {/* Overview Cards */}
      <FinanceOverviewCards summary={mockFinancialSummary} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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

          {/* Recent Transactions Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Latest 5 financial activities
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleViewAllTransactions}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <RecentTransactions transactions={mockTransactions.slice(0, 5)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <TransactionTable
            transactions={mockTransactions}
            onExport={() => toast({
              title: "Export Started",
              description: "Your transaction export will be ready shortly.",
            })}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockFinancialSummary.totalIncome.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockFinancialSummary.totalExpenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +5.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockFinancialSummary.netProfit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Monthly Growth</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.3%</div>
                <p className="text-xs text-muted-foreground">
                  Consistent growth trend
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Charts */}
          <div className="grid gap-6 lg:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Financial Performance Over Time</CardTitle>
                <CardDescription>
                  Detailed view of income, expenses, and profit trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyTrendChart data={mockMonthlyData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Form */}
      <PermissionGate permission="finance.create">
        <TransactionForm
          open={showTransactionForm}
          onOpenChange={setShowTransactionForm}
          onSubmit={handleAddTransaction}
        />
      </PermissionGate>

      {/* Additional Dialogs */}
      <AddIncomeDialog
        open={showIncomeDialog}
        onOpenChange={setShowIncomeDialog}
        onSubmit={handleAddTransaction}
      />
      
      <AddExpenseDialog
        open={showExpenseDialog}
        onOpenChange={setShowExpenseDialog}
        onSubmit={handleAddTransaction}
      />
      
      <InvoiceCreationDialog
        open={showInvoiceDialog}
        onOpenChange={setShowInvoiceDialog}
        onSubmit={(data) => {
          toast({
            title: "Invoice Created",
            description: `Invoice ${data.invoiceNumber} has been created successfully.`,
          });
        }}
      />
      
      <CategoryManagementDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
      />
    </div>
  );
}
