<script lang="ts">
	import { onMount } from 'svelte';
	import { Calendar, Trash2, Send, Clock } from 'lucide-svelte';

	interface Message {
		id: string;
		recipientName: string;
		recipientPhone: string;
		occasion: string;
		generatedMessage: string;
		scheduledFor: string;
		status: string;
		createdAt: string;
		sentAt?: string;
		payment?: {
			amount: number;
			status: string;
			createdAt: string;
		};
	}

	let messages: Message[] = [];
	let loading = true;
	let error = '';
	let userEmail = '';
	let filterStatus = 'all';

	const statusColors = {
		PENDING: 'bg-yellow-100 text-yellow-800',
		PAID: 'bg-blue-100 text-blue-800',
		SCHEDULED: 'bg-purple-100 text-purple-800',
		SENT: 'bg-green-100 text-green-800',
		FAILED: 'bg-red-100 text-red-800',
		CANCELLED: 'bg-gray-100 text-gray-800'
	};

	onMount(async () => {
		// In a real app, you'd get this from authentication
		// For now, we'll prompt the user or use a stored value
		const storedEmail = localStorage.getItem('userEmail');
		if (storedEmail) {
			userEmail = storedEmail;
			await loadMessages();
		} else {
			userEmail = prompt('Enter your email to view your messages:') || '';
			if (userEmail) {
				localStorage.setItem('userEmail', userEmail);
				await loadMessages();
			}
		}
	});

	async function loadMessages() {
		if (!userEmail) return;

		loading = true;
		error = '';

		try {
			const url = new URL('/api/messages', window.location.origin);
			url.searchParams.set('email', userEmail);
			if (filterStatus !== 'all') {
				url.searchParams.set('status', filterStatus);
			}

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to load messages');
			}

			const data = await response.json();
			messages = data.messages;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load messages';
		} finally {
			loading = false;
		}
	}

	async function cancelMessage(messageId: string) {
		if (!confirm('Are you sure you want to cancel this message? This action cannot be undone.')) {
			return;
		}

		try {
			const url = new URL('/api/messages', window.location.origin);
			url.searchParams.set('messageId', messageId);
			url.searchParams.set('email', userEmail);

			const response = await fetch(url, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to cancel message');
			}

			showToast('Message cancelled successfully', 'success');
			await loadMessages();
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Failed to cancel message', 'error');
		}
	}

	async function sendMessageNow(messageId: string) {
		if (!confirm('Send this message immediately? The recipient will receive it right now.')) {
			return;
		}

		try {
			const response = await fetch('/api/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messageId,
					email: userEmail
				})
			});

			if (!response.ok) {
				throw new Error('Failed to send message');
			}

			showToast('Message sent successfully!', 'success');
			await loadMessages();
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Failed to send message', 'error');
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
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusBadgeClass(status: string): string {
		return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
	}

	function isUpcoming(scheduledFor: string): boolean {
		return new Date(scheduledFor) > new Date();
	}

	function canCancel(status: string): boolean {
		return ['PAID', 'SCHEDULED'].includes(status);
	}

	function canSendNow(status: string, scheduledFor: string): boolean {
		return status === 'PAID' && isUpcoming(scheduledFor);
	}

	$: filteredMessages = messages.filter(message => {
		if (filterStatus === 'all') return true;
		if (filterStatus === 'upcoming') return isUpcoming(message.scheduledFor) && ['PAID', 'SCHEDULED'].includes(message.status);
		if (filterStatus === 'sent') return message.status === 'SENT';
		return message.status === filterStatus;
	});

	$: totalSpent = messages.reduce((sum, msg) => sum + (msg.payment?.amount || 0), 0) / 100;
	$: upcomingCount = messages.filter(msg => isUpcoming(msg.scheduledFor) && ['PAID', 'SCHEDULED'].includes(msg.status)).length;
	$: sentCount = messages.filter(msg => msg.status === 'SENT').length;
</script>

