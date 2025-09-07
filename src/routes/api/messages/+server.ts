import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { messageScheduler } from '$lib/scheduler.js';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

// GET /api/messages - Get user's messages
export const GET: RequestHandler = async ({ url }) => {
	try {
		const email = url.searchParams.get('email');
		const status = url.searchParams.get('status');

		if (!email) {
			return json(
				{ error: 'Email parameter is required' },
				{ status: 400 }
			);
		}

		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email }
		});

		if (!user) {
			return json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		// Build query conditions
		const whereClause: any = {
			userId: user.id
		};

		if (status) {
			whereClause.status = status;
		}

		const messages = await prisma.message.findMany({
			where: whereClause,
			orderBy: {
				scheduledFor: 'desc'
			},
			include: {
				payment: {
					select: {
						amount: true,
						status: true,
						createdAt: true
					}
				}
			}
		});

		return json({ messages });

	} catch (error) {
		console.error('Error fetching messages:', error);
		return json(
			{ error: 'Failed to fetch messages' },
			{ status: 500 }
		);
	}
};

// DELETE /api/messages - Cancel a scheduled message
export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const messageId = url.searchParams.get('messageId');
		const email = url.searchParams.get('email');

		if (!messageId || !email) {
			return json(
				{ error: 'messageId and email parameters are required' },
				{ status: 400 }
			);
		}

		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email }
		});

		if (!user) {
			return json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		// Cancel the message
		const cancelled = await messageScheduler.cancelMessage(messageId, user.id);

		if (!cancelled) {
			return json(
				{ error: 'Message not found or cannot be cancelled' },
				{ status: 404 }
			);
		}

		return json({ success: true, message: 'Message cancelled successfully' });

	} catch (error) {
		console.error('Error cancelling message:', error);
		return json(
			{ error: 'Failed to cancel message' },
			{ status: 500 }
		);
	}
};

// POST /api/messages/send-now - Send a message immediately (for testing)
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { messageId, email } = await request.json();

		if (!messageId || !email) {
			return json(
				{ error: 'messageId and email are required' },
				{ status: 400 }
			);
		}

		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email }
		});

		if (!user) {
			return json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		// Verify the message belongs to the user
		const message = await prisma.message.findFirst({
			where: {
				id: messageId,
				userId: user.id,
				status: 'PAID'
			}
		});

		if (!message) {
			return json(
				{ error: 'Message not found or not eligible for immediate sending' },
				{ status: 404 }
			);
		}

		// Send the message now
		const success = await messageScheduler.sendMessageNow(messageId);

		if (!success) {
			return json(
				{ error: 'Failed to send message' },
				{ status: 500 }
			);
		}

		return json({ success: true, message: 'Message sent successfully' });

	} catch (error) {
		console.error('Error sending message immediately:', error);
		return json(
			{ error: 'Failed to send message' },
			{ status: 500 }
		);
	}
};
