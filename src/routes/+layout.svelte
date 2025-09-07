<script>
	import '../app.css';
</script>

<svelte:head>
	<title>Loved Ones - Schedule Heartfelt Messages</title>
	<meta name="description" content="Never forget to send birthday wishes, anniversary messages, or any special occasion greetings. AI-powered personalized messages delivered at the perfect time." />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<nav class="bg-white shadow-sm border-b">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16 items-center">
				<div class="flex-shrink-0">
					<a href="/" class="text-xl font-bold text-primary-600">💝 Loved Ones</a>
				</div>
				<div class="flex space-x-4">
					<a href="/" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Home</a>
					<a href="/schedule" class="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">Schedule Message</a>
				</div>
			</div>
		</div>
	</nav>
	<main>
		<slot />
	</main>
</div>

<!-- Toast notifications container -->
<div id="toast-container" class="fixed top-4 right-4 z-50"></div>

<style>
	:global(.toast) {
		@apply bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-2 max-w-sm;
		animation: slideIn 0.3s ease-out;
	}

	:global(.toast.success) {
		@apply border-green-200 bg-green-50;
	}

	:global(.toast.error) {
		@apply border-red-200 bg-red-50;
	}

	:global(.toast.success .toast-message) {
		@apply text-green-800;
	}

	:global(.toast.error .toast-message) {
		@apply text-red-800;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
