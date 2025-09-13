import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FileText, 
  Download, 
  Send, 
  Edit, 
  Eye, 
  Filter,
  Search,
  Mail,
  MessageSquare,
  MessageCircle,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvoiceCreationDialog } from '@/components/finance/InvoiceCreationDialog';
import { InvoiceDetailsDialog } from '@/components/finance/InvoiceDetailsDialog';
import { InvoiceWorkflowDialog } from '@/components/finance/InvoiceWorkflowDialog';
import { PaymentRecorderDialog } from '@/components/finance/PaymentRecorderDialog';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  description: string;
}

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    amount: 1500,
    status: 'paid',
    dueDate: '2024-01-15',
    createdAt: '2024-01-01',
    description: 'Annual Membership Premium'
  },
  {
    id: '2', 
    invoiceNumber: 'INV-2024-002',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah@example.com',
    amount: 850,
    status: 'sent',
    dueDate: '2024-01-20',
    createdAt: '2024-01-05',
    description: 'Personal Training Package'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003', 
    customerName: 'Mike Johnson',
    amount: 2200,
    status: 'overdue',
    dueDate: '2024-01-10',
    createdAt: '2023-12-28',
    description: 'Corporate Membership - 5 Users'
  }
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'sent': return 'secondary';
      case 'overdue': return 'destructive';
      case 'draft': return 'outline';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'sent': return 'text-blue-600'; 
      case 'overdue': return 'text-red-600';
      case 'draft': return 'text-gray-600';
      case 'cancelled': return 'text-gray-500';
      default: return 'text-gray-600';
    }
  };

  const handleCreateInvoice = (invoiceData: any) => {
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      ...invoiceData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    const updatedInvoices = [...invoices, newInvoice];
    setInvoices(updatedInvoices);
    setFilteredInvoices(updatedInvoices);
    
    toast({
      title: 'Invoice Created',
      description: `Invoice ${newInvoice.invoiceNumber} has been created successfully.`
    });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsDialog(true);
  };

  const handleSendInvoice = (invoice: Invoice, method: 'email' | 'sms' | 'whatsapp') => {
    setSelectedInvoice(invoice);
    setShowWorkflowDialog(true);
  };

  const handlePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentDialog(true);
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'paid' as const } : inv
    );
    setInvoices(updatedInvoices);
    setFilteredInvoices(updatedInvoices);
    
    toast({
      title: 'Payment Recorded',
      description: 'Invoice has been marked as paid successfully.'
    });
  };

  const handleDownloadInvoice = (invoice: Invoice, type: 'pdf' | 'gst' | 'non-gst') => {
    toast({
      title: 'Download Started',
      description: `Downloading ${type.toUpperCase()} invoice for ${invoice.invoiceNumber}`
    });
  };

  // Filter invoices based on search and status
  const filterInvoices = () => {
    let filtered = invoices;
    
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    setFilteredInvoices(filtered);
  };

  // Update filters when search term or status filter changes
  React.useEffect(() => {
    filterInvoices();
  }, [searchTerm, statusFilter, invoices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">Create, send, and manage invoices with workflow automation</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').reduce((sum, inv) => sum + inv.amount, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Manage all your invoices and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                      <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{invoice.description}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(invoice.amount)}</p>
                  <p className="text-sm text-muted-foreground">Due: {invoice.dueDate}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleViewInvoice(invoice)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {invoice.status !== 'paid' && (
                    <Button variant="outline" size="sm" onClick={() => handlePayment(invoice)}>
                      <CreditCard className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSendInvoice(invoice, 'email')}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownloadInvoice(invoice, 'pdf')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredInvoices.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No invoices found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <InvoiceCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateInvoice}
      />
      
      {selectedInvoice && (
        <>
          <InvoiceDetailsDialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            invoice={selectedInvoice}
            onDownload={(type) => handleDownloadInvoice(selectedInvoice, type)}
            onMarkAsPaid={() => handleMarkAsPaid(selectedInvoice.id)}
          />
          
          <InvoiceWorkflowDialog
            open={showWorkflowDialog}
            onOpenChange={setShowWorkflowDialog}
            invoice={selectedInvoice}
          />
          
          <PaymentRecorderDialog
            open={showPaymentDialog}
            onOpenChange={setShowPaymentDialog}
            invoice={selectedInvoice}
            onPaymentRecorded={() => handleMarkAsPaid(selectedInvoice.id)}
          />
        </>
      )}
    </div>
  );
}