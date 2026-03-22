/**
 * WorkflowTemplates — Pre-built task workflows UI
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  WorkflowTemplate, 
  WorkflowStep,
  WORKFLOW_TEMPLATES,
  getAvailableWorkflows,
  getPopularWorkflows,
  searchWorkflows,
  estimateWorkflowDuration,
} from '@/lib/agency/taskTemplates';
import { Specialization } from '@/lib/agency/agencyTypes';
import { 
  Play, Clock, Users, ChevronRight, ChevronDown, 
  Search, Star, Zap, ArrowRight, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// WORKFLOW CARD
// ============================================================================
interface WorkflowCardProps {
  workflow: WorkflowTemplate;
  teamSize?: number;
  onStart?: (workflow: WorkflowTemplate) => void;
  onPreview?: (workflow: WorkflowTemplate) => void;
  expanded?: boolean;
  className?: string;
}

export function WorkflowCard({
  workflow,
  teamSize = 1,
  onStart,
  onPreview,
  expanded = false,
  className,
}: WorkflowCardProps) {
  const [showSteps, setShowSteps] = useState(expanded);
  const estimatedTime = estimateWorkflowDuration(workflow, teamSize);
  
  const difficultyColors = {
    beginner: 'bg-neon-green/10 text-neon-green',
    intermediate: 'bg-neon-blue/10 text-neon-blue',
    advanced: 'bg-neon-purple/10 text-neon-purple',
    expert: 'bg-destructive/10 text-destructive',
  };
  
  const categoryColors = {
    research: 'from-neon-blue to-primary',
    content: 'from-neon-purple to-neon-purple',
    analysis: 'from-neon-cyan to-neon-blue',
    outreach: 'from-neon-amber to-destructive',
    audit: 'from-slate-500 to-gray-600',
    growth: 'from-lime-500 to-neon-green',
  };
  
  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border bg-card overflow-hidden',
        'transition-shadow hover:shadow-lg',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'h-2 bg-gradient-to-r',
          categoryColors[workflow.category]
        )}
      />
      
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted text-2xl">
            {workflow.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{workflow.name}</h3>
              {workflow.popularity >= 80 && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Star className="w-3 h-3" />
                  Popular
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {workflow.description}
            </p>
            
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~{estimatedTime} min
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {workflow.steps.length} steps
              </span>
              <span className={cn('px-1.5 py-0.5 rounded', difficultyColors[workflow.difficulty])}>
                {workflow.difficulty}
              </span>
            </div>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {workflow.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-muted"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onStart?.(workflow)}
          >
            <Play className="w-4 h-4 mr-1" />
            Start Workflow
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSteps(!showSteps)}
          >
            {showSteps ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Steps */}
      <AnimatePresence>
        {showSteps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t bg-muted/30"
          >
            <div className="p-4 space-y-3">
              {workflow.steps.map((step, index) => (
                <WorkflowStepItem
                  key={step.id}
                  step={step}
                  index={index}
                  isLast={index === workflow.steps.length - 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// WORKFLOW STEP ITEM
// ============================================================================
interface WorkflowStepItemProps {
  step: WorkflowStep;
  index: number;
  isLast: boolean;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

function WorkflowStepItem({ step, index, isLast, status = 'pending' }: WorkflowStepItemProps) {
  const statusColors = {
    pending: 'bg-muted text-muted-foreground',
    running: 'bg-neon-amber text-white animate-pulse',
    completed: 'bg-neon-green text-white',
    failed: 'bg-destructive text-white',
  };
  
  return (
    <div className="flex gap-3">
      {/* Step number / connector */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
            statusColors[status]
          )}
        >
          {status === 'completed' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            index + 1
          )}
        </div>
        {!isLast && (
          <div className="w-px h-full bg-border mt-1" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{step.name}</h4>
          {step.optional && (
            <Badge variant="outline" className="text-xs">
              Optional
            </Badge>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-0.5">
          {step.description}
        </p>
        
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>~{step.estimatedMinutes} min</span>
          <span className="text-muted">•</span>
          <span>{step.requiredSpecs.join(', ')}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WORKFLOW PICKER
// ============================================================================
interface WorkflowPickerProps {
  teamSpecs: Specialization[];
  onSelect: (workflow: WorkflowTemplate) => void;
  className?: string;
}

export function WorkflowPicker({ teamSpecs, onSelect, className }: WorkflowPickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const availableWorkflows = getAvailableWorkflows(teamSpecs);
  const filteredWorkflows = search
    ? searchWorkflows(search).filter(w => availableWorkflows.includes(w))
    : activeCategory
      ? availableWorkflows.filter(w => w.category === activeCategory)
      : availableWorkflows;
  
  const categories = ['research', 'content', 'analysis', 'outreach', 'audit', 'growth'];
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search workflows..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          size="sm"
          variant={activeCategory === null ? 'default' : 'outline'}
          onClick={() => setActiveCategory(null)}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={activeCategory === category ? 'default' : 'outline'}
            onClick={() => setActiveCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>
      
      {/* Popular section */}
      {!search && !activeCategory && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon-amber" />
            Popular Workflows
          </h3>
          <div className="grid gap-4">
            {getPopularWorkflows(3).map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                teamSize={teamSpecs.length}
                onStart={onSelect}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* All workflows */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">
          {search ? 'Search Results' : 'All Workflows'}
        </h3>
        <div className="grid gap-4">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              teamSize={teamSpecs.length}
              onStart={onSelect}
            />
          ))}
          
          {filteredWorkflows.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No workflows found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT WORKFLOW LIST
// ============================================================================
interface CompactWorkflowListProps {
  workflows: WorkflowTemplate[];
  onSelect: (workflow: WorkflowTemplate) => void;
  className?: string;
}

export function CompactWorkflowList({ workflows, onSelect, className }: CompactWorkflowListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {workflows.map((workflow) => (
        <motion.button
          key={workflow.id}
          className={cn(
            'w-full flex items-center gap-3 p-3 rounded-lg',
            'bg-muted/50 hover:bg-accent transition-colors text-left'
          )}
          whileHover={{ x: 4 }}
          onClick={() => onSelect(workflow)}
        >
          <span className="text-xl">{workflow.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{workflow.name}</p>
            <p className="text-xs text-muted-foreground">
              {workflow.steps.length} steps • ~{workflow.estimatedMinutes} min
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      ))}
    </div>
  );
}
