
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Settings 
} from 'lucide-react';

interface QuickActionsProps {
  onAddIncome?: () => void;
  onAddExpense?: () => void;
  onCreateInvoice?: () => void;
  onViewReports?: () => void;
  onManageCategories?: () => void;
}

export function QuickActions({
  onAddIncome,
  onAddExpense,
  onCreateInvoice,
  onViewReports,
  onManageCategories,
}: QuickActionsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={onAddIncome}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Add Income
          </Button>
          
          <Button 
            variant="outline"
            onClick={onAddExpense}
            className="flex items-center gap-2"
          >
            <TrendingDown className="w-4 h-4" />
            Add Expense
          </Button>
          
          <Button 
            variant="outline"
            onClick={onCreateInvoice}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Create Invoice
          </Button>
          
          <Button 
            variant="outline"
            onClick={onViewReports}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            View Reports
          </Button>
          
          <Button 
            variant="ghost"
            onClick={onManageCategories}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Manage Categories
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
