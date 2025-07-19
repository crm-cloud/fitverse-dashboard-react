
import { useState } from 'react';
import { Transaction } from '@/types/finance';
import { TransactionTable } from '@/components/finance/TransactionTable';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockTransactions } from '@/mock/finance';
import { useToast } from '@/hooks/use-toast';
import { PermissionGate } from '@/components/PermissionGate';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleAddTransaction = (data: any) => {
    // In a real app, this would make an API call
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      category: mockTransactions[0].category, // This would be looked up by categoryId
      paymentMethod: mockTransactions[0].paymentMethod, // This would be looked up by paymentMethodId
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTransaction, ...prev]);
    toast({
      title: "Transaction Added",
      description: "The transaction has been successfully recorded.",
    });
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowForm(true);
  };

  const handleUpdateTransaction = (data: any) => {
    if (!selectedTransaction) return;

    setTransactions(prev => 
      prev.map(t => 
        t.id === selectedTransaction.id 
          ? { ...selectedTransaction, ...data, updatedAt: new Date().toISOString() }
          : t
      )
    );

    toast({
      title: "Transaction Updated",
      description: "The transaction has been successfully updated.",
    });
    setSelectedTransaction(undefined);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    toast({
      title: "Transaction Deleted",
      description: "The transaction has been successfully deleted.",
    });
  };

  const handleExportTransactions = () => {
    // In a real app, this would generate and download a CSV/Excel file
    toast({
      title: "Export Started",
      description: "Your transaction export will be ready shortly.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage all financial transactions for your gym
          </p>
        </div>
        
        <PermissionGate permission="finance.create">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </PermissionGate>
      </div>

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        onExport={handleExportTransactions}
      />

      {/* Transaction Form */}
      <PermissionGate permission="finance.create">
        <TransactionForm
          open={showForm}
          onOpenChange={setShowForm}
          transaction={selectedTransaction}
          onSubmit={selectedTransaction ? handleUpdateTransaction : handleAddTransaction}
        />
      </PermissionGate>
    </div>
  );
}
