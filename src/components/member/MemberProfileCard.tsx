import { format } from 'date-fns';
import { Phone, Mail, MapPin, Calendar, User, Activity, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Member, MembershipStatus } from '@/types/member';

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
  return (
    <div className="space-y-6">
      {/* Membership Warning */}
      {member.membershipStatus === 'not-assigned' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Membership not assigned. Please activate a membership to track this member's progress.
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
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
              <h4 className="font-medium mb-2">Membership Status</h4>
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
            Physical Measurements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold">{member.measurements.height} cm</p>
              <p className="text-sm text-muted-foreground">Height</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-semibold">{member.measurements.weight} kg</p>
              <p className="text-sm text-muted-foreground">Weight</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-semibold">
                {member.measurements.bmi ? member.measurements.bmi.toFixed(1) : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">
                BMI ({getBMICategory(member.measurements.bmi)})
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-semibold">
                {member.measurements.fatPercentage ? `${member.measurements.fatPercentage}%` : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Body Fat</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-semibold">
                {member.measurements.musclePercentage ? `${member.measurements.musclePercentage}%` : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Muscle Mass</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};