import { useState } from 'react';
import { format } from 'date-fns';
import { Phone, Mail, MapPin, Calendar, User, Activity, AlertTriangle, CreditCard, Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Member, MembershipStatus } from '@/types/member';
import { AssignMembershipDrawer } from '@/components/membership/AssignMembershipDrawer';
import { MemberBillingCard } from '@/components/membership/MemberBillingCard';
import { MembershipFormData } from '@/types/membership';
import { useToast } from '@/hooks/use-toast';
import { useRBAC } from '@/hooks/useRBAC';
import { MeasurementRecorderDrawer } from './MeasurementRecorderDrawer';
import { ProgressCharts } from './ProgressCharts';
import { MeasurementHistory } from '@/types/member-progress';
import { mockMeasurementHistory, mockAttendanceRecords, mockProgressSummary } from '@/utils/mockData';

interface MemberProfileCardProps {
  member: Member;
}

const getMembershipStatusBadge = (status: MembershipStatus) => {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    case 'expired':
      return <Badge variant="destructive">Expired</Badge>;
    case 'not-assigned':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Not Assigned</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

const getBMICategory = (bmi?: number) => {
  if (!bmi) return 'N/A';
  
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

const formatGovernmentId = (type: string, number: string) => {
  switch (type) {
    case 'aadhaar':
      return `Aadhaar: ${number}`;
    case 'pan':
      return `PAN: ${number}`;
    case 'passport':
      return `Passport: ${number}`;
    case 'voter-id':
      return `Voter ID: ${number}`;
    default:
      return `${type}: ${number}`;
  }
};

export const MemberProfileCard = ({ member }: MemberProfileCardProps) => {
  const [assignMembershipOpen, setAssignMembershipOpen] = useState(false);
  const [measurements, setMeasurements] = useState<MeasurementHistory[]>(
    mockMeasurementHistory.filter(m => m.memberId === member.id)
  );
  const { toast } = useToast();
  const { hasPermission } = useRBAC();

  const progressSummary = mockProgressSummary[member.id];
  const attendanceRecords = mockAttendanceRecords.filter(a => a.memberId === member.id);

  const handleAssignMembership = (data: MembershipFormData) => {
    console.log('Assigning membership:', { member: member.id, data });
    toast({
      title: 'Membership Assigned',
      description: `Membership has been successfully assigned to ${member.fullName}.`,
    });
    setAssignMembershipOpen(false);
  };

  const handleSaveMeasurement = (measurement: MeasurementHistory) => {
    setMeasurements(prev => [...prev, measurement]);
    console.log('Saving measurement:', measurement);
  };

  const latestMeasurement = measurements[measurements.length - 1];

  return (
    <div className="space-y-6">
      {/* Membership Warning */}
      {member.membershipStatus === 'not-assigned' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 flex justify-between items-center">
            <span>Membership not assigned. Please activate a membership to track this member's progress.</span>
            {hasPermission('members.edit') && (
              <Button 
                size="sm" 
                onClick={() => setAssignMembershipOpen(true)}
                className="ml-4"
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Assign Membership
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Member Information
            {hasPermission('members.edit') && (
              <MeasurementRecorderDrawer
                memberId={member.id}
                memberName={member.fullName}
                onSave={handleSaveMeasurement}
              >
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Measurements
                </Button>
              </MeasurementRecorderDrawer>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={member.profilePhoto} alt={member.fullName} />
              <AvatarFallback className="text-lg">{getInitials(member.fullName)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-semibold">{member.fullName}</h3>
                <p className="text-sm text-muted-foreground">Member ID: {member.id}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{member.phone}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{member.email}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    DOB: {format(member.dateOfBirth, 'MMM dd, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{member.gender}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact & Address */}
            <Card>
              <CardHeader>
                <CardTitle>Contact & Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Address
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{member.address.street}</p>
                    <p>{member.address.city}, {member.address.state} - {member.address.pincode}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Government ID</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatGovernmentId(member.governmentId.type, member.governmentId.number)}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Emergency Contact</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{member.emergencyContact.name} ({member.emergencyContact.relationship})</p>
                    <p>{member.emergencyContact.phone}</p>
                    {member.emergencyContact.email && <p>{member.emergencyContact.email}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gym Information */}
            <Card>
              <CardHeader>
                <CardTitle>Gym Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Branch</h4>
                  <p className="text-sm">{member.branchName}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2 flex items-center justify-between">
                    Membership Status
                    {hasPermission('members.edit') && member.membershipStatus === 'not-assigned' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setAssignMembershipOpen(true)}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    )}
                  </h4>
                  <div className="space-y-2">
                    {getMembershipStatusBadge(member.membershipStatus)}
                    {member.membershipPlan && (
                      <p className="text-sm text-muted-foreground">Plan: {member.membershipPlan}</p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Assigned Trainer</h4>
                  <p className="text-sm">
                    {member.trainerName || <span className="text-muted-foreground">No trainer assigned</span>}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Joined Date</h4>
                  <p className="text-sm">{format(member.joinedDate, 'MMMM dd, yyyy')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Physical Measurements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Current Measurements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold">
                    {latestMeasurement?.weight || member.measurements.weight} kg
                  </p>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  {progressSummary?.weightChange && (
                    <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {progressSummary.weightChange > 0 ? '+' : ''}{progressSummary.weightChange}kg
                    </p>
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-semibold">{member.measurements.height} cm</p>
                  <p className="text-sm text-muted-foreground">Height</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-semibold">
                    {latestMeasurement?.bmi?.toFixed(1) || member.measurements.bmi?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    BMI ({getBMICategory(latestMeasurement?.bmi || member.measurements.bmi)})
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-semibold">
                    {latestMeasurement?.bodyFat || member.measurements.fatPercentage || 'N/A'}%
                  </p>
                  <p className="text-sm text-muted-foreground">Body Fat</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-semibold">
                    {latestMeasurement?.muscleMass || member.measurements.musclePercentage || 'N/A'}%
                  </p>
                  <p className="text-sm text-muted-foreground">Muscle Mass</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <ProgressCharts
            memberId={member.id}
            measurements={measurements}
            attendance={attendanceRecords}
          />
        </TabsContent>

        <TabsContent value="measurements">
          <Card>
            <CardHeader>
              <CardTitle>Measurement History</CardTitle>
              <CardDescription>Track changes in body composition over time</CardDescription>
            </CardHeader>
            <CardContent>
              {measurements.length > 0 ? (
                <div className="space-y-4">
                  {measurements
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((measurement) => (
                    <div key={measurement.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">{format(measurement.date, 'MMMM dd, yyyy')}</p>
                          <p className="text-sm text-muted-foreground">
                            Recorded by {measurement.recordedByName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Weight</p>
                          <p className="font-semibold">{measurement.weight} kg</p>
                        </div>
                        {measurement.bodyFat && (
                          <div>
                            <p className="text-sm text-muted-foreground">Body Fat</p>
                            <p className="font-semibold">{measurement.bodyFat}%</p>
                          </div>
                        )}
                        {measurement.muscleMass && (
                          <div>
                            <p className="text-sm text-muted-foreground">Muscle Mass</p>
                            <p className="font-semibold">{measurement.muscleMass}%</p>
                          </div>
                        )}
                        {measurement.bmi && (
                          <div>
                            <p className="text-sm text-muted-foreground">BMI</p>
                            <p className="font-semibold">{measurement.bmi}</p>
                          </div>
                        )}
                      </div>
                      
                      {measurement.notes && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm">{measurement.notes}</p>
                        </div>
                      )}
                      
                      {measurement.images && measurement.images.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-2">Progress Photos</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {measurement.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Progress photo ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No measurements recorded yet</p>
                  <p className="text-sm">Start tracking progress by recording measurements</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <MemberBillingCard memberId={member.id} />
        </TabsContent>
      </Tabs>

      {/* Assign Membership Drawer */}
      <AssignMembershipDrawer
        open={assignMembershipOpen}
        onClose={() => setAssignMembershipOpen(false)}
        memberName={member.fullName}
        onSubmit={handleAssignMembership}
      />
    </div>
  );
};
