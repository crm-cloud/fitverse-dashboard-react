import { Badge } from '@/components/ui/badge';
import { LockerStatus } from '@/types/locker';

interface LockerStatusBadgeProps {
  status: LockerStatus;
}

export function LockerStatusBadge({ status }: LockerStatusBadgeProps) {
  const getStatusConfig = (status: LockerStatus) => {
    switch (status) {
      case 'available':
        return { variant: 'default' as const, label: 'Available' };
      case 'occupied':
        return { variant: 'destructive' as const, label: 'Occupied' };
      case 'maintenance':
        return { variant: 'secondary' as const, label: 'Maintenance' };
      case 'reserved':
        return { variant: 'outline' as const, label: 'Reserved' };
      default:
        return { variant: 'default' as const, label: 'Unknown' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}