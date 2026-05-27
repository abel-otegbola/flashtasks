export const resolveTenant = (req, body = {}) => ({
  organizationId: req.headers['x-organization-id'] || body.organizationId || body.orgId || '',
  workspaceId: req.headers['x-workspace-id'] || body.workspaceId || body.workspace || '',
  userId: req.headers['x-user-id'] || body.userId || '',
  accountId: req.headers['x-account-id'] || body.accountId || '',
});

export const hasTenantAccess = (tenant) => Boolean(tenant.organizationId || tenant.workspaceId || tenant.userId);
