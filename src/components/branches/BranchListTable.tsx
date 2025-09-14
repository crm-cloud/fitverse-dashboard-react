import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Search, 
  Edit, 
  Settings,
  Users,
  MapPin,
  Phone
} from 'lucide-react';

export function BranchListTable() {
  const { authState } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['admin-branches-table', authState.user?.gym_id],
    queryFn: async () => {
      if (!authState.user?.gym_id) return [];
      
      const { data, error } = await supabase
        .from('branches')
        .select(`
          *,
          profiles!branches_manager_id_fkey(full_name, email)
        `)
        .eq('gym_id', authState.user.gym_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!authState.user?.gym_id,
  });

  const filteredBranches = branches.filter(branch => {
    const searchLower = searchTerm.toLowerCase();
    const name = branch.name?.toLowerCase() || '';
    const address = branch.address as any;
    const city = address?.city?.toLowerCase() || '';
    const state = address?.state?.toLowerCase() || '';
    
    return name.includes(searchLower) || 
           city.includes(searchLower) || 
           state.includes(searchLower);
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Branch Name</TableHead>
              <TableHead className="font-semibold">Code</TableHead>
              <TableHead className="font-semibold">Address</TableHead>
              <TableHead className="font-semibold">Members</TableHead>
              <TableHead className="font-semibold">Capacity</TableHead>
              <TableHead className="font-semibold">Manager</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBranches.map((branch, index) => {
              const address = branch.address as any;
              const contact = branch.contact as any;
              
              return (
                <motion.tr
                  key={branch.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {branch.name}
                      </div>
                      {contact?.phone && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {branch.name?.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 4) || 'N/A'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {address?.street ? `${address.street}` : 'Address not set'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {address?.city && address?.state ? `${address.city}, ${address.state} ${address.zipCode || ''}` : 'Location not complete'}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-secondary" />
                      <span className="font-medium">{branch.current_members || 0}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="secondary">
                      {branch.capacity || 'Not set'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      {branch.profiles && Array.isArray(branch.profiles) && branch.profiles.length > 0 ? (
                        <div>
                          <div className="font-medium text-sm">
                            {branch.profiles[0].full_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {branch.profiles[0].email}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Not assigned
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Branch
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Assign Manager
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredBranches.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center py-12"
        >
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Branches Found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first branch to get started'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}