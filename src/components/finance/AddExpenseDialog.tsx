import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionForm } from './TransactionForm';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function AddExpenseDialog({ open, onOpenChange, onSubmit }: AddExpenseDialogProps) {
  const handleSubmit = (data: any) => {
    onSubmit({
      ...data,
      type: 'expense',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby="add-expense-description">
        <DialogHeader>
          <DialogTitle>Add Expense Transaction</DialogTitle>
          <DialogDescription id="add-expense-description">
            Record a new expense transaction for your business
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          open={true}
          onOpenChange={() => {}}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}