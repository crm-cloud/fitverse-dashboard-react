import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MemberFiltersComponent } from '@/components/member/MemberFilters';
import { MemberTable } from '@/components/member/MemberTable';
import { MemberFilters } from '@/types/member';
import { mockMembers } from '@/utils/mockData';
import { useRBAC } from '@/hooks/useRBAC';

const ITEMS_PER_PAGE = 10;

export const MemberListPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useRBAC();
  const [filters, setFilters] = useState<MemberFilters>({});
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMembers = useMemo(() => {
    return mockMembers.filter(member => {
      const matchesSearch = !filters.searchQuery || 
        member.fullName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        member.phone.includes(filters.searchQuery) ||
        member.email.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesBranch = !filters.branchId || member.branchId === filters.branchId;
      const matchesStatus = !filters.membershipStatus || member.membershipStatus === filters.membershipStatus;
      
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [filters]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleFiltersChange = (newFilters: MemberFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage gym members and their information</p>
        </div>
        {hasPermission('members.create') && (
          <Button onClick={() => navigate('/members/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
        {hasPermission('members.create') && (
          <Button variant="outline" onClick={() => navigate('/membership/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add with Membership
          </Button>
        )}
      </div>

      <MemberFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} />

      <MemberTable
        members={paginatedMembers}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};