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
 
    const prompt = `You are an expert UFC analyst. Analyze this fight matchup and provide a detailed breakdown.\n\nFight: ${fighter1} vs ${fighter2}${ctxLine ? '\nContext: ' + ctxLine : ''}\n\nStructure your response exactly like this:\n\nOVERVIEW\n2-3 sentences setting up why this matchup is interesting.\n\nFIGHTER BREAKDOWN\n${fighter1}: 3-4 sentences on their style, strengths, key stats, and recent form.\n${fighter2}: 3-4 sentences on their style, strengths, key stats, and recent form.\n\nKEY FACTORS\n3 bullet points (start each with -) on the most decisive factors in this fight.\n\nHOW IT PLAYS OUT\n2-3 sentences describing the most likely scenario.\n\nPREDICTION\nWinner: [name]\nMethod: [KO/TKO | Submission | Decision]\nConfidence: [Low | Medium | High]\nOne sentence explaining your pick.\n\nKeep it analytical, specific, and punchy. No fluff.`;
 
    const payload = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
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
      body: JSON.stringify({ error: 'DETAILS: ' + err.message + ' | KEY: ' + (process.env.ANTHROPIC_API_KEY ? 'found' : 'MISSING') })
    };
  }
};
 
