<script>
	import { Heart, Clock, Sparkles, CreditCard } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Loved Ones - Never Miss a Special Moment Again</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<!-- Hero Section -->
	<div class="text-center mb-16">
		<h1 class="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-6">
			Never Miss a Special
			<span class="text-primary-600 block">Moment Again</span>
		</h1>
		<p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
			Schedule heartfelt, AI-generated messages for birthdays, anniversaries, holidays, and any
			special occasion. Just $1 per message, delivered exactly when you want.
		</p>
		<a
			href="/schedule"
			class="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
		>
			Schedule Your First Message
		</a>
	</div>

	<!-- Features Section -->
	<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
		<div class="text-center">
			<div
				class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4"
			>
				<Sparkles class="w-6 h-6 text-primary-600" />
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">AI-Powered Messages</h3>
			<p class="text-gray-600">
				Our AI crafts personalized, heartfelt messages based on the occasion and your personal
				touch.
			</p>
		</div>

		<div class="text-center">
			<div
				class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4"
			>
				<Clock class="w-6 h-6 text-primary-600" />
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">Perfect Timing</h3>
			<p class="text-gray-600">
				Schedule messages months or years in advance. We'll deliver them at exactly the right
				moment.
			</p>
		</div>

		<div class="text-center">
			<div
				class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4"
			>
				<Heart class="w-6 h-6 text-primary-600" />
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">Show You Care</h3>
			<p class="text-gray-600">
				Never forget important dates again. Your loved ones will feel remembered and cherished.
			</p>
		</div>

		<div class="text-center">
			<div
				class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4"
			>
				<CreditCard class="w-6 h-6 text-primary-600" />
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">Simple Pricing</h3>
			<p class="text-gray-600">
				Just $1 per message. No subscriptions, no hidden fees. Pay only for what you send.
			</p>
		</div>
	</div>

	<!-- How It Works -->
	<div class="bg-white rounded-2xl shadow-lg p-8 mb-16">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-8">How It Works</h2>
		<div class="grid md:grid-cols-3 gap-8">
			<div class="text-center">
				<div
					class="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold"
				>
					1
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Fill Out the Form</h3>
				<p class="text-gray-600">
					Tell us about the recipient, occasion, and when to send the message.
				</p>
			</div>
			<div class="text-center">
				<div
					class="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold"
				>
					2
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">AI Creates Magic</h3>
				<p class="text-gray-600">
					Our AI generates a personalized, heartfelt message just for your loved one.
				</p>
			</div>
			<div class="text-center">
				<div
					class="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold"
				>
					3
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Perfect Delivery</h3>
				<p class="text-gray-600">
					We send the message via SMS at exactly the right time. It's that simple!
				</p>
			</div>
		</div>
	</div>

	<!-- Testimonials -->
	<div class="mb-16">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-8">What Our Users Say</h2>
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			<div class="bg-white rounded-lg shadow p-6">
				<p class="text-gray-600 mb-4 italic">
					"I never forgot my mom's birthday again! The AI message was so personal and touching."
				</p>
				<p class="font-semibold text-gray-900">- Sarah M.</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<p class="text-gray-600 mb-4 italic">
					"Perfect for busy people like me. Set it and forget it - the messages are always on time!"
				</p>
				<p class="font-semibold text-gray-900">- Mike R.</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<p class="text-gray-600 mb-4 italic">
					"The AI writes better anniversary messages than I do. My wife was so surprised and happy!"
				</p>
				<p class="font-semibold text-gray-900">- David L.</p>
			</div>
		</div>
	</div>

	<!-- CTA Section -->
	<div class="bg-primary-600 rounded-2xl shadow-lg p-8 text-center text-white">
		<h2 class="text-3xl font-bold mb-4">Ready to Make Someone's Day?</h2>
		<p class="text-xl text-primary-100 mb-6">
			Start scheduling heartfelt messages and never miss another special moment.
		</p>
		<a
			href="/schedule"
			class="inline-flex items-center px-8 py-4 border border-primary-500 text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 transition-colors duration-200"
		>
			Get Started for Just $1
		</a>
	</div>
</div>
