import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
// Import will be done dynamically to avoid initialization errors
import { addMinutes, isAfter, isBefore } from 'date-fns';

const prisma = new PrismaClient();

export interface ScheduledMessage {
	id: string;
	recipientName: string;
	recipientPhone: string;
	generatedMessage: string;
	scheduledFor: Date;
	userId: string;
}

class MessageScheduler {
	private isRunning = false;

	constructor() {
		this.init();
	}

	private async init() {
		// Run every minute to check for messages to send
		cron.schedule('* * * * *', async () => {
			if (!this.isRunning) {
				await this.processScheduledMessages();
			}
		});

		console.log('Message scheduler initialized');
	}

	private async processScheduledMessages() {
		this.isRunning = true;

		try {
			const now = new Date();
			const fiveMinutesFromNow = addMinutes(now, 5);

			// Find messages that should be sent now (within a 5-minute window)
			const messagesToSend = await prisma.message.findMany({
				where: {
					status: 'PAID',
					scheduledFor: {
						gte: now,
						lte: fiveMinutesFromNow
					}
				},
				include: {
					user: true
				}
			});

			console.log(`Found ${messagesToSend.length} messages to process`);

			for (const message of messagesToSend) {
				await this.sendScheduledMessage(message);
			}

		} catch (error) {
			console.error('Error processing scheduled messages:', error);
		} finally {
			this.isRunning = false;
		}
	}

	private async sendScheduledMessage(message: any) {
		try {
			console.log(`Attempting to send message ${message.id} to ${message.recipientName}`);

			// Update status to prevent duplicate sending
			await prisma.message.update({
				where: { id: message.id },
				data: { status: 'SCHEDULED' }
			});

			// Send the SMS
			try {
				const { sendSMS } = await import('./twilio.js');
				const result = await sendSMS({
					to: message.recipientPhone,
					message: message.generatedMessage
				});

				if (result.success) {
					// Mark as sent
					await prisma.message.update({
						where: { id: message.id },
						data: {
							status: 'SENT',
							sentAt: new Date()
						}
					});

					console.log(`Message ${message.id} sent successfully to ${message.recipientName}`);

					// Send confirmation email to user (optional)
					await this.sendConfirmationEmail(message);

				} else {
					// Mark as failed
					await prisma.message.update({
						where: { id: message.id },
						data: { status: 'FAILED' }
					});

					console.error(`Failed to send message ${message.id}:`, result.error);
				}
			} catch (twilioError) {
				console.error(`Twilio service error for message ${message.id}:`, twilioError);
				// Mark as failed
				await prisma.message.update({
					where: { id: message.id },
					data: { status: 'FAILED' }
				});
			}

		} catch (error) {
			console.error(`Error sending message ${message.id}:`, error);

			// Mark as failed
			try {
				await prisma.message.update({
					where: { id: message.id },
					data: { status: 'FAILED' }
				});
			} catch (updateError) {
				console.error('Failed to update message status:', updateError);
			}
		}
	}

	private async sendConfirmationEmail(message: any) {
		// TODO: Implement email confirmation
		// This could use services like SendGrid, AWS SES, or similar
		console.log(`Would send confirmation email for message ${message.id} to ${message.user.email}`);
	}

	// Manual method to send a message immediately (for testing)
	public async sendMessageNow(messageId: string): Promise<boolean> {
		try {
			const message = await prisma.message.findUnique({
				where: { id: messageId },
				include: { user: true }
			});

			if (!message) {
				console.error('Message not found:', messageId);
				return false;
			}

			if (message.status !== 'PAID') {
				console.error('Message is not in PAID status:', messageId);
				return false;
			}

			await this.sendScheduledMessage(message);
			return true;

		} catch (error) {
			console.error('Error in sendMessageNow:', error);
			return false;
		}
	}

	// Get upcoming messages for a user
	public async getUpcomingMessages(userId: string) {
		return await prisma.message.findMany({
			where: {
				userId,
				status: {
					in: ['PAID', 'SCHEDULED']
				},
				scheduledFor: {
					gt: new Date()
				}
			},
			orderBy: {
				scheduledFor: 'asc'
			}
		});
	}

	// Cancel a scheduled message
	public async cancelMessage(messageId: string, userId: string): Promise<boolean> {
		try {
			const message = await prisma.message.findFirst({
				where: {
					id: messageId,
					userId,
					status: {
						in: ['PAID', 'SCHEDULED']
					}
				}
			});

			if (!message) {
				return false;
			}

			await prisma.message.update({
				where: { id: messageId },
				data: { status: 'CANCELLED' }
			});

			return true;

		} catch (error) {
			console.error('Error cancelling message:', error);
			return false;
		}
	}

	// Get message statistics
	public async getMessageStats() {
		const stats = await prisma.message.groupBy({
			by: ['status'],
			_count: {
				status: true
			}
		});

		return stats.reduce((acc, stat) => {
			acc[stat.status] = stat._count.status;
			return acc;
		}, {} as Record<string, number>);
	}
}

// Export singleton instance
export const messageScheduler = new MessageScheduler();

// Utility functions
export function isMessageDue(scheduledFor: Date, bufferMinutes = 2): boolean {
	const now = new Date();
	const dueTime = new Date(scheduledFor);
	const bufferTime = addMinutes(dueTime, -bufferMinutes);

	return isAfter(now, bufferTime) && isBefore(now, addMinutes(dueTime, bufferMinutes));
}

export function getNextScheduledMessages(limit = 10) {
	return prisma.message.findMany({
		where: {
			status: 'PAID',
			scheduledFor: {
				gt: new Date()
			}
		},
		orderBy: {
			scheduledFor: 'asc'
		},
		take: limit,
		include: {
			user: {
				select: {
					email: true,
					name: true
				}
			}
		}
	});
}
