const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { fighter1, fighter2, weightclass, context } = JSON.parse(event.body);

    if (!fighter1 || !fighter2) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Both fighters are required.' }) };
    }

    const ctxLine = [weightclass, context].filter(Boolean).join(' · ');

    const prompt = `You are an expert UFC analyst. Analyze this fight matchup and provide a detailed breakdown.

Fight: ${fighter1} vs ${fighter2}${ctxLine ? '\nContext: ' + ctxLine : ''}

Structure your response exactly like this:

OVERVIEW
2-3 sentences setting up why this matchup is interesting.

FIGHTER BREAKDOWN
${fighter1}: 3-4 sentences on their style, strengths, key stats, and recent form.
${fighter2}: 3-4 sentences on their style, strengths, key stats, and recent form.

KEY FACTORS
3 bullet points (start each with -) on the most decisive factors in this fight.

HOW IT PLAYS OUT
2-3 sentences describing the most likely scenario.

PREDICTION
Winner: [name]
Method: [KO/TKO | Submission | Decision]
Confidence: [Low | Medium | High]
One sentence explaining your pick.

Keep it analytical, specific, and punchy. No fluff.`;

    const payload = JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) reject(new Error(parsed.error.message));
            else resolve(parsed.content[0].text);
          } catch(e) { reject(e); }
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
