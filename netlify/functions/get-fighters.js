exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data, error } = await supabase
      .from('fighters')
      .select('name, weight_class')
      .order('weight_class', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ fighters: [] }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
      body: JSON.stringify({ fighters: data })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message, fighters: [] }) };
  }
};
