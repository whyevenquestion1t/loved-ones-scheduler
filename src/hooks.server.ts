import type { Handle } from '@sveltejs/kit';

// Note: Message scheduler will be initialized when first API call is made
console.log('Server hooks initialized...');

export const handle: Handle = async ({ event, resolve }) => {
	// You can add authentication logic here in the future
	// For now, just pass through all requests

	const response = await resolve(event);
	return response;
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
	console.log('Received SIGTERM, shutting down gracefully...');
	process.exit(0);
});

process.on('SIGINT', () => {
	console.log('Received SIGINT, shutting down gracefully...');
	process.exit(0);
});
