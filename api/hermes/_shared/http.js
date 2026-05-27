export const allowMethods = (req, res, methods) => {
  if (methods.includes(req.method)) return true;

  res.setHeader('Allow', methods.join(', '));
  res.status(405).send('Method not allowed');
  return false;
};

export const readJsonBody = async (req) => {
  if (typeof req.body === 'object' && req.body !== null) {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw) return resolve({});

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
};

export const readRawBody = async (req) => {
  if (typeof req.body === 'string') {
    return req.body;
  }

  if (typeof req.body === 'object' && req.body !== null) {
    return JSON.stringify(req.body);
  }

  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
};

export const sendJson = (res, status, payload) => res.status(status).json(payload);

export const sendError = (res, status, message, details = {}) => {
  return res.status(status).json({ error: message, ...details });
};
