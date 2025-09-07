import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { senderName, recipientName, occasion, personalNote } = await request.json();

		// Validate required fields
		if (!senderName || !recipientName || !occasion) {
			return json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// Create the prompt for GPT
		const prompt = `Create a heartfelt, personal ${occasion.toLowerCase()} message from ${senderName} to ${recipientName}.

Context:
- Occasion: ${occasion}
- From: ${senderName}
- To: ${recipientName}
${personalNote ? `- Personal note: ${personalNote}` : ''}

Requirements:
- Keep it warm, genuine, and appropriate for SMS (under 160 characters is ideal)
- Make it feel personal and heartfelt
- Include the recipient's name
- Match the tone to the occasion
- Don't include any sender signature since it will be sent as SMS

Generate a single message, no quotes or additional text:`;

		const completion = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [
				{
					role: "system",
					content: "You are a skilled writer who creates heartfelt, personal messages for special occasions. Your messages are warm, genuine, and appropriate for SMS delivery."
				},
				{
					role: "user",
					content: prompt
				}
			],
			max_tokens: 200,
			temperature: 0.8
		});

		const message = completion.choices[0]?.message?.content?.trim();

		if (!message) {
			throw new Error('Failed to generate message');
		}

		return json({ message });

	} catch (error) {
		console.error('Error generating message:', error);
		return json(
			{ error: 'Failed to generate message' },
			{ status: 500 }
		);
	}
};
