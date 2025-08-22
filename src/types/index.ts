export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  tags: string[];
  project?: string;
  estimatedTime?: number;
  actualTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  progress: number;
  tasks: string[];
  tags: string[];
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentStreak: number;
  bestStreak: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: 'meeting' | 'task' | 'reminder' | 'personal';
  location?: string;
  attendees?: string[];
}

export interface AICommand {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  originalText: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    type: 'time' | 'event' | 'condition';
    value: any;
  };
  actions: {
    type: string;
    parameters: Record<string, any>;
  }[];
  isActive: boolean;
}