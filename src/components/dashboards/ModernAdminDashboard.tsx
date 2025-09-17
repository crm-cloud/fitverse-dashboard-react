import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  ArrowUpRight,
  MoreHorizontal,
  Target,
  Activity
} from 'lucide-react';
import { useBranchContext } from '@/hooks/useBranchContext';

export const ModernAdminDashboard = () => {
  const { currentBranchId } = useBranchContext();

  const revenueData = [
    { month: 'Apr', value: 32 },
    { month: 'May', value: 48 },
    { month: 'Jun', value: 78 },
    { month: 'Jul', value: 33 },
    { month: 'Aug', value: 77 },
    { month: 'Sep', value: 68 },
    { month: 'Oct', value: 48 }
  ];

  const followUpTasks = [
    { name: 'Sanket Pandit', email: 'pandit.sanket@gmail.com', completed: true },
    { name: 'Tiyasa Roy Nandi', email: 'tiyasa.nandi@gmail.com', completed: true },
    { name: 'Sachin Burnwal', phone: '(541) 778-2306', completed: false }
  ];

  const newContacts = [
    { id: 1, avatar: '👨‍💼' },
    { id: 2, avatar: '👩‍💼' },
    { id: 3, avatar: '👨‍🎓' },
    { id: 4, avatar: '👩‍🎤' }
  ];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your gym's financial performance
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {currentBranchId ? `Branch Selected` : 'Admin Access'}
        </Badge>
      </div>

      {/* Top Schedule Bar */}
      <div className="flex items-center gap-4 p-4 bg-card rounded-xl border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          Scheduled today
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-primary" />
          10:35
        </div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">1 hour</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive"></div>
          <span className="text-sm">11:00 AM</span>
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-background"></div>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">1 hour</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Total Revenue Card */}
        <Card className="col-span-12 lg:col-span-6 bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Total revenue
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Keep an eye on the total income generated
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>This year</span>
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-primary">$13,852.64</div>
              
              {/* Revenue Chart Bar */}
              <div className="flex items-end gap-1 h-20">
                {revenueData.map((item, index) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className={`w-full rounded-t-md ${
                        index === 6 ? 'bg-primary' : 'bg-muted'
                      }`}
                      style={{ height: `${item.value}%` }}
                    ></div>
                    <span className="text-xs text-muted-foreground">{item.month}</span>
                    <span className="text-xs text-muted-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
              
              <div className="text-2xl font-bold text-primary">$3,256.32</div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side Cards */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          {/* Monthly Recurring */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Monthly recurring</CardTitle>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Check your recurring monthly revenue streams
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="w-16 h-16 rounded-full border-4 border-muted"></div>
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent transform rotate-45"></div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Product</div>
                  <div className="text-lg font-bold text-foreground">$1,425.28</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Scheduled */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Appointments scheduled</CardTitle>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Track upcoming client sessions with ease
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">56</div>
            </CardContent>
          </Card>
        </div>

        {/* Follow Up Section */}
        <Card className="col-span-12 lg:col-span-6 bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Follow up</CardTitle>
              <Badge variant="destructive" className="text-xs">12</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Track ongoing communications & interactions with your contacts
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {followUpTasks.map((task, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{task.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {task.email ? (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {task.email}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {task.phone}
                      </div>
                    )}
                  </div>
                </div>
                {task.completed ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Side Cards Row 2 */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          {/* New Contacts */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">New contacts</CardTitle>
              <p className="text-sm text-muted-foreground">
                See how many new contacts have been added today
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {newContacts.map((contact) => (
                    <div key={contact.id} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-sm">
                      {contact.avatar}
                    </div>
                  ))}
                </div>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <span className="text-sm font-semibold">41+</span>
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Showed */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Appointments showed</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor attendance for all scheduled appointments
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">46</div>
              <div className="text-2xl font-bold text-foreground">38</div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Details */}
        <Card className="col-span-12 lg:col-span-6 bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Revenue details</CardTitle>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Monitor & analyze the financial performance
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Subscriptions</div>
                <div className="text-lg font-bold text-foreground">$1,635.88</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Products</div>
                <div className="text-lg font-bold text-foreground">$1125.28</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  Sales tax
                  <div className="w-2 h-2 rounded-full bg-destructive"></div>
                </div>
                <div className="text-lg font-bold text-foreground">$325.36</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Retention */}
        <Card className="col-span-12 lg:col-span-6 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Attendance retention</CardTitle>
            <p className="text-sm text-muted-foreground">
              Measure the consistency of member attendance over time
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-2xl font-bold text-foreground">24%</div>
              <div className="h-12 flex items-center">
                <div className="flex-1 h-px bg-muted relative">
                  <div className="absolute right-0 top-0 w-2 h-2 bg-primary rounded-full transform -translate-y-1/2"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};