export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const text = req.query.text || (req.body && req.body.text);
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Translate responded with ${response.status}`);
    }
    const data = await response.json();
    let translated = '';
    if (Array.isArray(data) && Array.isArray(data[0])) {
      translated = data[0].map((item) => (item && item[0] ? item[0] : '')).join('');
    }
    return res.status(200).json({ original: text, translated });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Translation failed' });
  }
}
