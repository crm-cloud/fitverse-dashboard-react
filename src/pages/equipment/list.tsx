
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dumbbell, 
  Search, 
  Filter, 
  Plus, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  category: string;
  status: 'operational' | 'maintenance' | 'out-of-service';
  lastMaintenance: string;
  nextMaintenance: string;
  serialNumber: string;
  location: string;
  purchaseDate: string;
  warranty: string;
}

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Treadmill Pro X1',
    category: 'Cardio',
    status: 'operational',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-04-15',
    serialNumber: 'TM-2024-001',
    location: 'Cardio Section A',
    purchaseDate: '2023-08-15',
    warranty: '2025-08-15'
  },
  {
    id: '2',
    name: 'Olympic Barbell Set',
    category: 'Strength',
    status: 'operational',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-07-10',
    serialNumber: 'BB-2024-005',
    location: 'Free Weights Area',
    purchaseDate: '2023-06-20',
    warranty: '2028-06-20'
  },
  {
    id: '3',
    name: 'Cable Machine Deluxe',
    category: 'Strength',
    status: 'maintenance',
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-02-01',
    serialNumber: 'CM-2024-003',
    location: 'Strength Training Zone',
    purchaseDate: '2023-09-10',
    warranty: '2026-09-10'
  },
  {
    id: '4',
    name: 'Rowing Machine Elite',
    category: 'Cardio',
    status: 'out-of-service',
    lastMaintenance: '2024-01-05',
    nextMaintenance: 'TBD',
    serialNumber: 'RM-2024-007',
    location: 'Cardio Section B',
    purchaseDate: '2023-11-30',
    warranty: '2026-11-30'
  }
];

const statusConfig = {
  operational: { 
    label: 'Operational', 
    variant: 'default' as const, 
    icon: CheckCircle,
    color: 'text-green-600'
  },
  maintenance: { 
    label: 'Maintenance', 
    variant: 'secondary' as const, 
    icon: Clock,
    color: 'text-yellow-600'
  },
  'out-of-service': { 
    label: 'Out of Service', 
    variant: 'destructive' as const, 
    icon: AlertTriangle,
    color: 'text-red-600'
  }
};

export default function EquipmentListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredEquipment = mockEquipment.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || equipment.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || equipment.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusStats = () => {
    const operational = mockEquipment.filter(e => e.status === 'operational').length;
    const maintenance = mockEquipment.filter(e => e.status === 'maintenance').length;
    const outOfService = mockEquipment.filter(e => e.status === 'out-of-service').length;
    
    return { operational, maintenance, outOfService, total: mockEquipment.length };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment Management</h1>
          <p className="text-muted-foreground">Monitor and maintain gym equipment</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Dumbbell className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operational</p>
                <p className="text-2xl font-bold text-green-600">{stats.operational}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Service</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfService}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Cardio">Cardio</SelectItem>
                <SelectItem value="Strength">Strength</SelectItem>
                <SelectItem value="Functional">Functional</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out-of-service">Out of Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEquipment.map((equipment) => {
          const statusInfo = statusConfig[equipment.status];
          const StatusIcon = statusInfo.icon;
          
          return (
            <Card key={equipment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{equipment.name}</CardTitle>
                  <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {equipment.category} • {equipment.location}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium">Serial Number</p>
                    <p className="text-muted-foreground">{equipment.serialNumber}</p>
                  </div>
                  <div>
                    <p className="font-medium">Purchase Date</p>
                    <p className="text-muted-foreground">{equipment.purchaseDate}</p>
                  </div>
                  <div>
                    <p className="font-medium">Last Maintenance</p>
                    <p className="text-muted-foreground">{equipment.lastMaintenance}</p>
                  </div>
                  <div>
                    <p className="font-medium">Next Maintenance</p>
                    <p className="text-muted-foreground">{equipment.nextMaintenance}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-1" />
                    Maintain
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEquipment.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No equipment found</h3>
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Start by adding your first piece of equipment.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
