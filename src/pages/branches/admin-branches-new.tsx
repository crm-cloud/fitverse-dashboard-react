import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, MapPin, Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

type BranchStatus = 'active' | 'inactive' | 'maintenance';

interface BranchAddress {
  street?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface BranchContact {
  phone: string;
  email: string;
  website?: string;
}

interface BranchManager {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface BranchGym {
  name: string;
  subscription_plan: string;
}

interface Branch {
  id: string;
  name: string;
  address: BranchAddress;
  contact: BranchContact;
  status: BranchStatus;
  createdAt: string;
  updatedAt: string;
  gym: BranchGym;
  manager?: BranchManager;
  stats?: {
    member_count: number;
    trainer_count: number;
    active_classes: number;
  };
}

export default function AdminBranchesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ 
    key: keyof Branch; 
    direction: 'asc' | 'desc' 
  } | null>(null);

  const { data: branches = [], isLoading, error } = useQuery<Branch[]>({
    queryKey: ['admin-branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select(`
          *,
          gym:gym_id (name, subscription_plan),
          manager:manager_id (id, name, email, phone)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Branch interface
      return (data || []).map((branch: any) => ({
        ...branch,
        address: typeof branch.address === 'string' ? JSON.parse(branch.address) : branch.address,
        createdAt: branch.created_at,
        updatedAt: branch.updated_at,
        manager: branch.manager ? {
          id: branch.manager.id,
          name: branch.manager.name,
          email: branch.manager.email,
          phone: branch.manager.phone
        } : undefined
      }));
    }
  });

  const filteredBranches = branches.filter((branch: Branch) => {
    const searchLower = searchTerm.toLowerCase();
    const address = branch.address;
    
    const matchesSearch = 
      branch.name.toLowerCase().includes(searchLower) ||
      (address.city || '').toLowerCase().includes(searchLower) ||
      branch.manager?.name?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || branch.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedBranches = [...filteredBranches].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key as keyof Branch];
    const bValue = b[sortConfig.key as keyof Branch];
    
    // Handle nested properties
    if (sortConfig.key === 'manager') {
      const aName = a.manager?.name || '';
      const bName = b.manager?.name || '';
      return sortConfig.direction === 'asc' 
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: keyof Branch) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
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

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading branches</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{(error as Error).message}</p>
              </div>
            </div>
          </div>
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
          <Plus className="mr-2 h-4 w-4" />
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
                          {[branch.address.city, branch.address.state, branch.address.country].filter(Boolean).join(', ')}
                        </div>
                      </TableCell>
                      <TableCell>{branch.gym?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {branch.manager ? (
                          <div className="space-y-1">
                            <div className="font-medium">{branch.manager.name}</div>
                            <div className="text-xs text-muted-foreground">{branch.manager.email}</div>
                          </div>
                        ) : (
                          'Unassigned'
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(branch.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(branch.createdAt), 'MMM d, yyyy')}
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
