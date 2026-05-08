export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-client-id, x-access-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientId = req.headers['x-client-id'] || '';
  const accessToken = req.headers['x-access-token'] || '';

  if (!clientId || !accessToken) {
    return res.status(401).json({ error: 'Missing credentials' });
  }

  const endpoint = req.query.endpoint || '';
  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint' });
  }

  const dhanURL = 'https://api.dhan.co' + endpoint;

  try {
    let body = null;
    if (req.method === 'POST') {
      body = JSON.stringify(req.body);
    }

    const dhanRes = await fetch(dhanURL, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'access-token': accessToken,
        'client-id': clientId,
        'Accept': 'application/json',
      },
      ...(body ? { body } : {})
    });

    const text = await dhanRes.text();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(dhanRes.status).send(text);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
