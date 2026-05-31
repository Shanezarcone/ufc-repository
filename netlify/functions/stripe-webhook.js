const https = require('https');
const crypto = require('crypto');

function verifyStripeSignature(payload, signature, secret) {
  const parts = signature.split(',');
  let timestamp = '';
  let signatures = [];
  
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') timestamp = value;
    if (key === 'v1') signatures.push(value);
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return signatures.some(sig => sig === expectedSig);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const signature = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!verifyStripeSignature(event.body, signature, webhookSecret)) {
      return { statusCode: 400, body: 'Invalid signature' };
    }

    const stripeEvent = JSON.parse(event.body);

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      const customerEmail = session.customer_details?.email;
      const customerId = session.customer;

      if (customerEmail) {
        // Find the Supabase user by email
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users?.find(u => u.email === customerEmail);

        if (user) {
          // Upsert subscription record
          await supabase.from('subscriptions').upsert({
            user_id: user.id,
            status: 'active',
            stripe_customer_id: customerId
          }, { onConflict: 'user_id' });

          // Notify Shane
          console.log(`[FightIQ] New subscriber: ${customerEmail}`);
        }
      }
    }

    if (stripeEvent.type === 'customer.subscription.deleted') {
      const subscription = stripeEvent.data.object;
      const customerId = subscription.customer;

      await supabase.from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_customer_id', customerId);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Webhook error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
