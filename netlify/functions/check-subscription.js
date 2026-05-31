exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { userId } = JSON.parse(event.body);
    if (!userId) return { statusCode: 200, body: JSON.stringify({ subscribed: false }) };

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data, error } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .single();

    if (error || !data) return { statusCode: 200, body: JSON.stringify({ subscribed: false }) };
    return { statusCode: 200, body: JSON.stringify({ subscribed: data.status === 'active' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ subscribed: false }) };
  }
};
