
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { TrainerSpecialty } from '@/types/trainer';
import { useTrainerAutoAssignment } from '@/hooks/useTrainerAutoAssignment';
import { TrainerCard } from './TrainerCard';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TrainerAutoAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  branchId: string;
  onAssignmentComplete?: (assignmentId: string) => void;
}

const specialtyOptions: { value: TrainerSpecialty; label: string }[] = [
  { value: 'strength_training', label: 'Strength Training' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'crossfit', label: 'CrossFit' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'bodybuilding', label: 'Bodybuilding' },
  { value: 'sports_performance', label: 'Sports Performance' }
];

export const TrainerAutoAssignDialog = ({
  open,
  onOpenChange,
  memberId,
  branchId,
  onAssignmentComplete
}: TrainerAutoAssignDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<TrainerSpecialty>('strength_training');
  const [duration, setDuration] = useState<number>(60);
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [assignmentResult, setAssignmentResult] = useState<any>(null);
  const [step, setStep] = useState<'form' | 'result'>('form');

  const { autoAssignTrainer, isAssigning } = useTrainerAutoAssignment(branchId);

  const handleAssign = async () => {
    if (!selectedDate || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(hours, minutes, 0, 0);

    const result = await autoAssignTrainer({
      memberId,
      preferredSpecialty: selectedSpecialty,
      scheduledDate,
      duration,
      maxBudget: maxBudget ? parseFloat(maxBudget) : undefined
    });

    setAssignmentResult(result);
    setStep('result');

    if (result.success && result.assignment) {
      onAssignmentComplete?.(result.assignment.id);
    }
  };

  const handleReset = () => {
    setStep('form');
    setAssignmentResult(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setMaxBudget('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      handleReset();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' ? 'Auto-Assign Trainer' : 'Assignment Result'}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' 
              ? 'Provide your preferences and we\'ll find the best trainer for you'
              : 'Here are the results of your trainer assignment'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-6">
            {/* Specialty Selection */}
            <div className="space-y-2">
              <Label htmlFor="specialty">Training Specialty</Label>
              <Select value={selectedSpecialty} onValueChange={(value: TrainerSpecialty) => setSelectedSpecialty(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialtyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Preferred Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="time">Preferred Time</Label>
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Session Duration (minutes)</Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Maximum Budget (optional)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Enter max hourly rate"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAssign}
                disabled={!selectedDate || !selectedTime || isAssigning}
                className="flex-1"
              >
                {isAssigning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Find Best Trainer
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === 'result' && assignmentResult && (
          <div className="space-y-6">
            {/* Result Status */}
            <div className={cn(
              "flex items-center gap-3 p-4 rounded-lg",
              assignmentResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            )}>
              {assignmentResult.success ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
              <div>
                <h3 className="font-medium">
                  {assignmentResult.success ? 'Trainer Assigned!' : 'Assignment Failed'}
                </h3>
                <p className="text-sm">
                  {assignmentResult.reason || assignmentResult.error}
                </p>
              </div>
            </div>

            {/* Assigned Trainer */}
            {assignmentResult.success && assignmentResult.trainer && (
              <div>
                <h4 className="font-medium mb-3">Your Assigned Trainer</h4>
                <TrainerCard
                  trainer={assignmentResult.trainer}
                  showBookButton={false}
                  showDetails={true}
                />
              </div>
            )}

            {/* Alternative Trainers */}
            {assignmentResult.alternatives && assignmentResult.alternatives.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">
                  {assignmentResult.success ? 'Alternative Options' : 'Available Trainers'}
                </h4>
                <div className="grid gap-4">
                  {assignmentResult.alternatives.slice(0, 2).map((trainer: any) => (
                    <TrainerCard
                      key={trainer.id}
                      trainer={trainer}
                      showBookButton={!assignmentResult.success}
                      showDetails={false}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {assignmentResult.success ? (
                <>
                  <Button onClick={handleClose} className="flex-1">
                    Done
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    Assign Another
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleReset} className="flex-1">
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
