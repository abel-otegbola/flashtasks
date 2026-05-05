// Centralized helper to send indexing requests to the backend indexing endpoints.
type IndexAction = 'create' | 'update' | 'delete';

const getBackend = () => import.meta.env.VITE_BACKEND_URL || '';

const normalizeOrganizationForIndex = (payload: any) => ({
  $id: payload?.$id,
  name: payload?.name,
  ownerEmail: payload?.ownerEmail || payload?.owner?.email || '',
  slug: payload?.slug || '',
  description: payload?.description || '',
  members: Array.isArray(payload?.members)
    ? payload.members.map((member: any) => ({
        $id: typeof member === 'string' ? member : member?.$id || member?.userId || member?.email || '',
        name: typeof member === 'string' ? member : member?.name || member?.fullname || member?.email || '',
        email: typeof member === 'string' ? member : member?.email || member?.userId || member?.$id || '',
        role: typeof member === 'string' ? 'member' : member?.role || 'member',
        permissions: Array.isArray(member?.permissions) ? member.permissions : [],
      }))
    : [],
  teams: Array.isArray(payload?.teams)
    ? payload.teams.map((team: any) => ({
        $id: team?.$id,
        name: team?.name,
        members: Array.isArray(team?.members) ? team.members : [],
      }))
    : [],
  createdAt: payload?.createdAt || payload?.$createdAt || '',
});

export async function indexTask(action: IndexAction, payload: any) {
  try {
    const backend = getBackend();
    await fetch(`${backend}api/index/task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action === 'delete' ? { action, id: payload } : { action, document: payload })
    });
  } catch (e) {
    // keep indexing fire-and-forget; log but don't throw
    console.warn('indexTask failed', e);
  }
}

export async function indexOrganization(action: IndexAction, payload: any) {
  try {
    const backend = getBackend();
    await fetch(`${backend}api/index/organization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action === 'delete' ? { action, id: payload } : { action, document: normalizeOrganizationForIndex(payload) })
    });
  } catch (e) {
    console.warn('indexOrganization failed', e);
  }
}

export default { indexTask, indexOrganization };
