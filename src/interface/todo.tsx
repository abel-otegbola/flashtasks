export interface todo {
  $id: string;
  id?: string; // Keep for backward compatibility
  title: string;
  description: string;
  comments: string;
  category: string;
  userId: string;
  userEmail: string;
  assignees?: string[];
  invites?: string[];
  organizationId?: string;
  teamId?: string;
  orderIndex?: number;
  status: 'pending' | 'upcoming' | 'in progress' | 'completed' | 'suspended';
  priority?: 'low' | 'medium' | 'high';
  recurring?: boolean;
  dueDate?: string;
  scheduledAt?: string;
  scheduleStatus?: 'unscheduled' | 'scheduled' | 'drafted' | 'sent' | 'failed';
  scheduleSource?: 'user' | 'integration';
  schedulePayload?: string;
  subtasks?: string;
  $createdAt: string;
  $updatedAt?: string;
}