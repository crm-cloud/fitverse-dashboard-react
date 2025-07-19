
import { useState } from 'react';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { FeedbackList } from '@/components/feedback/FeedbackList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Plus, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { mockFeedback, mockFeedbackStats } from '@/mock/feedback';
import { mockMembers } from '@/mock/members';

export const MemberFeedbackPage = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  const member = mockMembers.find(m => m.email === authState.user?.email);
  const memberFeedback = mockFeedback.filter(f => f.memberId === member?.id);

  const handleSubmitFeedback = (data: any) => {
    console.log('Submitting feedback:', data);
    setShowFeedbackForm(false);
    
    toast({
      title: 'Feedback Submitted Successfully',
      description: 'Thank you for your feedback! We\'ll review it and get back to you soon.'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Feedback</h1>
          <p className="text-muted-foreground">Share your experience and track your feedback</p>
        </div>
        <Button onClick={() => setShowFeedbackForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Give Feedback
        </Button>
      </div>

      {showFeedbackForm && (
        <FeedbackForm
          onSubmit={handleSubmitFeedback}
          onCancel={() => setShowFeedbackForm(false)}
        />
      )}

      {/* Feedback Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Feedback</CardTitle>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">{memberFeedback.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Feedback submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-2xl font-bold text-foreground">
                {memberFeedback.length > 0 
                  ? (memberFeedback.reduce((sum, f) => sum + f.rating, 0) / memberFeedback.length).toFixed(1)
                  : '0.0'
                }
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Stars average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-2xl font-bold text-foreground">
                {memberFeedback.length > 0 
                  ? Math.round((memberFeedback.filter(f => f.adminResponse).length / memberFeedback.length) * 100)
                  : 0
                }%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Admin responses</p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {memberFeedback.length > 0 ? (
            <FeedbackList
              feedbacks={memberFeedback}
              title="All My Feedback"
              description="Complete history of your feedback submissions"
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No Feedback Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your experience to help us improve our services
                </p>
                <Button onClick={() => setShowFeedbackForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Give Your First Feedback
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending">
          <FeedbackList
            feedbacks={memberFeedback.filter(f => f.status === 'pending' || f.status === 'in-review')}
            title="Pending Feedback"
            description="Feedback awaiting response from our team"
          />
        </TabsContent>

        <TabsContent value="resolved">
          <FeedbackList
            feedbacks={memberFeedback.filter(f => f.status === 'resolved' || f.status === 'closed')}
            title="Resolved Feedback"
            description="Feedback that has been addressed by our team"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
