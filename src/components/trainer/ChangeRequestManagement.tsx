import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TrainerChangeRequest, TrainerProfile } from '@/types/trainer';
import { mockTrainers } from '@/mock/trainers';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Users, 
  AlertTriangle,
  MessageSquare,
  Calendar,
  Filter
} from 'lucide-react';

// Mock change requests data
const mockChangeRequests: TrainerChangeRequest[] = [
  {
    id: 'req_001',
    memberId: 'member_001',
    currentTrainerId: 'trainer_001',
    requestedTrainerId: 'trainer_003',
    reason: 'scheduling_conflict',
    description: 'My current trainer\'s availability doesn\'t match my work schedule. I need someone who can train me in the evenings.',
    urgency: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'req_002',
    memberId: 'member_002',
    currentTrainerId: 'trainer_002',
    reason: 'specialty_change',
    description: 'I want to focus more on powerlifting and need a trainer with specific experience in that area.',
    urgency: 'low',
    status: 'approved',
    newTrainerId: 'trainer_004',
    reassignmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    reviewedBy: 'admin_001',
    reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    reviewNotes: 'Approved. Member\'s goals align well with the new trainer\'s expertise.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'req_003',
    memberId: 'member_003',
    currentTrainerId: 'trainer_001',
    reason: 'performance_issue',
    description: 'I haven\'t seen the results I expected and feel like my training sessions lack structure.',
    urgency: 'high',
    status: 'rejected',
    reviewedBy: 'admin_001',
    reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    reviewNotes: 'After investigation, we believe the issue can be resolved with better communication. Scheduling a meeting with current trainer.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  }
];

interface ChangeRequestManagementProps {
  onRequestProcessed?: (request: TrainerChangeRequest) => void;
}

export const ChangeRequestManagement = ({ onRequestProcessed }: ChangeRequestManagementProps) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<TrainerChangeRequest[]>(mockChangeRequests);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<TrainerChangeRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newTrainerId, setNewTrainerId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      if (filterStatus !== 'all' && request.status !== filterStatus) return false;
      if (filterUrgency !== 'all' && request.urgency !== filterUrgency) return false;
      return true;
    });
  }, [requests, filterStatus, filterUrgency]);

  const getStatusColor = (status: TrainerChangeRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyColor = (urgency: TrainerChangeRequest['urgency']) => {
    switch (urgency) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTrainerById = (id: string) => {
    return mockTrainers.find(t => t.id === id);
  };

  const getMemberName = (memberId: string) => {
    // In real app, this would fetch from members data
    const memberNames: Record<string, string> = {
      'member_001': 'John Smith',
      'member_002': 'Sarah Johnson',
      'member_003': 'Mike Wilson'
    };
    return memberNames[memberId] || 'Unknown Member';
  };

  const formatReason = (reason: TrainerChangeRequest['reason']) => {
    return reason.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleProcessRequest = async (
    request: TrainerChangeRequest, 
    action: 'approve' | 'reject'
  ) => {
    if (!reviewNotes.trim()) {
      toast({
        title: "Review Notes Required",
        description: "Please provide review notes explaining your decision.",
        variant: "destructive"
      });
      return;
    }

    if (action === 'approve' && !newTrainerId) {
      toast({
        title: "Trainer Selection Required",
        description: "Please select a new trainer for the member.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedRequest: TrainerChangeRequest = {
        ...request,
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy: 'current_admin', // In real app, get from auth context
        reviewedAt: new Date(),
        reviewNotes,
        newTrainerId: action === 'approve' ? newTrainerId : undefined,
        reassignmentDate: action === 'approve' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined,
        updatedAt: new Date()
      };

      setRequests(prev => prev.map(r => r.id === request.id ? updatedRequest : r));
      onRequestProcessed?.(updatedRequest);

      toast({
        title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The trainer change request has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });

      setSelectedRequest(null);
      setReviewNotes('');
      setNewTrainerId('');

    } catch (error) {
      toast({
        title: "Error Processing Request",
        description: "There was an error processing the request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const RequestDetailsDialog = ({ request }: { request: TrainerChangeRequest }) => {
    const currentTrainer = getTrainerById(request.currentTrainerId);
    const requestedTrainer = request.requestedTrainerId ? getTrainerById(request.requestedTrainerId) : null;
    const newTrainer = request.newTrainerId ? getTrainerById(request.newTrainerId) : null;

    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change Request Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Request Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Member</Label>
              <p className="text-sm">{getMemberName(request.memberId)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Request Date</Label>
              <p className="text-sm">{request.createdAt.toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Reason</Label>
              <p className="text-sm">{formatReason(request.reason)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Urgency</Label>
              <p className={`text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                {request.urgency.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{request.description}</p>
          </div>

          {/* Current Trainer */}
          {currentTrainer && (
            <div>
              <Label className="text-sm font-medium">Current Trainer</Label>
              <div className="flex items-center gap-3 mt-2 p-3 border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentTrainer.avatar} alt={currentTrainer.fullName} />
                  <AvatarFallback>{getInitials(currentTrainer.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{currentTrainer.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentTrainer.specialties.slice(0, 2).join(', ')} • ⭐ {currentTrainer.rating}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Requested Trainer */}
          {requestedTrainer && (
            <div>
              <Label className="text-sm font-medium">Requested Trainer</Label>
              <div className="flex items-center gap-3 mt-2 p-3 border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={requestedTrainer.avatar} alt={requestedTrainer.fullName} />
                  <AvatarFallback>{getInitials(requestedTrainer.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{requestedTrainer.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {requestedTrainer.specialties.slice(0, 2).join(', ')} • ⭐ {requestedTrainer.rating}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* New Trainer (if approved) */}
          {newTrainer && (
            <div>
              <Label className="text-sm font-medium">Assigned New Trainer</Label>
              <div className="flex items-center gap-3 mt-2 p-3 border border-green-200 bg-green-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={newTrainer.avatar} alt={newTrainer.fullName} />
                  <AvatarFallback>{getInitials(newTrainer.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{newTrainer.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {newTrainer.specialties.slice(0, 2).join(', ')} • ⭐ {newTrainer.rating}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Review Information */}
          {request.reviewedAt && (
            <div>
              <Label className="text-sm font-medium">Review Information</Label>
              <div className="mt-2 p-3 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Reviewed by:</span>
                  <span className="font-medium">{request.reviewedBy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Review date:</span>
                  <span>{request.reviewedAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                    {request.status}
                  </Badge>
                </div>
                {request.reviewNotes && (
                  <div>
                    <span className="text-sm font-medium">Notes:</span>
                    <p className="text-sm mt-1">{request.reviewNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons for Pending Requests */}
          {request.status === 'pending' && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label htmlFor="trainer-select">Select New Trainer</Label>
                <Select value={newTrainerId} onValueChange={setNewTrainerId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a trainer for the member" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTrainers
                      .filter(t => t.id !== request.currentTrainerId && t.isActive)
                      .map(trainer => (
                        <SelectItem key={trainer.id} value={trainer.id}>
                          <div className="flex items-center gap-2">
                            <span>{trainer.fullName}</span>
                            <Badge variant="secondary">⭐ {trainer.rating}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="review-notes">Review Notes *</Label>
                <Textarea
                  id="review-notes"
                  placeholder="Provide detailed notes about your decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleProcessRequest(request, 'approve')}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Request
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleProcessRequest(request, 'reject')}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Trainer Change Request Management
          </CardTitle>
          <p className="text-muted-foreground">
            Review and process member requests for trainer changes
          </p>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', count: requests.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-yellow-600' },
          { label: 'Approved', count: requests.filter(r => r.status === 'approved').length, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length, icon: XCircle, color: 'text-red-600' },
          { label: 'High Priority', count: requests.filter(r => r.urgency === 'high' && r.status === 'pending').length, icon: AlertTriangle, color: 'text-orange-600' }
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="secondary">
              {filteredRequests.length} requests
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => {
          const currentTrainer = getTrainerById(request.currentTrainerId);
          const requestedTrainer = request.requestedTrainerId ? getTrainerById(request.requestedTrainerId) : null;
          
          return (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(request.status)}`} />
                      <h4 className="font-semibold">{getMemberName(request.memberId)}</h4>
                      <Badge variant="outline" className={getUrgencyColor(request.urgency)}>
                        {request.urgency} priority
                      </Badge>
                      <Badge variant="secondary">
                        {formatReason(request.reason)}
                      </Badge>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {request.description}
                    </p>

                    {/* Trainers */}
                    <div className="flex items-center gap-6 text-sm">
                      {currentTrainer && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">From:</span>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={currentTrainer.avatar} alt={currentTrainer.fullName} />
                            <AvatarFallback className="text-xs">{getInitials(currentTrainer.fullName)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{currentTrainer.fullName}</span>
                        </div>
                      )}
                      
                      {requestedTrainer && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">To:</span>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={requestedTrainer.avatar} alt={requestedTrainer.fullName} />
                            <AvatarFallback className="text-xs">{getInitials(requestedTrainer.fullName)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{requestedTrainer.fullName}</span>
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {request.createdAt.toLocaleDateString()}
                      </div>
                      {request.reviewedAt && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Reviewed {request.reviewedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      {selectedRequest && <RequestDetailsDialog request={selectedRequest} />}
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No requests found</h3>
              <p className="text-muted-foreground text-center">
                There are no trainer change requests matching your current filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};