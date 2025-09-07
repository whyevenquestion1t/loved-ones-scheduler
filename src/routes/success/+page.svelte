<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { CheckCircle, Calendar, User, Phone } from 'lucide-svelte';

	interface MessageDetails {
		recipientName: string;
		occasion: string;
		scheduledFor: string;
		generatedMessage: string;
	}

	let messageDetails: MessageDetails | null = null;
	let loading = true;

	onMount(async () => {
		const sessionId = $page.url.searchParams.get('session_id');
		if (sessionId) {
			await fetchMessageDetails(sessionId);
		}
		loading = false;
	});

	async function fetchMessageDetails(sessionId: string) {
		try {
			const response = await fetch(`/api/payment-success?session_id=${sessionId}`);
			if (response.ok) {
				messageDetails = await response.json();
			}
		} catch (error) {
			console.error('Failed to fetch message details:', error);
		}
	}

	function formatDateTime(dateTimeString: string): string {
		return new Date(dateTimeString).toLocaleString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Payment Successful - Loved Ones</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-12">
	{#if loading}
		<div class="card text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
			<p class="text-gray-600">Loading your message details...</p>
		</div>
	{:else}
		<div class="card">
			<!-- Success Header -->
			<div class="text-center mb-8">
				<div
					class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
				>
					<CheckCircle class="w-10 h-10 text-green-600" />
				</div>
				<h1 class="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
				<p class="text-gray-600 text-lg">
					Your message has been scheduled and will be delivered at the perfect time.
				</p>
			</div>

			<!-- Message Details -->
			{#if messageDetails}
				<div class="space-y-6">
					<div class="bg-gray-50 rounded-lg p-6">
						<h3 class="font-semibold text-gray-900 mb-4 flex items-center">
							<Calendar class="w-5 h-5 mr-2" />
							Schedule Details
						</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div class="flex items-center">
								<User class="w-4 h-4 mr-2 text-gray-500" />
								<span class="text-gray-600">Recipient:</span>
								<span class="ml-1 font-medium">{messageDetails.recipientName}</span>
							</div>
							<div class="flex items-center">
								<Calendar class="w-4 h-4 mr-2 text-gray-500" />
								<span class="text-gray-600">Occasion:</span>
								<span class="ml-1 font-medium">{messageDetails.occasion}</span>
							</div>
							<div class="flex items-center md:col-span-2">
								<Calendar class="w-4 h-4 mr-2 text-gray-500" />
								<span class="text-gray-600">Scheduled for:</span>
								<span class="ml-1 font-medium">{formatDateTime(messageDetails.scheduledFor)}</span>
							</div>
						</div>
					</div>

					<div class="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
						<h3 class="font-semibold text-blue-900 mb-3">Your Message</h3>
						<p class="text-gray-800 leading-relaxed italic">
							"{messageDetails.generatedMessage}"
						</p>
					</div>

					<div class="bg-green-50 rounded-lg p-4 border border-green-200">
						<div class="flex items-start">
							<CheckCircle class="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
							<div>
								<p class="text-sm font-medium text-green-800 mb-1">What happens next?</p>
								<ul class="text-sm text-green-700 space-y-1">
									<li>• Your message is now scheduled in our system</li>
									<li>• We'll send it via SMS at exactly the right time</li>
									<li>• You'll receive an email confirmation when it's delivered</li>
								</ul>
							</div>
						</div>
					</div>

					<div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
						<p class="text-sm text-yellow-800">
							<strong>Receipt:</strong> A payment confirmation email has been sent to your email address.
							Your card was charged $1.00 for this scheduled message.
						</p>
					</div>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="mt-8 flex flex-col sm:flex-row gap-4">
				<a href="/schedule" class="btn btn-primary flex-1 text-center py-3 font-medium">
					Schedule Another Message
				</a>
				<a href="/" class="btn btn-secondary flex-1 text-center py-3 font-medium"> Back to Home </a>
			</div>

			<!-- Support Info -->
			<div class="mt-8 pt-6 border-t border-gray-200 text-center">
				<p class="text-sm text-gray-500">Need help or want to modify your scheduled message?</p>
				<p class="text-sm text-gray-500 mt-1">
					Contact us at <a
						href="mailto:support@loved-ones.app"
						class="text-primary-600 hover:underline">support@loved-ones.app</a
					>
				</p>
			</div>
		</div>
	{/if}
</div>
