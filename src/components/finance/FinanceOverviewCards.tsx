
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { FinancialSummary } from '@/types/finance';
import { useCurrency } from '@/hooks/useCurrency';

interface FinanceOverviewCardsProps {
  summary: FinancialSummary;
}

export function FinanceOverviewCards({ summary }: FinanceOverviewCardsProps) {
  const { formatCurrency } = useCurrency();

  const cards = [
    {
      title: 'Total Income',
      value: formatCurrency(summary.totalIncome),
      monthlyValue: formatCurrency(summary.monthlyIncome),
      icon: TrendingUp,
      trend: 'up',
      trendValue: '+12.5%',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses),
      monthlyValue: formatCurrency(summary.monthlyExpenses),
      icon: TrendingDown,
      trend: 'down',
      trendValue: '-8.2%',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(summary.netProfit),
      monthlyValue: formatCurrency(summary.monthlyProfit),
      icon: DollarSign,
      trend: 'up',
      trendValue: '+15.3%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Monthly Profit',
      value: formatCurrency(summary.monthlyProfit),
      monthlyValue: 'This month',
      icon: Wallet,
      trend: 'up',
      trendValue: '+5.7%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {card.monthlyValue}
              </p>
              <Badge 
                variant={card.trend === 'up' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {card.trend === 'up' ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {card.trendValue}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
