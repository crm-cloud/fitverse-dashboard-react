import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { TrainerProfile, TrainerChangeRequest as ChangeRequestType } from '@/types/trainer';
import { mockTrainers } from '@/mock/trainers';
import { useBranchContext } from '@/hooks/useBranchContext';
import { UserX, ArrowRight, AlertCircle, Send } from 'lucide-react';

interface TrainerChangeRequestProps {
  currentTrainerId?: string;
  onRequestSubmitted?: (request: ChangeRequestType) => void;
  className?: string;
}

export const TrainerChangeRequest = ({ 
  currentTrainerId, 
  onRequestSubmitted,
  className = ""
}: TrainerChangeRequestProps) => {
  const { toast } = useToast();
  const { currentBranchId } = useBranchContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [requestData, setRequestData] = useState({
    reason: '' as ChangeRequestType['reason'] | '',
    description: '',
    urgency: 'medium' as ChangeRequestType['urgency'],
    requestedTrainerId: ''
  });

  const currentTrainer = currentTrainerId ? 
    mockTrainers.find(t => t.id === currentTrainerId) : null;

  const availableTrainers = mockTrainers.filter(trainer => 
    trainer.branchId === currentBranchId &&
    trainer.id !== currentTrainerId &&
    trainer.isActive &&
    trainer.status === 'active'
  );

  const requestedTrainer = requestData.requestedTrainerId ? 
    mockTrainers.find(t => t.id === requestData.requestedTrainerId) : null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const reasonOptions = [
    { value: 'scheduling_conflict', label: 'Scheduling Conflict', description: 'Current trainer\'s schedule doesn\'t match my availability' },
    { value: 'personality_mismatch', label: 'Personality Mismatch', description: 'Looking for better trainer-client compatibility' },
    { value: 'specialty_change', label: 'Specialty Change', description: 'Need a trainer with different specialization' },
    { value: 'performance_issue', label: 'Performance Issue', description: 'Concerns about training quality or effectiveness' },
    { value: 'other', label: 'Other', description: 'Other reasons not listed above' }
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low', description: 'Can wait for regular processing', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', description: 'Would like resolution within a week', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', description: 'Need urgent resolution due to important reasons', color: 'bg-red-500' }
  ];

  const canSubmit = requestData.reason && requestData.description.trim().length > 10;

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields with adequate detail.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const changeRequest: ChangeRequestType = {
        id: `change_req_${Date.now()}`,
        memberId: 'current_member_id', // In real app, get from auth context
        currentTrainerId: currentTrainerId!,
        requestedTrainerId: requestData.requestedTrainerId || undefined,
        reason: requestData.reason as ChangeRequestType['reason'],
        description: requestData.description,
        urgency: requestData.urgency,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      onRequestSubmitted?.(changeRequest);

      toast({
        title: "Request Submitted Successfully",
        description: "Your trainer change request has been submitted and is under review.",
      });

      // Reset form
      setRequestData({
        reason: '',
        description: '',
        urgency: 'medium',
        requestedTrainerId: ''
      });

    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Request Trainer Change
          </CardTitle>
          <p className="text-muted-foreground">
            Submit a request to change your current trainer assignment
          </p>
        </CardHeader>
      </Card>

      {/* Current Trainer Info */}
      {currentTrainer && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Trainer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentTrainer.avatar} alt={currentTrainer.fullName} />
                <AvatarFallback>{getInitials(currentTrainer.fullName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold">{currentTrainer.fullName}</h4>
                <p className="text-sm text-muted-foreground">
                  {currentTrainer.specialties.slice(0, 2).map(s => 
                    s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                  ).join(', ')}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">⭐ {currentTrainer.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ${currentTrainer.hourlyRate}/hour
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Change Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reason Selection */}
          <div className="space-y-3">
            <Label htmlFor="reason">Reason for Change *</Label>
            <Select 
              value={requestData.reason} 
              onValueChange={(value) => setRequestData({ ...requestData, reason: value as ChangeRequestType['reason'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a reason for changing trainers" />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description">
              Detailed Description *
              <span className="text-muted-foreground text-sm font-normal ml-2">
                (Minimum 10 characters)
              </span>
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide detailed information about why you want to change trainers. This helps us understand your needs and find the best alternative."
              value={requestData.description}
              onChange={(e) => setRequestData({ ...requestData, description: e.target.value })}
              rows={4}
            />
            <div className="text-xs text-muted-foreground">
              {requestData.description.length}/500 characters
            </div>
          </div>

          {/* Urgency Level */}
          <div className="space-y-3">
            <Label>Request Urgency</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {urgencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRequestData({ ...requestData, urgency: option.value as ChangeRequestType['urgency'] })}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    requestData.urgency === option.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${option.color}`} />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Trainer (Optional) */}
          <div className="space-y-3">
            <Label htmlFor="preferred-trainer">
              Preferred New Trainer (Optional)
            </Label>
            <Select 
              value={requestData.requestedTrainerId} 
              onValueChange={(value) => setRequestData({ ...requestData, requestedTrainerId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Leave blank for automatic assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No preference - Let admin choose</SelectItem>
                {availableTrainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    <div className="flex items-center gap-2">
                      <span>{trainer.fullName}</span>
                      <Badge variant="secondary" className="text-xs">
                        ⭐ {trainer.rating}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        ${trainer.hourlyRate}/hr
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Trainer Preview */}
          {requestedTrainer && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Requested Trainer:</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={requestedTrainer.avatar} alt={requestedTrainer.fullName} />
                  <AvatarFallback>{getInitials(requestedTrainer.fullName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{requestedTrainer.fullName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {requestedTrainer.specialties.slice(0, 2).map(s => 
                      s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                    ).join(', ')}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm">⭐ {requestedTrainer.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ${requestedTrainer.hourlyRate}/hour
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {requestedTrainer.experience} years exp.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Notice */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 mb-1">Important Notice</p>
              <p className="text-yellow-700">
                Change requests are reviewed by our team and may take 1-3 business days to process. 
                Your current training schedule will remain active until the change is approved and processed.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Submit Change Request
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};