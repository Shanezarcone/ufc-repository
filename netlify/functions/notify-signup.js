const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { email, type } = JSON.parse(event.body);
    const label = type === 'free_prediction' ? 'Free Prediction Signup' : 'New Account Created';

    const payload = JSON.stringify({
      personalizations: [{ to: [{ email: 'szarcone20@gmail.com' }] }],
      from: { email: 'noreply@ufc-ai-betting.netlify.app' },
      subject: `FightIQ — ${label}`,
      content: [{ type: 'text/plain', value: `New user: ${email}\nType: ${label}\nTime: ${new Date().toISOString()}` }]
    });

    const req = https.request({
      hostname: 'api.sendgrid.com',
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => { res.resume(); });

    req.on('error', () => {});
    req.write(payload);
    req.end();

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
