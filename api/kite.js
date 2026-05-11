export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-kite-token,x-kite-key');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const endpoint = req.query.endpoint;
  if (!endpoint) { res.status(400).json({ error: 'endpoint required' }); return; }

  const kiteToken = req.headers['x-kite-token'];
  const kiteKey   = req.headers['x-kite-key'];
  if (!kiteToken)  { res.status(401).json({ error: 'x-kite-token required' }); return; }

  try {
    const kiteRes = await fetch('https://api.kite.trade' + endpoint, {
      method: req.method,
      headers: {
        'X-Kite-Version': '3',
        'Authorization': 'token ' + kiteKey + ':' + kiteToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const data = await kiteRes.json();
    res.status(kiteRes.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
