
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, Plus, Clock, AlertCircle, User, Calendar, Filter, Loader2 } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';

export default function StaffTasksPage() {
  const { authState } = useAuth();
  const [filter, setFilter] = useState('all');
  const { data: tasks = [], isLoading } = useTasks({ 
    assignedTo: authState.user?.id 
  });
  const updateTask = useUpdateTask();

  const stats = useMemo(() => ({
    totalTasks: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filter === 'all') return true;
      if (filter === 'pending') return task.status === 'pending';
      if (filter === 'in-progress') return task.status === 'in-progress';
      if (filter === 'completed') return task.status === 'completed';
      if (filter === 'overdue') return new Date(task.due_date) < new Date() && task.status !== 'completed';
      return true;
    });
  }, [tasks, filter]);

  const handleUpdateStatus = (taskId: string, newStatus: string) => {
    updateTask.mutate({
      id: taskId,
      updates: { 
        status: newStatus as any,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'in-progress': return 'secondary';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cleaning': return '🧽';
      case 'maintenance': return '🔧';
      case 'administrative': return '📋';
      case 'member-service': return '👥';
      default: return '📝';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Tasks</h1>
          <p className="text-muted-foreground">
            Manage your daily tasks and responsibilities
          </p>
        </div>
        <PermissionGate permission="tasks.create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </PermissionGate>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="create">Create Task</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Tasks' },
                { key: 'pending', label: 'Pending' },
                { key: 'in-progress', label: 'In Progress' },
                { key: 'completed', label: 'Completed' },
                { key: 'overdue', label: 'Overdue' }
              ].map((filterOption) => (
                <Button
                  key={filterOption.key}
                  size="sm"
                  variant={filter === filterOption.key ? 'default' : 'outline'}
                  onClick={() => setFilter(filterOption.key)}
                >
                  {filterOption.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card key={task.id} className={isOverdue(task.due_date, task.status) ? 'border-red-200 bg-red-50/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <PermissionGate permission="tasks.edit">
                      <Checkbox 
                        checked={task.status === 'completed'}
                        onCheckedChange={(checked) => {
                          handleUpdateStatus(task.id, checked ? 'completed' : 'pending');
                        }}
                        className="mt-1"
                      />
                    </PermissionGate>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {getCategoryIcon(task.category || '')} {task.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          {isOverdue(task.due_date, task.status) && (
                            <Badge variant="destructive">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>By {task.assigned_by_profile?.full_name || 'Admin'}</span>
                          </div>
                          {task.estimated_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{task.estimated_time} min</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {new Date(task.due_date).toLocaleDateString()} at {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <PermissionGate permission="tasks.edit">
                        <div className="flex gap-2 pt-2">
                          {task.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateStatus(task.id, 'in-progress')}
                            >
                              Start Task
                            </Button>
                          )}
                          {task.status === 'in-progress' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateStatus(task.id, 'completed')}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </PermissionGate>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTasks.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tasks found for the selected filter</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
              <CardDescription>Add a new task to your daily schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Task Title</label>
                  <Input placeholder="Enter task title..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="cleaning">Cleaning</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="administrative">Administrative</option>
                    <option value="member-service">Member Service</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea placeholder="Describe the task..." rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input type="datetime-local" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Time (minutes)</label>
                  <Input type="number" placeholder="30" />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button>Create Task</Button>
                <Button variant="outline">Save as Template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Schedule</CardTitle>
              <CardDescription>View your tasks organized by time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Morning (6 AM - 12 PM)', 'Afternoon (12 PM - 6 PM)', 'Evening (6 PM - 12 AM)'].map((timeSlot, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-lg border-b pb-2">{timeSlot}</h4>
                    <div className="space-y-2 ml-4">
                      {tasks.filter(task => {
                        const hour = new Date(task.due_date).getHours();
                        if (index === 0) return hour >= 6 && hour < 12;
                        if (index === 1) return hour >= 12 && hour < 18;
                        return hour >= 18 || hour < 6;
                      }).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 border-l-4 border-primary/20 bg-muted/30 rounded-r-lg">
                          <div>
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.estimated_time} min • {task.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
