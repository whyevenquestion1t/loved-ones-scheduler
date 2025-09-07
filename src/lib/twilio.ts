import twilio from 'twilio';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } from '$env/static/private';

let client: any = null;

function getTwilioClient() {
	if (!client) {
		if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
			throw new Error('Twilio credentials not configured');
		}
		client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
	}
	return client;
}

export interface SendMessageOptions {
	to: string;
	message: string;
}

export interface SendMessageResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

export async function sendSMS({ to, message }: SendMessageOptions): Promise<SendMessageResult> {
	try {
		if (!TWILIO_PHONE_NUMBER) {
			throw new Error('Twilio phone number not configured');
		}

		// Clean and format phone number
		const cleanPhoneNumber = to.replace(/\D/g, '');
		const formattedPhoneNumber = cleanPhoneNumber.startsWith('1')
			? `+${cleanPhoneNumber}`
			: `+1${cleanPhoneNumber}`;

		console.log(`Sending SMS to ${formattedPhoneNumber}: "${message}"`);

		const twilioClient = getTwilioClient();
		const result = await twilioClient.messages.create({
			body: message,
			from: TWILIO_PHONE_NUMBER,
			to: formattedPhoneNumber
		});

		console.log(`SMS sent successfully. Message ID: ${result.sid}`);

		return {
			success: true,
			messageId: result.sid
		};

	} catch (error) {
		console.error('Failed to send SMS:', error);

		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		return {
			success: false,
			error: errorMessage
		};
	}
}

export function formatPhoneNumber(phone: string): string {
	// Remove all non-digits
	const digits = phone.replace(/\D/g, '');

	// Add country code if not present
	if (digits.length === 10) {
		return `+1${digits}`;
	} else if (digits.length === 11 && digits.startsWith('1')) {
		return `+${digits}`;
	}

	// Return as-is if already formatted or invalid
	return phone.startsWith('+') ? phone : `+${digits}`;
}

export function validatePhoneNumber(phone: string): boolean {
	const digits = phone.replace(/\D/g, '');

	// US phone numbers: 10 digits or 11 digits starting with 1
	return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}
