import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TrainerProfile, TrainerSpecialty } from '@/types/trainer';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  Star, 
  CheckCircle2,
  CreditCard
} from 'lucide-react';

interface PackageSelectorProps {
  trainer: TrainerProfile;
  onBack?: () => void;
}

interface BookingData {
  packageIndex: number | null;
  selectedDate: Date | null;
  selectedTime: string;
  specialty: TrainerSpecialty | null;
  duration: number;
  notes: string;
}

export const PackageSelector = ({ trainer, onBack }: PackageSelectorProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'package' | 'schedule' | 'payment' | 'confirmation'>('package');
  const [bookingData, setBookingData] = useState<BookingData>({
    packageIndex: null,
    selectedDate: null,
    selectedTime: '',
    specialty: null,
    duration: 60,
    notes: ''
  });

  const formatSpecialty = (specialty: string) => {
    return specialty.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAvailableTimeSlots = (dayOfWeek: number) => {
    const availability = trainer.availability.find(a => a.dayOfWeek === dayOfWeek);
    if (!availability?.isAvailable) return [];

    const slots = [];
    const [startHour, startMin] = availability.startTime.split(':').map(Number);
    const [endHour, endMin] = availability.endTime.split(':').map(Number);
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour + 1 <= endHour || (hour + 1 === endHour && endMin >= 30)) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    
    return slots;
  };

  const selectedPackage = bookingData.packageIndex !== null ? trainer.packageRates[bookingData.packageIndex] : null;
  const isBookingValid = selectedPackage && bookingData.selectedDate && bookingData.selectedTime && bookingData.specialty;

  const handlePackageSelect = (packageIndex: number) => {
    setBookingData({ ...bookingData, packageIndex });
    setStep('schedule');
  };

  const handleScheduleNext = () => {
    if (!isBookingValid) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    setStep('payment');
  };

  const handlePayment = async () => {
    // Mock payment processing
    setStep('confirmation');
    toast({
      title: "Payment Successful!",
      description: "Your training session has been booked successfully.",
    });
  };

  const renderPackageStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Training Package</h2>
        <p className="text-muted-foreground">Select the package that best fits your fitness goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Single Session */}
        <Card className="relative cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
          <CardHeader className="text-center">
            <CardTitle>Single Session</CardTitle>
            <div className="text-3xl font-bold">${trainer.hourlyRate}</div>
            <p className="text-muted-foreground">Pay per session</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm">60-minute session</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm">Flexible scheduling</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm">No commitment</span>
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={() => handlePackageSelect(-1)}
            >
              Select Single Session
            </Button>
          </CardContent>
        </Card>

        {/* Package Options */}
        {trainer.packageRates.map((pkg, index) => {
          const savings = (trainer.hourlyRate * pkg.sessions) - pkg.price;
          const savingsPercent = Math.round((savings / (trainer.hourlyRate * pkg.sessions)) * 100);
          
          return (
            <Card 
              key={index} 
              className={`relative cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50 ${
                pkg.sessions === 10 ? 'ring-2 ring-primary' : ''
              }`}
            >
              {pkg.sessions === 10 && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle>{pkg.sessions} Sessions</CardTitle>
                <div className="text-3xl font-bold">${pkg.price}</div>
                <p className="text-muted-foreground">
                  ${(pkg.price / pkg.sessions).toFixed(2)} per session
                </p>
                {savings > 0 && (
                  <Badge variant="secondary" className="mx-auto">
                    Save {savingsPercent}% (${savings})
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm">{pkg.sessions} × 60-minute sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm">Valid for {pkg.validityDays} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm">Flexible scheduling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm">Progress tracking</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  variant={pkg.sessions === 10 ? "default" : "outline"}
                  onClick={() => handlePackageSelect(index)}
                >
                  Select Package
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderScheduleStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Schedule Your Session</h2>
        <p className="text-muted-foreground">Choose your preferred date, time, and training focus</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={bookingData.selectedDate || undefined}
              onSelect={(date) => setBookingData({ ...bookingData, selectedDate: date || null })}
              disabled={(date) => {
                const dayOfWeek = date.getDay();
                const availability = trainer.availability.find(a => a.dayOfWeek === dayOfWeek);
                return !availability?.isAvailable || date < new Date();
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Time and Details */}
        <div className="space-y-6">
          {/* Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Select Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={bookingData.selectedTime} 
                onValueChange={(time) => setBookingData({ ...bookingData, selectedTime: time })}
                disabled={!bookingData.selectedDate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose time slot" />
                </SelectTrigger>
                <SelectContent>
                  {bookingData.selectedDate && getAvailableTimeSlots(bookingData.selectedDate.getDay()).map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Training Focus */}
          <Card>
            <CardHeader>
              <CardTitle>Training Focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="specialty">Specialty Focus</Label>
                <Select 
                  value={bookingData.specialty || ''} 
                  onValueChange={(specialty) => setBookingData({ ...bookingData, specialty: specialty as TrainerSpecialty })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose training focus" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainer.specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {formatSpecialty(specialty)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Session Duration</Label>
                <Select 
                  value={bookingData.duration.toString()} 
                  onValueChange={(duration) => setBookingData({ ...bookingData, duration: parseInt(duration) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific goals, injuries, or preferences..."
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('package')} className="flex-1">
              Back
            </Button>
            <Button onClick={handleScheduleNext} className="flex-1">
              Continue to Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Payment Details</h2>
        <p className="text-muted-foreground">Review your booking and complete payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{trainer.fullName}</h4>
                <p className="text-sm text-muted-foreground">{trainer.branchName}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm">Package:</span>
                <span className="text-sm font-medium">
                  {selectedPackage ? `${selectedPackage.sessions} Sessions` : 'Single Session'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Date:</span>
                <span className="text-sm font-medium">
                  {bookingData.selectedDate?.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Time:</span>
                <span className="text-sm font-medium">{bookingData.selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Focus:</span>
                <span className="text-sm font-medium">
                  {bookingData.specialty && formatSpecialty(bookingData.specialty)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Duration:</span>
                <span className="text-sm font-medium">{bookingData.duration} minutes</span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t text-lg font-semibold">
              <span>Total:</span>
              <span>${selectedPackage ? selectedPackage.price : trainer.hourlyRate}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 border rounded-lg bg-muted/30 text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Secure payment processing will be integrated here
              </p>
              <Badge variant="secondary">Mock Payment Interface</Badge>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('schedule')} className="flex-1">
                Back
              </Button>
              <Button onClick={handlePayment} className="flex-1">
                Complete Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          Your training session with {trainer.fullName} has been successfully booked.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">Trainer:</span>
            <span className="text-sm font-medium">{trainer.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Date:</span>
            <span className="text-sm font-medium">
              {bookingData.selectedDate?.toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Time:</span>
            <span className="text-sm font-medium">{bookingData.selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Focus:</span>
            <span className="text-sm font-medium">
              {bookingData.specialty && formatSpecialty(bookingData.specialty)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onBack}>
          Browse More Trainers
        </Button>
        <Button>
          View My Bookings
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {['package', 'schedule', 'payment', 'confirmation'].map((stepName, index) => (
            <div key={stepName} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepName ? 'bg-primary text-primary-foreground' :
                ['package', 'schedule', 'payment', 'confirmation'].indexOf(step) > index ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              {index < 3 && <div className="w-8 h-0.5 bg-muted" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 'package' && renderPackageStep()}
      {step === 'schedule' && renderScheduleStep()}
      {step === 'payment' && renderPaymentStep()}
      {step === 'confirmation' && renderConfirmationStep()}
    </div>
  );
};