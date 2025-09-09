
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranches } from '@/hooks/useBranches';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  MapPin, 
  Users, 
  Calendar,
  Plus,
  Search,
  Edit,
  MoreHorizontal,
  Phone,
  Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function BranchManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: branches = [], isLoading } = useBranches();

  const mockBranches = [
    {
      id: 'branch_1',
      name: 'Downtown Branch',
      address: '123 Main St, Downtown',
      city: 'New York',
      state: 'NY',
      phone: '+1 (555) 123-4567',
      email: 'downtown@gymfit.com',
      manager: 'Robert Kim',
      members: 450,
      staff: 12,
      status: 'active',
      revenue: '$125,000'
    },
    {
      id: 'branch_2',
      name: 'Uptown Fitness',
      address: '456 Oak Ave, Uptown',
      city: 'New York',
      state: 'NY',
      phone: '+1 (555) 234-5678',
      email: 'uptown@gymfit.com',
      manager: 'Sarah Johnson',
      members: 320,
      staff: 8,
      status: 'active',
      revenue: '$89,000'
    },
    {
      id: 'branch_3',
      name: 'Westside Gym',
      address: '789 Pine St, Westside',
      city: 'Los Angeles',
      state: 'CA',
      phone: '+1 (555) 345-6789',
      email: 'westside@gymfit.com',
      manager: 'Mike Rodriguez',
      members: 280,
      staff: 10,
      status: 'active',
      revenue: '$72,000'
    }
  ];

  // Use real branches if available, otherwise fall back to mock data
  const displayBranches = branches.length > 0 ? branches : mockBranches;
  
  const filteredBranches = displayBranches.filter(branch => {
    const name = branch.name?.toLowerCase() || '';
    const address = branch.address?.city?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase()) || address.includes(searchQuery.toLowerCase());
  });

  const handleEditBranch = (branch: any) => {
    navigate(`/branches/${branch.id}/edit`);
  };

  const handleViewDetails = (branch: any) => {
    navigate(`/branches/${branch.id}/details`);
  };

  const handleManageStaff = (branch: any) => {
    navigate(`/branches/${branch.id}/staff`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Branch Management</h1>
          <p className="text-muted-foreground">Manage gym branches and locations</p>
        </div>
        <Button onClick={() => window.location.href = '/branches/create'}>
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Branches</CardTitle>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">{isLoading ? '...' : displayBranches.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across 2 states</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              <span className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : displayBranches.reduce((sum, branch) => sum + (branch.current_members || branch.members || 0), 0)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active memberships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : displayBranches.reduce((sum, branch) => sum + (branch.staff || 0), 0)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-warning" />
              <span className="text-2xl font-bold text-foreground">$286K</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list">Branch List</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>

        <TabsContent value="list">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBranches.map((branch) => (
              <Card key={branch.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        {branch.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {branch.city}, {branch.state}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditBranch(branch)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Branch
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(branch)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageStaff(branch)}>
                          Manage Staff
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      {typeof branch.address === 'string' ? branch.address : 
                       branch.address?.street ? `${branch.address.street}, ${branch.address.city}, ${branch.address.state}` : 
                       'Address not available'}
                    </p>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {typeof branch.contact === 'string' ? branch.contact : 
                       branch.contact?.phone || branch.phone || 'Phone not available'}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {typeof branch.contact === 'string' ? branch.contact : 
                       branch.contact?.email || branch.email || 'Email not available'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Manager</span>
                      <span className="text-sm font-medium">{branch.manager || branch.manager_id || 'Not assigned'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Members</span>
                      <Badge variant="secondary">{branch.current_members || branch.members || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Capacity</span>
                      <Badge variant="outline">{branch.capacity || 'Not set'}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
                        {branch.status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <Badge variant="secondary">{branch.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(branch)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Branch Locations</CardTitle>
              <CardDescription>Geographic distribution of gym branches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Interactive map view coming soon</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will show all branch locations on an interactive map
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Branch Performance</CardTitle>
                <CardDescription>Revenue comparison across branches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {branches.map((branch) => (
                    <div key={branch.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{branch.name}</p>
                        <p className="text-sm text-muted-foreground">{branch.members} members</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{branch.revenue}</p>
                        <p className="text-xs text-muted-foreground">Monthly</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Trends</CardTitle>
                <CardDescription>Member growth across all branches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Analytics charts coming soon</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Visual representation of growth trends and performance metrics
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
