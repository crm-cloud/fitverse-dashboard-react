import { useState, useMemo } from 'react';
import { ClassCard } from '@/components/classes/ClassCard';
import { mockClasses, mockMembers, mockClassEnrollments } from '@/utils/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const MemberClassesPage = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  
  const member = mockMembers.find(m => m.email === authState.user?.email);
  const memberEnrollments = mockClassEnrollments.filter(e => e.memberId === member?.id);

  const upcomingClasses = useMemo(() => {
    const now = new Date();
    return mockClasses.filter(gymClass => 
      gymClass.startTime > now && 
      gymClass.status === 'scheduled'
    ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, []);

  const handleEnroll = (classId: string) => {
    toast({
      title: 'Class Booked',
      description: 'You have successfully registered for this class.',
    });
  };

  const handleCancel = (classId: string) => {
    toast({
      title: 'Booking Cancelled', 
      description: 'Your class booking has been cancelled.',
    });
  };

  if (!member) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">Member profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Available Classes</h1>
        <p className="text-muted-foreground">Book your fitness classes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingClasses.map((gymClass) => {
          const isEnrolled = memberEnrollments.some(e => e.classId === gymClass.id);
          
          return (
            <ClassCard
              key={gymClass.id}
              gymClass={gymClass}
              onEnroll={handleEnroll}
              onCancel={handleCancel}
              isEnrolled={isEnrolled}
              userRole="member"
            />
          );
        })}
      </div>
    </div>
  );
};