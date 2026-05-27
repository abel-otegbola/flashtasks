/* eslint-env node */
/* global process */

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID || '';

const buildHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
});

const request = async (method, path, body) => {
  if (!projectId || !apiKey || !databaseId) {
    throw new Error('Appwrite is not configured for Hermes');
  }

  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers: buildHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let parsed;

  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text };
  }

  if (!response.ok) {
    const message = parsed?.message || parsed?.error || 'Appwrite request failed';
    throw new Error(message);
  }

  return parsed;
};

export const hermesAppwriteConfig = {
  endpoint,
  projectId,
  apiKey,
  databaseId,
};

export const isHermesConfigured = () => Boolean(projectId && apiKey && databaseId);

export const createDocument = async (collectionId, documentId, data) => {
  return request('POST', `/databases/${databaseId}/collections/${collectionId}/documents`, {
    documentId,
    data,
  });
};

export const updateDocument = async (collectionId, documentId, data) => {
  return request('PATCH', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`, {
    data,
  });
};

export const upsertDocument = async (collectionId, documentId, data) => {
  try {
    return await createDocument(collectionId, documentId, data);
  } catch (error) {
    return updateDocument(collectionId, documentId, data);
  }
};

export const deleteDocument = async (collectionId, documentId) => {
  return request('DELETE', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`);
};

export const listDocuments = async (collectionId, queries = []) => {
  const url = new URL(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents`);
  queries.forEach((query) => url.searchParams.append('queries[]', query));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: buildHeaders(),
  });

  const text = await response.text();
  let parsed;

  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text };
  }

  if (!response.ok) {
    throw new Error(parsed?.message || parsed?.error || 'Appwrite list failed');
  }

  return parsed;
};
