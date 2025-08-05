import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Key, BarChart3, Users, AlertTriangle } from 'lucide-react';
import { Locker, LockerFilters as LockerFiltersType } from '@/types/locker';
import { mockLockers, mockLockerSummary, mockLockerAssignments } from '@/mock/lockers';
import { LockerCard } from '@/components/lockers/LockerCard';
import { LockerFilters } from '@/components/lockers/LockerFilters';
import { LockerForm } from '@/components/lockers/LockerForm';
import { AssignLockerDrawer } from '@/components/lockers/AssignLockerDrawer';
import { PermissionGate } from '@/components/PermissionGate';
import { useToast } from '@/hooks/use-toast';

// Mock branches data
const mockBranches = [
  { id: '1', name: 'Downtown Branch' },
  { id: '2', name: 'Westside Branch' },
  { id: '3', name: 'Northside Branch' },
];

export default function LockerManagement() {
  const [lockers, setLockers] = useState<Locker[]>(mockLockers);
  const [filters, setFilters] = useState<LockerFiltersType>({});
  const [showLockerForm, setShowLockerForm] = useState(false);
  const [showAssignDrawer, setShowAssignDrawer] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<Locker | undefined>();
  const [selectedMember, setSelectedMember] = useState({ id: '', name: '' });
  const { toast } = useToast();

  // Filter lockers based on current filters
  const filteredLockers = lockers.filter(locker => {
    if (filters.search && !locker.number.toLowerCase().includes(filters.search.toLowerCase()) &&
        !locker.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.branchId && locker.branchId !== filters.branchId) {
      return false;
    }
    if (filters.status && filters.status !== 'all' && locker.status !== filters.status) {
      return false;
    }
    if (filters.size && locker.size.id !== filters.size) {
      return false;
    }
    return true;
  });

  const handleAddLocker = (data: any) => {
    const newLocker: Locker = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      assignedMemberId: undefined,
      assignedMemberName: undefined,
      assignedDate: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLockers(prev => [newLocker, ...prev]);
    toast({
      title: "Locker Added",
      description: "The locker has been successfully added.",
    });
  };

  const handleEditLocker = (locker: Locker) => {
    setSelectedLocker(locker);
    setShowLockerForm(true);
  };

  const handleUpdateLocker = (data: any) => {
    if (!selectedLocker) return;

    setLockers(prev => 
      prev.map(l => 
        l.id === selectedLocker.id 
          ? { ...selectedLocker, ...data, updatedAt: new Date().toISOString() }
          : l
      )
    );

    toast({
      title: "Locker Updated",
      description: "The locker has been successfully updated.",
    });
    setSelectedLocker(undefined);
  };

  const handleDeleteLocker = (lockerId: string) => {
    setLockers(prev => prev.filter(l => l.id !== lockerId));
    toast({
      title: "Locker Deleted",
      description: "The locker has been successfully deleted.",
    });
  };

  const handleAssignLocker = (locker: Locker) => {
    // In a real app, this would open a member selection dialog
    setSelectedMember({ id: 'mock-member', name: 'Mock Member' });
    setSelectedLocker(locker);
    setShowAssignDrawer(true);
  };

  const handleReleaseLocker = (locker: Locker) => {
    setLockers(prev => 
      prev.map(l => 
        l.id === locker.id 
          ? { 
              ...l, 
              status: 'available' as const,
              assignedMemberId: undefined,
              assignedMemberName: undefined,
              assignedDate: undefined,
              releaseDate: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : l
      )
    );

    toast({
      title: "Locker Released",
      description: "The locker has been successfully released.",
    });
  };

  const handleAssignComplete = (data: any) => {
    if (!selectedLocker) return;

    setLockers(prev => 
      prev.map(l => 
        l.id === selectedLocker.id 
          ? { 
              ...l, 
              status: 'occupied' as const,
              assignedMemberId: data.memberId,
              assignedMemberName: data.memberName,
              assignedDate: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : l
      )
    );

    toast({
      title: "Locker Assigned",
      description: `Locker ${selectedLocker.number} has been assigned to ${data.memberName}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locker Management</h1>
          <p className="text-muted-foreground">
            Manage locker assignments and availability across all branches
          </p>
        </div>
        
        <PermissionGate permission="finance.create">
          <Button onClick={() => setShowLockerForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Locker
          </Button>
        </PermissionGate>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lockers</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLockerSummary.totalLockers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Key className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockLockerSummary.availableLockers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockLockerSummary.occupiedLockers}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockLockerSummary.occupancyRate}% occupancy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockLockerSummary.monthlyRevenue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <LockerFilters
            filters={filters}
            onFiltersChange={setFilters}
            branches={mockBranches}
          />

          {/* Locker Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLockers.map((locker) => (
              <LockerCard
                key={locker.id}
                locker={locker}
                onAssign={handleAssignLocker}
                onRelease={handleReleaseLocker}
                onEdit={handleEditLocker}
                onDelete={handleDeleteLocker}
              />
            ))}
          </div>

          {filteredLockers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No lockers found</h3>
                <p className="text-muted-foreground mb-4">
                  No lockers match your current filters.
                </p>
                <Button variant="outline" onClick={() => setFilters({})}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Assignments</CardTitle>
              <CardDescription>
                Current locker assignments across all branches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLockerAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        <span className="font-medium">{assignment.lockerNumber}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Assigned to {assignment.memberName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Since {new Date(assignment.assignedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${assignment.monthlyFee}/month</p>
                      <Button variant="outline" size="sm">
                        Release
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Utilization by Branch</CardTitle>
              </CardHeader>
              <CardContent>
                {mockBranches.map((branch) => {
                  const branchLockers = lockers.filter(l => l.branchId === branch.id);
                  const occupiedCount = branchLockers.filter(l => l.status === 'occupied').length;
                  const utilization = branchLockers.length > 0 ? (occupiedCount / branchLockers.length) * 100 : 0;
                  
                  return (
                    <div key={branch.id} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium">{branch.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {occupiedCount}/{branchLockers.length}
                        </span>
                        <div className="w-16 text-xs text-right">
                          {utilization.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Required</CardTitle>
              </CardHeader>
              <CardContent>
                {lockers.filter(l => l.status === 'maintenance').length === 0 ? (
                  <p className="text-sm text-muted-foreground">No lockers require maintenance</p>
                ) : (
                  <div className="space-y-2">
                    {lockers
                      .filter(l => l.status === 'maintenance')
                      .map((locker) => (
                        <div key={locker.id} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm">{locker.number}</span>
                          <span className="text-xs text-muted-foreground">
                            {locker.notes}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Locker Form */}
      <LockerForm
        open={showLockerForm}
        onOpenChange={(open) => {
          setShowLockerForm(open);
          if (!open) setSelectedLocker(undefined);
        }}
        locker={selectedLocker}
        onSubmit={selectedLocker ? handleUpdateLocker : handleAddLocker}
        branches={mockBranches}
      />

      {/* Assign Locker Drawer */}
      <AssignLockerDrawer
        open={showAssignDrawer}
        onOpenChange={setShowAssignDrawer}
        memberId={selectedMember.id}
        memberName={selectedMember.name}
        branchId={selectedLocker?.branchId}
        onAssign={handleAssignComplete}
      />
    </div>
  );
}