import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';

const http = httpRouter();

// Clerk webhook handler
http.route({
  path: '/clerk-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const payload = (await request.json()) as {
      type: string;
      data: {
        id: string;
        username?: string;
        email_addresses?: Array<{ email_address: string }>;
        image_url?: string;
      };
    };

    const eventType = payload.type;
    const userData = payload.data;

    try {
      if (eventType === 'user.created' || eventType === 'user.updated') {
        const emailAddress = userData.email_addresses?.[0]?.email_address || '';
        await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: userData.id,
          username: userData.username || emailAddress.split('@')[0] || 'user',
          email: emailAddress,
          avatar: userData.image_url,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Webhook error:', error);
      return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }),
});

export default http;