<svelte:head>
	<title>Dashboard - Loved Ones</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<div class="flex justify-between items-center mb-8">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Your Messages</h1>
			<p class="text-gray-600 mt-1">Manage your scheduled heartfelt messages</p>
		</div>
		<a href="/schedule" class="btn btn-primary"> Schedule New Message </a>
	</div>

	{#if !userEmail}
		<div class="card text-center">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Welcome!</h2>
			<p class="text-gray-600 mb-4">Please enter your email to view your scheduled messages.</p>
			<input
				type="email"
				bind:value={userEmail}
				placeholder="Enter your email"
				class="input max-w-sm mx-auto"
				on:keypress={(e) => e.key === 'Enter' && loadMessages()}
			/>
			<button on:click={loadMessages} class="btn btn-primary ml-2"> Load Messages </button>
		</div>
	{:else if loading}
		<div class="card text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
			<p class="text-gray-600">Loading your messages...</p>
		</div>
	{:else if error}
		<div class="card text-center">
			<p class="text-red-600 mb-4">{error}</p>
			<button on:click={loadMessages} class="btn btn-primary"> Try Again </button>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<Clock class="h-8 w-8 text-blue-600" />
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">Upcoming</p>
						<p class="text-2xl font-semibold text-gray-900">{upcomingCount}</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<Send class="h-8 w-8 text-green-600" />
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">Sent</p>
						<p class="text-2xl font-semibold text-gray-900">{sentCount}</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<Calendar class="h-8 w-8 text-purple-600" />
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">Total Messages</p>
						<p class="text-2xl font-semibold text-gray-900">{messages.length}</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
							<span class="text-yellow-600 font-bold">$</span>
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">Total Spent</p>
						<p class="text-2xl font-semibold text-gray-900">${totalSpent.toFixed(2)}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Filters -->
		<div class="bg-white rounded-lg shadow p-6 mb-6">
			<div class="flex flex-wrap gap-2">
				<button
					on:click={() => {
						filterStatus = 'all';
						loadMessages();
					}}
					class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
					class:bg-primary-600={filterStatus === 'all'}
					class:text-white={filterStatus === 'all'}
					class:bg-gray-100={filterStatus !== 'all'}
					class:text-gray-700={filterStatus !== 'all'}
				>
					All Messages
				</button>
				<button
					on:click={() => {
						filterStatus = 'upcoming';
						loadMessages();
					}}
					class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
					class:bg-primary-600={filterStatus === 'upcoming'}
					class:text-white={filterStatus === 'upcoming'}
					class:bg-gray-100={filterStatus !== 'upcoming'}
					class:text-gray-700={filterStatus !== 'upcoming'}
				>
					Upcoming
				</button>
				<button
					on:click={() => {
						filterStatus = 'sent';
						loadMessages();
					}}
					class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
					class:bg-primary-600={filterStatus === 'sent'}
					class:text-white={filterStatus === 'sent'}
					class:bg-gray-100={filterStatus !== 'sent'}
					class:text-gray-700={filterStatus !== 'sent'}
				>
					Sent
				</button>
				<button
					on:click={() => {
						filterStatus = 'PAID';
						loadMessages();
					}}
					class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
					class:bg-primary-600={filterStatus === 'PAID'}
					class:text-white={filterStatus === 'PAID'}
					class:bg-gray-100={filterStatus !== 'PAID'}
					class:text-gray-700={filterStatus !== 'PAID'}
				>
					Paid
				</button>
			</div>
		</div>

		<!-- Messages List -->
		{#if filteredMessages.length === 0}
			<div class="card text-center">
				<Calendar class="h-12 w-12 text-gray-400 mx-auto mb-4" />
				<h3 class="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
				<p class="text-gray-600 mb-4">
					{#if filterStatus === 'all'}
						You haven't scheduled any messages yet.
					{:else}
						No messages match the selected filter.
					{/if}
				</p>
				<a href="/schedule" class="btn btn-primary"> Schedule Your First Message </a>
			</div>
		{:else}
			<div class="space-y-4">
				{#each filteredMessages as message}
					<div class="bg-white rounded-lg shadow p-6">
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<div class="flex items-center gap-3 mb-2">
									<h3 class="text-lg font-semibold text-gray-900">
										{message.occasion} for {message.recipientName}
									</h3>
									<span
										class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusBadgeClass(
											message.status
										)}"
									>
										{message.status}
									</span>
								</div>

								<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
									<div>
										<span class="font-medium">To:</span>
										{message.recipientPhone}
									</div>
									<div>
										<span class="font-medium">Scheduled:</span>
										{formatDateTime(message.scheduledFor)}
									</div>
									{#if message.sentAt}
										<div>
											<span class="font-medium">Sent:</span>
											{formatDateTime(message.sentAt)}
										</div>
									{/if}
									<div>
										<span class="font-medium">Created:</span>
										{formatDateTime(message.createdAt)}
									</div>
								</div>

								<div class="bg-gray-50 rounded-lg p-4 mb-4">
									<p class="text-gray-800 italic">"{message.generatedMessage}"</p>
								</div>
							</div>

							<div class="flex flex-col gap-2 ml-4">
								{#if canSendNow(message.status, message.scheduledFor)}
									<button
										on:click={() => sendMessageNow(message.id)}
										class="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
										title="Send now"
									>
										<Send class="h-4 w-4 mr-1" />
										Send Now
									</button>
								{/if}

								{#if canCancel(message.status)}
									<button
										on:click={() => cancelMessage(message.id)}
										class="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
										title="Cancel message"
									>
										<Trash2 class="h-4 w-4 mr-1" />
										Cancel
									</button>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Quick Actions -->
		<div class="mt-8 bg-primary-50 rounded-lg p-6">
			<h3 class="text-lg font-medium text-primary-900 mb-4">Quick Actions</h3>
			<div class="flex flex-wrap gap-4">
				<a href="/schedule" class="btn btn-primary"> Schedule New Message </a>
				<button on:click={loadMessages} class="btn btn-secondary"> Refresh Messages </button>
				<button
					on:click={() => {
						localStorage.removeItem('userEmail');
						userEmail = '';
						messages = [];
					}}
					class="btn btn-secondary"
				>
					Switch Account
				</button>
			</div>
		</div>
	{/if}
</div>
