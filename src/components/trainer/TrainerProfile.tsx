import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PackageSelector } from './PackageSelector';
import { TrainerProfile as TrainerProfileType } from '@/types/trainer';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Calendar, 
  Users, 
  Award, 
  MapPin, 
  Mail, 
  Phone,
  CheckCircle
} from 'lucide-react';

interface TrainerProfileProps {
  trainer: TrainerProfileType;
  onBack?: () => void;
  showPackageSelection?: boolean;
}

export const TrainerProfile = ({ trainer, onBack, showPackageSelection = false }: TrainerProfileProps) => {
  const [showPackages, setShowPackages] = useState(false);

  const formatSpecialty = (specialty: string) => {
    return specialty.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (showPackages) {
    return (
      <PackageSelector
        trainer={trainer}
        onBack={() => setShowPackages(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Trainers
        </Button>
      )}

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={trainer.avatar} alt={trainer.fullName} />
                <AvatarFallback className="text-2xl">
                  {getInitials(trainer.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold mb-2">{trainer.fullName}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold">{trainer.rating}</span>
                  <span className="text-muted-foreground">
                    ({trainer.totalSessions} sessions)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{trainer.branchName}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{trainer.experience} years experience</span>
                </div>
              </div>
            </div>

            {/* Key Stats */}
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{trainer.totalClients}</div>
                  <div className="text-sm text-muted-foreground">Total Clients</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{trainer.completionRate}%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">${trainer.hourlyRate}</div>
                  <div className="text-sm text-muted-foreground">Per Hour</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {showPackageSelection && (
                  <Button 
                    onClick={() => setShowPackages(true)} 
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Training
                  </Button>
                )}
                <Button variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About {trainer.fullName.split(' ')[0]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {trainer.bio}
              </p>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Specialties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trainer.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-sm">
                    {formatSpecialty(specialty)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainer.certifications.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{cert.name}</h4>
                      <p className="text-sm text-muted-foreground">{cert.issuingOrganization}</p>
                      <Badge variant={cert.verified ? "default" : "secondary"} className="mt-1">
                        {cert.level} • {cert.verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Issued: {cert.issueDate.toLocaleDateString()}</div>
                      {cert.expiryDate && (
                        <div>Expires: {cert.expiryDate.toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{trainer.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{trainer.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Languages: {trainer.languages.join(', ')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Availability Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Availability Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trainer.availability.map((avail) => {
                  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  return (
                    <div key={avail.dayOfWeek} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{days[avail.dayOfWeek]}</span>
                      {avail.isAvailable ? (
                        <span className="text-sm text-muted-foreground">
                          {avail.startTime} - {avail.endTime}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unavailable</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Training Packages */}
          <Card>
            <CardHeader>
              <CardTitle>Training Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trainer.packageRates.map((pkg, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{pkg.sessions} Sessions</span>
                      <span className="font-bold">${pkg.price}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Valid for {pkg.validityDays} days
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${(pkg.price / pkg.sessions).toFixed(2)} per session
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};