<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let step: 'form' | 'preview' = 'form';
	let isSubmitting = false;
	let generatedMessage = '';
	let errors: Record<string, string> = {};

	// Form data
	let formData = {
		senderName: '',
		senderEmail: '',
		recipientName: '',
		recipientPhone: '',
		occasion: '',
		scheduledFor: '',
		personalNote: ''
	};

	const occasions = [
		'Birthday',
		'Anniversary',
		"Valentine's Day",
		'Christmas',
		'New Year',
		'Graduation',
		"Mother's Day",
		"Father's Day",
		'Get Well Soon',
		'Congratulations',
		'Thank You',
		'Other'
	];

	function validateForm(): boolean {
		errors = {};

		if (!formData.senderName.trim()) {
			errors.senderName = 'Your name is required';
		}

		if (!formData.senderEmail.trim()) {
			errors.senderEmail = 'Email is required';
		} else if (!/^\S+@\S+$/i.test(formData.senderEmail)) {
			errors.senderEmail = 'Invalid email address';
		}

		if (!formData.recipientName.trim()) {
			errors.recipientName = 'Recipient name is required';
		}

		if (!formData.recipientPhone.trim()) {
			errors.recipientPhone = 'Phone number is required';
		}

		if (!formData.occasion) {
			errors.occasion = 'Please select an occasion';
		}

		if (!formData.scheduledFor) {
			errors.scheduledFor = 'Please select when to send the message';
		} else {
			const selectedDate = new Date(formData.scheduledFor);
			const now = new Date();
			if (selectedDate <= now) {
				errors.scheduledFor = 'Please select a future date and time';
			}
		}

		return Object.keys(errors).length === 0;
	}

	async function generateMessage() {
		if (!validateForm()) return;

		isSubmitting = true;

		try {
			const response = await fetch('/api/generate-message', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (!response.ok) {
				throw new Error('Failed to generate message');
			}

			const result = await response.json();
			generatedMessage = result.message;
			step = 'preview';
		} catch (error) {
			showToast('Failed to generate message. Please try again.', 'error');
		} finally {
			isSubmitting = false;
		}
	}

	async function proceedToPayment() {
		isSubmitting = true;

		try {
			const response = await fetch('/api/create-payment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...formData,
					generatedMessage
				})
			});

			if (!response.ok) {
				throw new Error('Failed to create payment');
			}

			const { sessionUrl } = await response.json();
			window.location.href = sessionUrl;
		} catch (error) {
			showToast('Failed to process payment. Please try again.', 'error');
			isSubmitting = false;
		}
	}

	function showToast(message: string, type: 'success' | 'error' = 'success') {
		const container = document.getElementById('toast-container');
		if (!container) return;

		const toast = document.createElement('div');
		toast.className = `toast ${type}`;
		toast.innerHTML = `<div class="toast-message">${message}</div>`;

		container.appendChild(toast);

		setTimeout(() => {
			toast.remove();
		}, 5000);
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

	function backToForm() {
		step = 'form';
	}

	// Set minimum datetime to current time
	onMount(() => {
		const now = new Date();
		now.setMinutes(now.getMinutes() + 30); // Add 30 minutes buffer
		const minDateTime = now.toISOString().slice(0, 16);
		const dateTimeInput = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
		if (dateTimeInput) {
			dateTimeInput.min = minDateTime;
		}
	});
</script>

<svelte:head>
	<title>Schedule a Message - Loved Ones</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-12">
	{#if step === 'preview'}
		<div class="card">
			<h1 class="text-2xl font-bold text-gray-900 mb-6">Preview Your Message</h1>

			<div class="space-y-6">
				<div class="bg-gray-50 rounded-lg p-4">
					<h3 class="font-semibold text-gray-900 mb-2">Message Details</h3>
					<div class="grid grid-cols-2 gap-4 text-sm">
						<div><span class="text-gray-600">To:</span> {formData.recipientName}</div>
						<div><span class="text-gray-600">Phone:</span> {formData.recipientPhone}</div>
						<div><span class="text-gray-600">Occasion:</span> {formData.occasion}</div>
						<div class="col-span-2"><span class="text-gray-600">Send on:</span> {formatDateTime(formData.scheduledFor)}</div>
					</div>
				</div>

				<div class="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
					<h3 class="font-semibold text-blue-900 mb-3">Generated Message</h3>
					<p class="text-gray-800 leading-relaxed">"{generatedMessage}"</p>
				</div>

				<div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
					<p class="text-sm text-yellow-800">
						💰 <strong>Cost:</strong> $1.00 will be charged when you confirm this message.
					</p>
				</div>

				<div class="flex space-x-4">
					<button
						on:click={backToForm}
						class="btn btn-secondary flex-1"
						disabled={isSubmitting}
					>
						← Edit Message
					</button>
					<button
						on:click={proceedToPayment}
						disabled={isSubmitting}
						class="btn btn-primary flex-1"
					>
						{isSubmitting ? 'Processing...' : 'Pay $1 & Schedule Message'}
					</button>
				</div>
			</div>
		</div>
	{:else}
		<div class="card">
			<h1 class="text-2xl font-bold text-gray-900 mb-2">Schedule a Message</h1>
			<p class="text-gray-600 mb-8">Fill out the details below and we'll create a perfect message for your loved one.</p>

			<form on:submit|preventDefault={generateMessage} class="space-y-6">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label for="senderName" class="block text-sm font-medium text-gray-700 mb-2">
							Your Name *
						</label>
						<input
							id="senderName"
							type="text"
							bind:value={formData.senderName}
							class="input"
							class:border-red-500={errors.senderName}
							placeholder="John Doe"
						/>
						{#if errors.senderName}
							<p class="mt-1 text-sm text-red-600">{errors.senderName}</p>
						{/if}
					</div>

					<div>
						<label for="senderEmail" class="block text-sm font-medium text-gray-700 mb-2">
							Your Email *
						</label>
						<input
							id="senderEmail"
							type="email"
							bind:value={formData.senderEmail}
							class="input"
							class:border-red-500={errors.senderEmail}
							placeholder="john@example.com"
						/>
						{#if errors.senderEmail}
							<p class="mt-1 text-sm text-red-600">{errors.senderEmail}</p>
						{/if}
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label for="recipientName" class="block text-sm font-medium text-gray-700 mb-2">
							Recipient's Name *
						</label>
						<input
							id="recipientName"
							type="text"
							bind:value={formData.recipientName}
							class="input"
							class:border-red-500={errors.recipientName}
							placeholder="Jane Smith"
						/>
						{#if errors.recipientName}
							<p class="mt-1 text-sm text-red-600">{errors.recipientName}</p>
						{/if}
					</div>

					<div>
						<label for="recipientPhone" class="block text-sm font-medium text-gray-700 mb-2">
							Recipient's Phone *
						</label>
						<input
							id="recipientPhone"
							type="tel"
							bind:value={formData.recipientPhone}
							class="input"
							class:border-red-500={errors.recipientPhone}
							placeholder="+1 (555) 123-4567"
						/>
						{#if errors.recipientPhone}
							<p class="mt-1 text-sm text-red-600">{errors.recipientPhone}</p>
						{/if}
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label for="occasion" class="block text-sm font-medium text-gray-700 mb-2">
							Occasion *
						</label>
						<select
							id="occasion"
							bind:value={formData.occasion}
							class="input"
							class:border-red-500={errors.occasion}
						>
							<option value="">Select an occasion...</option>
							{#each occasions as occasion}
								<option value={occasion}>{occasion}</option>
							{/each}
						</select>
						{#if errors.occasion}
							<p class="mt-1 text-sm text-red-600">{errors.occasion}</p>
						{/if}
					</div>

					<div>
						<label for="scheduledFor" class="block text-sm font-medium text-gray-700 mb-2">
							Send Date & Time *
						</label>
						<input
							id="scheduledFor"
							type="datetime-local"
							bind:value={formData.scheduledFor}
							class="input"
							class:border-red-500={errors.scheduledFor}
						/>
						{#if errors.scheduledFor}
							<p class="mt-1 text-sm text-red-600">{errors.scheduledFor}</p>
						{/if}
					</div>
				</div>

				<div>
					<label for="personalNote" class="block text-sm font-medium text-gray-700 mb-2">
						Personal Note (Optional)
					</label>
					<textarea
						id="personalNote"
						bind:value={formData.personalNote}
						rows="3"
						class="input"
						placeholder="Add any personal details or special memories you'd like included in the message..."
					></textarea>
					<p class="mt-1 text-sm text-gray-500">
						This helps our AI create a more personalized and meaningful message.
					</p>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					class="btn btn-primary w-full py-3"
				>
					{isSubmitting ? 'Generating Message...' : 'Generate Message Preview'}
				</button>
			</form>
		</div>
	{/if}
</div>
