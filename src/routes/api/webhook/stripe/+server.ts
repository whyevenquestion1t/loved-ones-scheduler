import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import type { RequestHandler } from './$types';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2023-10-16'
});

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		return json(
			{ error: 'Missing stripe signature' },
			{ status: 400 }
		);
	}

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
	} catch (error) {
		console.error('Webhook signature verification failed:', error);
		return json(
			{ error: 'Invalid signature' },
			{ status: 400 }
		);
	}

	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session;

				if (session.payment_status === 'paid') {
					const metadata = session.metadata!;

					// Create payment record
					const payment = await prisma.payment.create({
						data: {
							userId: metadata.userId,
							stripePaymentId: session.id,
							amount: 100, // $1.00 in cents
							status: 'COMPLETED'
						}
					});

					// Create message record
					const message = await prisma.message.create({
						data: {
							userId: metadata.userId,
							recipientName: metadata.recipientName,
							recipientPhone: metadata.recipientPhone,
							occasion: metadata.occasion,
							personalNote: metadata.personalNote || null,
							generatedMessage: metadata.generatedMessage,
							scheduledFor: new Date(metadata.scheduledFor),
							status: 'PAID',
							paymentId: payment.id
						}
					});

					console.log('Message scheduled successfully:', message.id);
				}
				break;
			}

			case 'payment_intent.payment_failed': {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;

				// Update payment status to failed
				await prisma.payment.updateMany({
					where: { stripePaymentId: paymentIntent.id },
					data: { status: 'FAILED' }
				});

				// Update related messages
				await prisma.message.updateMany({
					where: {
						payment: {
							stripePaymentId: paymentIntent.id
						}
					},
					data: { status: 'FAILED' }
				});

				console.log('Payment failed:', paymentIntent.id);
				break;
			}

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return json({ received: true });

	} catch (error) {
		console.error('Error processing webhook:', error);
		return json(
			{ error: 'Webhook processing failed' },
			{ status: 500 }
		);
	}
};
