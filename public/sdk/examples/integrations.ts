/**
 * Example: External Service Integrations
 * 
 * Connect to external services like Stripe, Twilio, Shopify, n8n, 
 * and custom webhooks through the integration bus.
 * 
 * BYOK: You provide your own service credentials.
 */

import { SubstrateClient } from '../substrate-client';

const substrate = new SubstrateClient({
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!,
  developerId: process.env.DEVELOPER_ID!,
  appId: process.env.APP_ID!
});

/**
 * Connect Stripe for payments
 */
async function connectStripe() {
  const stripe = await substrate.integrations.connect({
    name: 'Production Stripe',
    integration_type: 'stripe',
    config: { 
      mode: 'live',
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET
    },
    credentials: { 
      api_key: process.env.STRIPE_SECRET_KEY! 
    }
  });

  console.log('✓ Stripe connected:', stripe.data?.id);
  return stripe.data?.id;
}

/**
 * Use Stripe to create a customer and charge
 */
async function stripeExample(integrationId: string) {
  // Create a customer
  const customer = await substrate.integrations.call(
    integrationId,
    'customers.create',
    { email: 'user@example.com', name: 'Test User' }
  );
  console.log('Customer created:', customer.data?.id);

  // Create a payment intent
  const payment = await substrate.integrations.call(
    integrationId,
    'paymentIntents.create',
    { 
      amount: 2000, // $20.00
      currency: 'usd',
      customer: customer.data?.id
    }
  );
  console.log('Payment intent:', payment.data?.client_secret);

  return { customer: customer.data, payment: payment.data };
}

/**
 * Connect Twilio for SMS
 */
async function connectTwilio() {
  const twilio = await substrate.integrations.connect({
    name: 'Twilio SMS',
    integration_type: 'twilio',
    config: { 
      from_number: process.env.TWILIO_PHONE_NUMBER 
    },
    credentials: {
      account_sid: process.env.TWILIO_ACCOUNT_SID!,
      auth_token: process.env.TWILIO_AUTH_TOKEN!
    }
  });

  console.log('✓ Twilio connected:', twilio.data?.id);
  return twilio.data?.id;
}

/**
 * Send SMS via Twilio
 */
async function sendSms(integrationId: string, to: string, message: string) {
  const sms = await substrate.integrations.call(
    integrationId,
    'messages.create',
    { to, body: message }
  );
  console.log('SMS sent:', sms.data?.sid);
  return sms.data;
}

/**
 * Connect n8n for workflow automation
 */
async function connectN8n() {
  const n8n = await substrate.integrations.connect({
    name: 'n8n Workflows',
    integration_type: 'n8n',
    config: { 
      base_url: process.env.N8N_URL 
    },
    credentials: {
      api_key: process.env.N8N_API_KEY!
    }
  });

  console.log('✓ n8n connected:', n8n.data?.id);
  return n8n.data?.id;
}

/**
 * Trigger n8n workflow
 */
async function triggerWorkflow(integrationId: string, workflowId: string, data: any) {
  const result = await substrate.integrations.call(
    integrationId,
    'workflow.execute',
    { workflow_id: workflowId, data }
  );
  console.log('Workflow executed:', result.data);
  return result.data;
}

/**
 * Connect custom webhook
 */
async function connectWebhook() {
  const webhook = await substrate.integrations.connect({
    name: 'My Custom API',
    integration_type: 'webhook',
    config: { 
      endpoint_url: 'https://api.myservice.com/webhook',
      method: 'POST',
      headers: { 'X-Custom-Header': 'value' }
    },
    credentials: {
      api_key: process.env.MY_API_KEY!
    }
  });

  console.log('✓ Webhook connected:', webhook.data?.id);
  return webhook.data?.id;
}

/**
 * Process incoming webhook
 */
async function handleIncomingWebhook(integrationId: string, payload: any) {
  // Validate and process webhook
  const result = await substrate.integrations.webhook(integrationId, payload);
  
  // Learn from webhook data
  await substrate.brain.learn(
    JSON.stringify(payload),
    `webhook:${payload.event_type || 'unknown'}`
  );
  
  console.log('Webhook processed:', result.data);
  return result.data;
}

/**
 * List all integrations
 */
async function listIntegrations() {
  const all = await substrate.integrations.list();
  console.log('All integrations:', all.data?.integrations?.map(i => ({
    name: i.name,
    type: i.integration_type,
    active: i.is_active
  })));

  // Filter by type
  const webhooks = await substrate.integrations.list({ type: 'webhook' });
  console.log('Webhooks:', webhooks.data?.integrations?.length);

  return all.data;
}

/**
 * Disconnect integration
 */
async function disconnectIntegration(integrationId: string) {
  await substrate.integrations.disconnect(integrationId);
  console.log('✓ Integration disconnected');
}

// Main
async function main() {
  console.log('=== External Integrations Example ===\n');

  // Connect services
  const stripeId = await connectStripe();
  const twilioId = await connectTwilio();
  const webhookId = await connectWebhook();

  // Use Stripe
  if (stripeId) {
    await stripeExample(stripeId);
  }

  // Send SMS
  if (twilioId) {
    await sendSms(twilioId, '+1234567890', 'Hello from Substrate!');
  }

  // List all integrations
  await listIntegrations();
}

main().catch(console.error);

export { 
  connectStripe, 
  stripeExample, 
  connectTwilio, 
  sendSms, 
  connectN8n, 
  triggerWorkflow,
  connectWebhook,
  handleIncomingWebhook,
  listIntegrations,
  disconnectIntegration
};
