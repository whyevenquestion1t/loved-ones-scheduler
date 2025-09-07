import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2023-10-16'
});

export const GET: RequestHandler = async ({ url }) => {
	try {
		const sessionId = url.searchParams.get('session_id');

		if (!sessionId) {
			return json(
				{ error: 'Missing session_id parameter' },
				{ status: 400 }
			);
		}

		// Retrieve the checkout session from Stripe
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (!session.metadata) {
			return json(
				{ error: 'No metadata found for this session' },
				{ status: 404 }
			);
		}

		// Extract message details from metadata
		const messageDetails = {
			recipientName: session.metadata.recipientName,
			occasion: session.metadata.occasion,
			scheduledFor: session.metadata.scheduledFor,
			generatedMessage: session.metadata.generatedMessage
		};

		return json(messageDetails);

	} catch (error) {
		console.error('Error fetching payment success details:', error);
		return json(
			{ error: 'Failed to fetch payment details' },
			{ status: 500 }
		);
	}
};
