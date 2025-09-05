import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, UserCheck, UserX, Shield } from 'lucide-react';
import { TeamMemberForm } from '@/components/team/TeamMemberForm';
import { TeamMemberTable } from '@/components/team/TeamMemberTable';
import { TeamFiltersComponent, TeamFilters } from '@/components/team/TeamFilters';
import { PermissionGate } from '@/components/PermissionGate';
import { mockTeamMembers, TeamMember } from '@/utils/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useBranches } from '@/hooks/useBranches';
import { useRBAC } from '@/hooks/useRBAC';
import { useToast } from '@/hooks/use-toast';

export default function TeamManagement() {
  const { authState } = useAuth();
  const { branches, selectedBranch } = useBranches();
  const { hasPermission } = useRBAC();
  const { toast } = useToast();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>();
  const [filters, setFilters] = useState<TeamFilters>({
    search: '',
    role: 'all',
    branch: 'all',
    status: 'all',
  });

  const isAdmin = authState.user?.role === 'admin';
  const isManager = authState.user?.role === 'team' && authState.user?.teamRole === 'manager';

  // Apply branch-based filtering
  const visibleMembers = useMemo(() => {
    let filtered = teamMembers;

    // Branch scope enforcement
    if (!isAdmin && selectedBranch) {
      filtered = filtered.filter(member => member.branchId === selectedBranch.id);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.phone.includes(filters.search)
      );
    }

    // Apply role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(member => member.role === filters.role);
    }

    // Apply branch filter (only for admin)
    if (filters.branch !== 'all' && isAdmin) {
      filtered = filtered.filter(member => member.branchId === filters.branch);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(member => member.status === filters.status);
    }

    return filtered;
  }, [teamMembers, filters, isAdmin, selectedBranch]);

  // Calculate stats
  const stats = useMemo(() => {
    const relevant = isAdmin ? teamMembers : teamMembers.filter(m => m.branchId === selectedBranch?.id);
    return {
      total: relevant.length,
      active: relevant.filter(m => m.status === 'active').length,
      managers: relevant.filter(m => m.role === 'manager').length,
      inactive: relevant.filter(m => m.status === 'inactive').length,
    };
  }, [teamMembers, isAdmin, selectedBranch]);

  const handleCreateMember = (data: any) => {
    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      branchId: data.branchId,
      branchName: branches.find(b => b.id === data.branchId)?.name || '',
      status: data.status,
      avatar: data.avatar,
      createdAt: new Date(),
    };

    setTeamMembers(prev => [...prev, newMember]);
    toast({
      title: 'Success',
      description: 'Team member created successfully',
    });
  };

  const handleEditMember = (data: any) => {
    if (!editingMember) return;

    const updatedMember: TeamMember = {
      ...editingMember,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      branchId: data.branchId,
      branchName: branches.find(b => b.id === data.branchId)?.name || '',
      status: data.status,
      avatar: data.avatar,
    };

    setTeamMembers(prev => prev.map(m => m.id === editingMember.id ? updatedMember : m));
    setEditingMember(undefined);
    toast({
      title: 'Success',
      description: 'Team member updated successfully',
    });
  };

  const handleViewMember = (member: TeamMember) => {
    toast({
      title: 'Member Details',
      description: `Viewing details for ${member.name}`,
    });
  };

  const handleDisableMember = (member: TeamMember) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    setTeamMembers(prev => 
      prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m)
    );
    toast({
      title: 'Success',
      description: `Member ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`,
    });
  };

  const handleResetPassword = (member: TeamMember) => {
    toast({
      title: 'Password Reset',
      description: `Password reset email sent to ${member.email}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage staff, trainers, and managers across your organization
          </p>
        </div>
        <PermissionGate permission="staff.create">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </PermissionGate>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'All branches' : 'Current branch'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.managers}</div>
            <p className="text-xs text-muted-foreground">
              Management staff
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Disabled accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <TeamFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={visibleMembers.length}
      />

      {/* Team Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamMemberTable
            members={visibleMembers}
            onView={handleViewMember}
            onEdit={setEditingMember}
            onDisable={handleDisableMember}
            onResetPassword={handleResetPassword}
          />
        </CardContent>
      </Card>

      {/* Create Form */}
      <TeamMemberForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateMember}
      />

      {/* Edit Form */}
      <TeamMemberForm
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(undefined)}
        member={editingMember}
        onSubmit={handleEditMember}
      />
    </div>
  );
}