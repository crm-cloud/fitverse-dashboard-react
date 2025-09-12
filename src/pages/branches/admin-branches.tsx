import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, MapPin, Search, Filter, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface Branch {
  id: string;
  name: string;
  address: any;
  contact: any;
  hours: any;
  capacity: number;
  current_members: number;
  manager_id?: string;
  created_at: string;
  updated_at: string;
  gym_id?: string;
  status: string;
  amenities?: string[];
  gyms?: {
    name: string;
    subscription_plan?: string;
  };
  profiles?: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

export default function AdminBranchesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['admin-branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select(`
          *,
          gyms!branches_gym_id_fkey (name, subscription_plan),
          profiles!branches_manager_id_fkey (full_name, email, phone)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any;
    }
  });

  const filteredBranches = useMemo(() => {
    return (branches || []).filter((branch: any) => {
      const manager = Array.isArray(branch.profiles) ? branch.profiles[0] : branch.profiles;
      const matchesSearch = 
        branch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || branch.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [branches, searchTerm, statusFilter]);

  const sortedBranches = useMemo(() => {
    if (!sortConfig) return filteredBranches;

    return [...filteredBranches].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Branch];
      const bValue = b[sortConfig.key as keyof Branch];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredBranches, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || statusStyles.inactive}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branch Management</h1>
          <p className="text-muted-foreground">
            View and manage all branches across gyms
          </p>
        </div>
        <Button>
          <Building2 className="mr-2 h-4 w-4" />
          Add New Branch
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search branches..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      Branch Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Gym</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => requestSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBranches.length > 0 ? (
                  sortedBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {branch.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {branch.address?.city || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{branch.gyms?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {(() => {
                          const manager = Array.isArray(branch.profiles) ? branch.profiles[0] : branch.profiles;
                          return manager ? (
                            <div className="space-y-1">
                              <div className="font-medium">{manager.full_name}</div>
                              <div className="text-xs text-muted-foreground">{manager.email}</div>
                            </div>
                          ) : (
                            'Unassigned'
                          );
                        })()}
                      </TableCell>
                      <TableCell>{getStatusBadge(branch.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(branch.created_at), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No branches found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}