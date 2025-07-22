import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Download, 
  ExternalLink, 
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import type { Payment, PaymentStatus, PaymentType, PaymentGatewayType } from '@/types/payment';

interface PaymentStatusTrackerProps {
  payments: Payment[];
  loading?: boolean;
  onRefreshPayment: (paymentId: string) => void;
  onDownloadReceipt: (paymentId: string) => void;
  onViewDetails: (payment: Payment) => void;
}

export function PaymentStatusTracker({
  payments,
  loading = false,
  onRefreshPayment,
  onDownloadReceipt,
  onViewDetails
}: PaymentStatusTrackerProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<PaymentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = React.useState<PaymentType | 'all'>('all');
  const [gatewayFilter, setGatewayFilter] = React.useState<PaymentGatewayType | 'all'>('all');

  const getStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      processing: { variant: 'secondary' as const, icon: RefreshCw, color: 'text-blue-600' },
      success: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      failed: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      cancelled: { variant: 'outline' as const, icon: XCircle, color: 'text-gray-600' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentTypeColor = (type: PaymentType) => {
    const colors = {
      membership: 'bg-blue-100 text-blue-800',
      pos: 'bg-green-100 text-green-800',
      invoice: 'bg-orange-100 text-orange-800',
      training_fee: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredPayments = React.useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = payment.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.txnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesType = typeFilter === 'all' || payment.paymentType === typeFilter;
      const matchesGateway = gatewayFilter === 'all' || payment.gatewayType === gatewayFilter;

      return matchesSearch && matchesStatus && matchesType && matchesGateway;
    });
  }, [payments, searchTerm, statusFilter, typeFilter, gatewayFilter]);

  const getPaymentStats = () => {
    const total = payments.length;
    const successful = payments.filter(p => p.status === 'success').length;
    const pending = payments.filter(p => p.status === 'pending' || p.status === 'processing').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    const totalAmount = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);

    return { total, successful, pending, failed, totalAmount };
  };

  const stats = getPaymentStats();

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={(stats.successful / stats.total) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Payment Transactions
          </CardTitle>
          <CardDescription>
            Track and manage all payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by member, transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaymentStatus | 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as PaymentType | 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="membership">Membership</SelectItem>
                <SelectItem value="pos">POS</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="training_fee">Training Fee</SelectItem>
              </SelectContent>
            </Select>

            <Select value={gatewayFilter} onValueChange={(value) => setGatewayFilter(value as PaymentGatewayType | 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Gateways" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gateways</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
                <SelectItem value="payu">PayU</SelectItem>
                <SelectItem value="phonepe">PhonePe</SelectItem>
                <SelectItem value="ccavenue">CCAvenue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.txnId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.memberName || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{payment.memberId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPaymentTypeColor(payment.paymentType)}>
                          {payment.paymentType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">₹{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="capitalize">{payment.gatewayType}</div>
                        <div className="text-sm text-muted-foreground capitalize">{payment.paymentMethod}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <div>{format(payment.createdAt, 'MMM dd, yyyy')}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(payment.createdAt, 'hh:mm a')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(payment)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          {payment.status === 'success' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDownloadReceipt(payment.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {(payment.status === 'pending' || payment.status === 'processing') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRefreshPayment(payment.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}