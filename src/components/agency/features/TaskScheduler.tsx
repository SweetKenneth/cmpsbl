/**
 * Visual Task Scheduler — Drag-and-drop calendar for scheduling tasks
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Calendar, Clock, Plus, Trash2, Play, Pause,
  ChevronLeft, ChevronRight, MoreHorizontal,
  Repeat, CalendarDays, Timer, GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { format, addDays, startOfWeek, isToday, startOfDay } from 'date-fns';
import { TASK_TYPES, TaskTypeId } from '@/lib/agency/agencyTasks';

// date-fns v3 type exports are missing for some helpers in our build;
// keep behavior identical via a local helper.
const isSameDayLocal = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

// ============================================================================
// TYPES
// ============================================================================
export interface ScheduledTask {
  id: string;
  title: string;
  taskType: TaskTypeId;
  scheduledTime: Date;
  isRecurring: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly';
  recurrenceDay?: number;
  isActive: boolean;
  lastRun?: Date;
  runCount: number;
}

interface SchedulerProps {
  scheduledTasks: ScheduledTask[];
  onCreateSchedule: (task: Omit<ScheduledTask, 'id' | 'runCount'>) => Promise<void>;
  onUpdateSchedule: (id: string, updates: Partial<ScheduledTask>) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
  onRunNow: (task: ScheduledTask) => Promise<void>;
  className?: string;
}

// ============================================================================
// TIME SLOTS
// ============================================================================
const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00'
];

const RECURRENCE_OPTIONS = [
  { value: 'once', label: 'One time', icon: CalendarDays },
  { value: 'daily', label: 'Daily', icon: Repeat },
  { value: 'weekly', label: 'Weekly', icon: Calendar },
  { value: 'monthly', label: 'Monthly', icon: Timer },
];

// ============================================================================
// SCHEDULE CARD
// ============================================================================
interface ScheduleCardProps {
  task: ScheduledTask;
  onToggle: (active: boolean) => void;
  onDelete: () => void;
  onRunNow: () => void;
  compact?: boolean;
}

function ScheduleCard({ task, onToggle, onDelete, onRunNow, compact }: ScheduleCardProps) {
  const taskTypeConfig = TASK_TYPES[task.taskType];
  
  return (
    <Reorder.Item
      value={task}
      id={task.id}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-xl',
        'bg-card/60 border border-border/50 backdrop-blur-sm',
        'hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing',
        !task.isActive && 'opacity-50'
      )}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
        "bg-gradient-to-br from-primary/20 to-primary/5"
      )}>
        <span className="text-lg">{taskTypeConfig?.icon || '📋'}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{task.title}</span>
          {task.isRecurring && (
            <Badge variant="outline" className="text-[10px] px-1.5 h-4 shrink-0">
              <Repeat className="w-2.5 h-2.5 mr-1" />
              {task.recurrenceType}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <Clock className="w-3 h-3" />
          <span>{format(task.scheduledTime, 'HH:mm')}</span>
          {task.lastRun && (
            <>
              <span>•</span>
              <span>Last: {format(task.lastRun, 'MMM d')}</span>
            </>
          )}
          {task.runCount > 0 && (
            <>
              <span>•</span>
              <span>{task.runCount} runs</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 shrink-0">
        <Switch
          checked={task.isActive}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-neon-green"
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem onClick={onRunNow}>
              <Play className="w-4 h-4 mr-2" />
              Run Now
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Reorder.Item>
  );
}

// ============================================================================
// NEW SCHEDULE DIALOG
// ============================================================================
interface NewScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Omit<ScheduledTask, 'id' | 'runCount'>) => Promise<void>;
  selectedDate?: Date;
}

function NewScheduleDialog({ open, onOpenChange, onSubmit, selectedDate }: NewScheduleDialogProps) {
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<TaskTypeId>('research');
  const [time, setTime] = useState('09:00');
  const [recurrence, setRecurrence] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('once');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = selectedDate ? new Date(selectedDate) : new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      await onSubmit({
        title,
        taskType,
        scheduledTime,
        isRecurring: recurrence !== 'once',
        recurrenceType: recurrence === 'once' ? undefined : recurrence,
        isActive: true,
      });
      
      // Reset form
      setTitle('');
      setTaskType('research');
      setTime('09:00');
      setRecurrence('once');
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule Task
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Task Name</Label>
            <Input
              placeholder="e.g., Daily SEO Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Task Type</Label>
            <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskTypeId)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {Object.entries(TASK_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span>{config.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-48">
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Repeat</Label>
              <Select value={recurrence} onValueChange={(v: any) => setRecurrence(v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <opt.icon className="w-3.5 h-3.5" />
                        <span>{opt.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || isSubmitting}>
            {isSubmitting ? 'Scheduling...' : 'Schedule'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// WEEK VIEW
// ============================================================================
interface WeekViewProps {
  tasks: ScheduledTask[];
  currentDate: Date;
  onDayClick: (date: Date) => void;
  selectedDate?: Date;
}

function WeekView({ tasks, currentDate, onDayClick, selectedDate }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const getTasksForDay = (day: Date) => 
    tasks.filter(t => isSameDayLocal(t.scheduledTime, day) || 
      (t.isRecurring && t.recurrenceType === 'daily') ||
      (t.isRecurring && t.recurrenceType === 'weekly' && t.scheduledTime.getDay() === day.getDay())
    );
  
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => {
        const dayTasks = getTasksForDay(day);
        const isSelected = selectedDate && isSameDayLocal(day, selectedDate);
        
        return (
          <button
            key={day.toISOString()}
            onClick={() => onDayClick(day)}
            className={cn(
              'flex flex-col items-center p-2 rounded-xl transition-all',
              'hover:bg-accent/50',
              isToday(day) && 'ring-2 ring-primary/50',
              isSelected && 'bg-primary/10 border border-primary/30'
            )}
          >
            <span className="text-[10px] uppercase text-muted-foreground">
              {format(day, 'EEE')}
            </span>
            <span className={cn(
              'text-lg font-semibold',
              isToday(day) && 'text-primary'
            )}>
              {format(day, 'd')}
            </span>
            
            {dayTasks.length > 0 && (
              <div className="flex gap-0.5 mt-1">
                {dayTasks.slice(0, 3).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 h-1.5 rounded-full bg-primary" 
                  />
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[8px] text-muted-foreground ml-0.5">
                    +{dayTasks.length - 3}
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN SCHEDULER
// ============================================================================
export function TaskScheduler({
  scheduledTasks,
  onCreateSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onRunNow,
  className,
}: SchedulerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [orderedTasks, setOrderedTasks] = useState(scheduledTasks);
  
  // Sync with props
  useMemo(() => {
    setOrderedTasks(scheduledTasks);
  }, [scheduledTasks]);
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };
  
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowNewDialog(true);
  };
  
  const filteredTasks = useMemo(() => {
    if (!selectedDate) return orderedTasks;
    return orderedTasks.filter(t => 
      isSameDayLocal(t.scheduledTime, selectedDate) ||
      (t.isRecurring && t.recurrenceType === 'daily') ||
      (t.isRecurring && t.recurrenceType === 'weekly' && t.scheduledTime.getDay() === selectedDate.getDay())
    );
  }, [orderedTasks, selectedDate]);
  
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Task Scheduler</h3>
          <Badge variant="outline" className="text-xs">
            {scheduledTasks.filter(t => t.isActive).length} active
          </Badge>
        </div>
        
        <Button size="sm" onClick={() => setShowNewDialog(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Schedule
        </Button>
      </div>
      
      {/* Calendar Navigation */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium text-sm">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <WeekView
          tasks={scheduledTasks}
          currentDate={currentDate}
          onDayClick={handleDayClick}
          selectedDate={selectedDate}
        />
      </div>
      
      {/* Task List */}
      <ScrollArea className="flex-1 p-4">
        {selectedDate && (
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              {format(selectedDate, 'EEEE, MMM d')}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setSelectedDate(undefined)}
            >
              Show all
            </Button>
          </div>
        )}
        
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No scheduled tasks</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click a day or press "Schedule" to add tasks
            </p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={filteredTasks}
            onReorder={setOrderedTasks}
            className="space-y-2"
          >
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <ScheduleCard
                  key={task.id}
                  task={task}
                  onToggle={(active) => onUpdateSchedule(task.id, { isActive: active })}
                  onDelete={() => onDeleteSchedule(task.id)}
                  onRunNow={() => onRunNow(task)}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </ScrollArea>
      
      {/* New Schedule Dialog */}
      <NewScheduleDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSubmit={onCreateSchedule}
        selectedDate={selectedDate}
      />
    </div>
  );
}

// ============================================================================
// COMPACT SCHEDULER WIDGET
// ============================================================================
interface SchedulerWidgetProps {
  tasks: ScheduledTask[];
  onViewFull: () => void;
  className?: string;
}

export function SchedulerWidget({ tasks, onViewFull, className }: SchedulerWidgetProps) {
  const upcomingTasks = tasks
    .filter(t => t.isActive)
    .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
    .slice(0, 3);
  
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Upcoming</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewFull} className="h-7 text-xs">
          View All
        </Button>
      </div>
      
      {upcomingTasks.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No scheduled tasks
        </p>
      ) : (
        <div className="space-y-2">
          {upcomingTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 text-sm"
            >
              <span className="text-lg">{TASK_TYPES[task.taskType]?.icon || '📋'}</span>
              <span className="flex-1 truncate">{task.title}</span>
              <span className="text-xs text-muted-foreground">
                {format(task.scheduledTime, 'HH:mm')}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
