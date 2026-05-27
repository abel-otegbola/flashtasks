/* eslint-env node */
/* global process */

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.HERMES_DATABASE_ID;

const collections = [
  {
    id: process.env.HERMES_CONNECTED_ACCOUNTS_COLLECTION_ID || 'connected_accounts',
    name: 'connected_accounts',
    attributes: [
      ['provider', 'string', { size: 20, required: true }],
      ['organizationId', 'string', { size: 255, required: true }],
      ['workspaceId', 'string', { size: 255, required: false }],
      ['userId', 'string', { size: 255, required: false }],
      ['userEmail', 'string', { size: 255, required: false }],
      ['accountId', 'string', { size: 255, required: true }],
      ['externalAccountId', 'string', { size: 255, required: true }],
      ['externalWorkspaceId', 'string', { size: 255, required: false }],
      ['accountName', 'string', { size: 255, required: true }],
      ['tokenType', 'string', { size: 20, required: true }],
      ['accessToken', 'string', { size: 5000, required: true }],
      ['refreshToken', 'string', { size: 5000, required: false }],
      ['scope', 'string', { size: 4000, required: false }],
      ['status', 'string', { size: 20, required: true }],
      ['metadata', 'string', { size: 5000, required: false }],
      ['connectedAt', 'datetime', { required: true }],
      ['updatedAt', 'datetime', { required: true }],
    ],
  },
  {
    id: process.env.HERMES_AUTOMATION_RULES_COLLECTION_ID || 'automation_rules',
    name: 'automation_rules',
    attributes: [
      ['organizationId', 'string', { size: 255, required: true }],
      ['workspaceId', 'string', { size: 255, required: false }],
      ['userId', 'string', { size: 255, required: false }],
      ['userEmail', 'string', { size: 255, required: false }],
      ['name', 'string', { size: 255, required: true }],
      ['trigger', 'string', { size: 5000, required: true }],
      ['conditions', 'string', { size: 5000, required: true }],
      ['actions', 'string', { size: 5000, required: true }],
      ['enabled', 'boolean', { required: true, default: true }],
      ['createdAt', 'datetime', { required: true }],
      ['updatedAt', 'datetime', { required: true }],
    ],
  },
  {
    id: process.env.HERMES_FOLLOWUP_JOBS_COLLECTION_ID || 'followup_jobs',
    name: 'followup_jobs',
    attributes: [
      ['organizationId', 'string', { size: 255, required: true }],
      ['userId', 'string', { size: 255, required: false }],
      ['userEmail', 'string', { size: 255, required: false }],
      ['threadKey', 'string', { size: 255, required: true }],
      ['provider', 'string', { size: 20, required: true }],
      ['jobType', 'string', { size: 40, required: true }],
      ['status', 'string', { size: 20, required: true }],
      ['priority', 'string', { size: 20, required: true }],
      ['payload', 'string', { size: 5000, required: true }],
      ['runAt', 'datetime', { required: true }],
      ['lastError', 'string', { size: 1000, required: false }],
      ['createdAt', 'datetime', { required: true }],
      ['updatedAt', 'datetime', { required: true }],
    ],
  },
  {
    id: process.env.HERMES_SCHEDULED_TASKS_COLLECTION_ID || 'scheduled_tasks',
    name: 'scheduled_tasks',
    attributes: [
      ['organizationId', 'string', { size: 255, required: true }],
      ['userId', 'string', { size: 255, required: false }],
      ['userEmail', 'string', { size: 255, required: false }],
      ['followupJobId', 'string', { size: 255, required: false }],
      ['taskId', 'string', { size: 255, required: false }],
      ['status', 'string', { size: 20, required: true }],
      ['dueAt', 'datetime', { required: true }],
      ['payload', 'string', { size: 5000, required: true }],
      ['createdAt', 'datetime', { required: true }],
      ['updatedAt', 'datetime', { required: true }],
    ],
  },
  {
    id: process.env.HERMES_CONVERSATION_THREADS_COLLECTION_ID || 'conversation_threads',
    name: 'conversation_threads',
    attributes: [
      ['organizationId', 'string', { size: 255, required: true }],
      ['provider', 'string', { size: 20, required: true }],
      ['workspaceId', 'string', { size: 255, required: false }],
      ['accountId', 'string', { size: 255, required: false }],
      ['userId', 'string', { size: 255, required: false }],
      ['userEmail', 'string', { size: 255, required: false }],
      ['threadKey', 'string', { size: 255, required: true }],
      ['subject', 'string', { size: 1000, required: false }],
      ['lastInboundAt', 'datetime', { required: false }],
      ['lastOutboundAt', 'datetime', { required: false }],
      ['status', 'string', { size: 20, required: true }],
      ['taskId', 'string', { size: 255, required: false }],
      ['createdAt', 'datetime', { required: true }],
      ['updatedAt', 'datetime', { required: true }],
    ],
  },
  {
    id: process.env.HERMES_ACTIVITY_LOGS_COLLECTION_ID || 'activity_logs',
    name: 'activity_logs',
    attributes: [
      ['organizationId', 'string', { size: 255, required: true }],
      ['provider', 'string', { size: 20, required: true }],
      ['userId', 'string', { size: 255, required: false }],
      ['userEmail', 'string', { size: 255, required: false }],
      ['entityType', 'string', { size: 20, required: true }],
      ['entityId', 'string', { size: 255, required: true }],
      ['message', 'string', { size: 1000, required: true }],
      ['severity', 'string', { size: 20, required: true }],
      ['payload', 'string', { size: 5000, required: true }],
      ['createdAt', 'datetime', { required: true }],
    ],
  },
];

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': projectId || '',
  'X-Appwrite-Key': apiKey || '',
};

const createCollection = async (collection) => {
  const response = await fetch(`${endpoint}/databases/${databaseId}/collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      collectionId: collection.id,
      name: collection.name,
      permissions: ['create("users")', 'read("users")', 'update("users")', 'delete("users")'],
      documentSecurity: true,
      enabled: true,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.warn(`[hermes/setup] collection ${collection.name} create skipped or failed:`, text);
  }

  for (const [key, type, options] of collection.attributes) {
    const attributeResponse = await fetch(`${endpoint}/databases/${databaseId}/collections/${collection.id}/attributes/${type}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        key,
        ...options,
      }),
    });

    if (!attributeResponse.ok) {
      const text = await attributeResponse.text();
      console.warn(`[hermes/setup] attribute ${collection.name}.${key} create skipped or failed:`, text);
    }
  }
};

async function main() {
  if (!projectId || !apiKey || !databaseId) {
    throw new Error('APPWRITE_PROJECT_ID, APPWRITE_API_KEY, and APPWRITE_DATABASE_ID are required');
  }

  console.log('[hermes/setup] creating Hermes collections');
  for (const collection of collections) {
    await createCollection(collection);
  }
  console.log('[hermes/setup] complete');
}

main().catch((error) => {
  console.error('[hermes/setup] failed', error);
  process.exit(1);
});
