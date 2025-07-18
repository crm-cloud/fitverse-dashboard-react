
import { MapPin, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useBranches } from '@/hooks/useBranches';

export const BranchSelector = () => {
  const { branches, selectedBranch, setSelectedBranch } = useBranches();

  const handleBranchChange = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    setSelectedBranch(branch || null);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'maintenance': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Select value={selectedBranch?.id || ''} onValueChange={handleBranchChange}>
      <SelectTrigger className="w-64 bg-sidebar-accent border-sidebar-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sidebar-accent-foreground" />
          <SelectValue placeholder="Select branch" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {branches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="font-medium">{branch.name}</p>
                <p className="text-xs text-muted-foreground">
                  {branch.address.city}, {branch.address.state}
                </p>
              </div>
              <Badge variant={getStatusVariant(branch.status)} className="ml-2">
                {branch.status}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
