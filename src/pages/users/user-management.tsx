import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, Search, Filter, ArrowUpDown, Download, MoreHorizontal, 
  UserCheck, UserPlus, UserX, ArrowLeft, Edit, Trash2, Mail, 
  Phone, MapPin, Calendar, CheckCircle2, XCircle, MoreVertical 
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { getUsers, getUserById } from '@/lib/supabase';

interface Branch {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'inactive';
  members_count: number;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'manager' | 'trainer' | 'member';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  last_login?: string;
  created_at: string;
  subscription_plan?: string;
  phone?: string;
  location?: string;
  bio?: string;
  branches?: Branch[];
}

// User List Component
const UserList = ({ 
  users, 
  onUserSelect, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  roleFilter, 
  setRoleFilter,
  sortConfig,
  requestSort
}: { 
  users: User[];
  onUserSelect: (user: User) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  requestSort: (key: string) => void;
}) => (
  <div className="space-y-4">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-lg font-semibold">User Management</h2>
        <p className="text-sm text-muted-foreground">
          Manage all users and their permissions
        </p>
      </div>
      <Button>
        <UserPlus className="mr-2 h-4 w-4" />
        Add New User
      </Button>
    </div>

    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users..."
          className="w-full pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="trainer">Trainer</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => requestSort('last_login')}
            >
              <div className="flex items-center">
                Last Login
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onUserSelect(user)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar_url} alt={user.full_name} />
                      <AvatarFallback>
                        {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.full_name || 'Unnamed User'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={{
                      'admin': 'bg-purple-100 text-purple-800',
                      'manager': 'bg-blue-100 text-blue-800',
                      'trainer': 'bg-cyan-100 text-cyan-800',
                      'member': 'bg-green-100 text-green-800'
                    }[user.role] || 'bg-gray-100 text-gray-800'}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={{
                      'active': 'bg-green-50 text-green-700 border-green-200',
                      'inactive': 'bg-gray-50 text-gray-700 border-gray-200',
                      'suspended': 'bg-red-50 text-red-700 border-red-200',
                      'pending': 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }[user.status] || 'bg-gray-50 text-gray-700 border-gray-200'}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.last_login ? format(new Date(user.last_login), 'MMM d, yyyy') : 'Never'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onUserSelect(user);
                      }}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No users found matching your criteria
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  </div>
);

// User Detail Component
const UserDetail = ({ user, onBack }: { user: User; onBack: () => void }) => (
  <div className="space-y-6">
    <Button variant="ghost" onClick={onBack} className="mb-4">
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Users
    </Button>

    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-6 md:col-span-1">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback className="text-2xl">
                  {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{user.full_name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge className="mt-2">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="ml-2">{user.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="ml-2">{user.location || 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Member Since:</span>
                <span className="ml-2">
                  {format(new Date(user.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center text-sm">
                {user.status === 'active' ? (
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                )}
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2 capitalize">{user.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Mail className="mr-2 h-4 w-4" />
              Send Message
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            {user.status === 'active' ? (
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                <UserX className="mr-2 h-4 w-4" />
                Deactivate User
              </Button>
            ) : (
              <Button variant="outline" className="w-full justify-start text-green-600 hover:text-green-700">
                <UserCheck className="mr-2 h-4 w-4" />
                Activate User
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                <p>{user.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Role</h4>
                <p className="capitalize">{user.role}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Account Status</h4>
                <div className="flex items-center">
                  {user.status === 'active' ? (
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                  )}
                  <span className="capitalize">{user.status}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Last Login</h4>
                <p>{user.last_login ? format(new Date(user.last_login), 'PPpp') : 'Never'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Member Since</h4>
                <p>{format(new Date(user.created_at), 'PP')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {user.role === 'admin' && user.branches && user.branches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Managed Branches</CardTitle>
              <CardDescription>
                Branches managed by this administrator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.branches.map((branch) => (
                  <div key={branch.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{branch.name}</h4>
                        <p className="text-sm text-muted-foreground">{branch.address}</p>
                      </div>
                      <Badge variant={branch.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                        {branch.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                      <span>{branch.members_count} members</span>
                      <span>Created {format(new Date(branch.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  </div>
);

// Mock data for users - replace with actual API call in production
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin',
    status: 'active',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    branches: [
      {
        id: 'b1',
        name: 'Downtown Branch',
        address: '123 Main St',
        status: 'active',
        members_count: 150,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: '2',
    email: 'trainer@example.com',
    full_name: 'Trainer One',
    role: 'trainer',
    status: 'active',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: '3',
    email: 'member@example.com',
    full_name: 'Member One',
    role: 'member',
    status: 'active',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    last_login: new Date(Date.now() - 86400000).toISOString()
  }
];

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('admin'); // Default to showing only admins
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { userId } = useParams();

  const location = useLocation();
  
  // Fetch users using Supabase
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers,
    refetchOnWindowFocus: false
  });
  
  // Fetch single user when userId is present in the URL
  const { data: currentUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userId ? getUserById(userId) : null,
    enabled: !!userId && !selectedUser,
    onSuccess: (data) => {
      if (data) setSelectedUser(data);
    }
  });
  
  // Navigation handler to go back to the user list
  const handleBackToList = () => {
    setSelectedUser(null);
    navigate('/users');
  };

  // Filter users based on role and status
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesSearch = searchTerm === '' || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm);
      
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, roleFilter, statusFilter, searchTerm]);

  // Handle back to list view
  const handleBackToList = () => {
    setSelectedUser(null);
    navigate('/users');
  };
  
  // Handle user selection
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    navigate(`/users/${user.id}`);
  };

  // Loading state component
  const LoadingState = () => (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-32" />
          </Card>
        ))}
      </div>
    </div>
  );

  // Error state component
  const ErrorState = ({ error }: { error: Error }) => (
    <div className="p-6 text-center text-red-500">
      <p>Error loading users: {error.message}</p>
      <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
        Retry
      </Button>
    </div>
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (selectedUser || userId) {
    const userToShow = selectedUser || users.find(u => u.id === userId);
    if (userToShow) {
      return <UserDetail user={userToShow} onBack={handleBackToList} />;
    }
    // If user not found, go back to list
    handleBackToList();
  }

  // Sort users
  const sortedUsers = useMemo(() => {
    if (!sortConfig) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof User];
      const bValue = b[sortConfig.key as keyof User];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortConfig]);

  // Handle sort request
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };



  // ... (rest of the code remains the same)

  // Show user list by default
  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { 
                title: 'Total Users', 
                value: users.length, 
                icon: Users,
                trend: '+12.5%',
                trendType: 'positive'
              },
              { 
                title: 'Active Users', 
                value: users.filter(u => u.status === 'active').length, 
                icon: UserCheck,
                trend: '+5.2%',
                trendType: 'positive'
              },
              { 
                title: 'Admins', 
                value: users.filter(u => u.role === 'admin').length, 
                icon: UserCheck,
                trend: '+2.1%',
                trendType: 'positive'
              },
              { 
                title: 'Inactive Users', 
                value: users.filter(u => u.status === 'inactive').length, 
                icon: UserX,
                trend: '-1.3%',
                trendType: 'negative'
              },
            ].map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs mt-1 ${stat.trendType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.trend} from last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest user activities and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users?.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.avatar_url} alt={user.full_name} />
                        <AvatarFallback>
                          {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last login: {user.last_login ? format(new Date(user.last_login), 'MMM d, yyyy') : 'Never'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserList 
            users={sortedUsers}
            onUserSelect={handleUserSelect}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            sortConfig={sortConfig}
            requestSort={requestSort}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}