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
  status: 'pending' | 'upcoming' | 'in progress' | 'completed' | 'suspended';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  $createdAt: string;
  $updatedAt?: string;
}