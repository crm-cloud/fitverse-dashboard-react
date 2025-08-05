import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, User, Settings, Key } from 'lucide-react';
import { Locker } from '@/types/locker';
import { LockerStatusBadge } from './LockerStatusBadge';

interface LockerCardProps {
  locker: Locker;
  onAssign?: (locker: Locker) => void;
  onRelease?: (locker: Locker) => void;
  onEdit?: (locker: Locker) => void;
  onDelete?: (lockerId: string) => void;
}

export function LockerCard({ 
  locker, 
  onAssign, 
  onRelease, 
  onEdit, 
  onDelete 
}: LockerCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <h3 className="font-semibold">{locker.number}</h3>
          </div>
          <div className="flex items-center gap-2">
            <LockerStatusBadge status={locker.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {locker.status === 'available' && onAssign && (
                  <DropdownMenuItem onClick={() => onAssign(locker)}>
                    <User className="w-4 h-4 mr-2" />
                    Assign
                  </DropdownMenuItem>
                )}
                {locker.status === 'occupied' && onRelease && (
                  <DropdownMenuItem onClick={() => onRelease(locker)}>
                    <Key className="w-4 h-4 mr-2" />
                    Release
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(locker)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(locker.id)}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">{locker.name}</p>
          <p className="text-xs text-muted-foreground">{locker.branchName}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Size:</span>
            <Badge variant="outline">{locker.size.name}</Badge>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Fee:</span>
            <span className="font-medium">${locker.monthlyFee}</span>
          </div>

          {locker.assignedMemberName && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Assigned to:</span>
                <span className="font-medium">{locker.assignedMemberName}</span>
              </div>
              {locker.assignedDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Since:</span>
                  <span>{new Date(locker.assignedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {locker.notes && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">{locker.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}