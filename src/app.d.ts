// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

declare module '$env/static/private' {
	export const DATABASE_URL: string;
	export const OPENAI_API_KEY: string;
	export const TWILIO_ACCOUNT_SID: string;
	export const TWILIO_AUTH_TOKEN: string;
	export const TWILIO_PHONE_NUMBER: string;
	export const STRIPE_SECRET_KEY: string;
	export const STRIPE_WEBHOOK_SECRET: string;
	export const PUBLIC_APP_URL: string;
}

declare module '$env/static/public' {
	export const PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
}

export {};
