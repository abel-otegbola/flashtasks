import { todo } from '../interface/todo';
import { Organization } from '../interface/organization';
import { User } from '../interface/auth';

type PermissionChecker = (permission: string, orgId?: string) => boolean;

const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase() || '';

export const isTaskOwnedByUser = (task: Pick<todo, 'userEmail' | 'userId' | 'organizationId'>, user?: User | null) => {
  if (!user) return false;

  const currentEmail = normalizeEmail(user.email);
  const taskEmail = normalizeEmail(task.userEmail);

  return Boolean(currentEmail && (taskEmail === currentEmail || task.userId === user.$id || task.userId === user.userId));
};

export const canEditTask = (
  task: Pick<todo, 'userEmail' | 'userId' | 'organizationId' | 'assignees'>,
  user?: User | null,
  currentOrg?: Organization | null,
  hasPermission?: PermissionChecker,
) => {
  const ownedByUser = isTaskOwnedByUser(task, user);

  if (!task.organizationId) {
    return ownedByUser;
  }

  if (currentOrg?.ownerEmail && normalizeEmail(currentOrg.ownerEmail) === normalizeEmail(user?.email)) {
    return true;
  }

  if (hasPermission?.('Create/edit/delete all tasks', task.organizationId)) return true;

  if (ownedByUser && hasPermission?.('Edit their own tasks', task.organizationId)) return true;

  if (user?.email && (task.assignees || []).includes(user.email) && hasPermission?.('Edit tasks assigned to them', task.organizationId)) {
    return true;
  }

  return false;
};

export const canDeleteTask = (
  task: Pick<todo, 'userEmail' | 'userId' | 'organizationId' | 'assignees'>,
  user?: User | null,
  currentOrg?: Organization | null,
  hasPermission?: PermissionChecker,
) => canEditTask(task, user, currentOrg, hasPermission);

export const canCreateTask = (
  organizationId?: string,
  user?: User | null,
  currentOrg?: Organization | null,
  hasPermission?: PermissionChecker,
) => {
  if (!organizationId) return true;

  const isOrgOwner = Boolean(currentOrg?.ownerEmail && normalizeEmail(currentOrg.ownerEmail) === normalizeEmail(user?.email));
  return isOrgOwner || Boolean(hasPermission?.('Create tasks', organizationId) || hasPermission?.('Create/edit/delete all tasks', organizationId));
};