import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { STRIPE_SECRET_KEY, PUBLIC_APP_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2023-10-16'
});

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request }) => {
	try {
		const {
			senderName,
			senderEmail,
			recipientName,
			recipientPhone,
			occasion,
			scheduledFor,
			personalNote,
			generatedMessage
		} = await request.json();

		// Validate required fields
		if (!senderEmail || !recipientName || !recipientPhone || !occasion || !scheduledFor || !generatedMessage) {
			return json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// Create or find user
		const user = await prisma.user.upsert({
			where: { email: senderEmail },
			update: { name: senderName },
			create: { email: senderEmail, name: senderName }
		});

		// Create Stripe checkout session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: `Scheduled Message - ${occasion}`,
							description: `Message to ${recipientName} scheduled for ${new Date(scheduledFor).toLocaleDateString()}`
						},
						unit_amount: 100 // $1.00 in cents
					},
					quantity: 1
				}
			],
			mode: 'payment',
			success_url: `${PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${PUBLIC_APP_URL}/schedule`,
			customer_email: senderEmail,
			metadata: {
				userId: user.id,
				recipientName,
				recipientPhone,
				occasion,
				scheduledFor,
				personalNote: personalNote || '',
				generatedMessage
			}
		});

		return json({ sessionUrl: session.url });

	} catch (error) {
		console.error('Error creating payment:', error);
		return json(
			{ error: 'Failed to create payment session' },
			{ status: 500 }
		);
	}
};
