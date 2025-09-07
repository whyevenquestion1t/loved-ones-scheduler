# Loved Ones - Scheduled Message Service

A SvelteKit application that allows users to schedule heartfelt, AI-generated messages for special occasions. Never miss a birthday, anniversary, or important moment again!

## Features

- 🤖 **AI-Powered Messages**: Uses OpenAI GPT to generate personalized, heartfelt messages
- 📅 **Smart Scheduling**: Schedule messages months or years in advance
- 💰 **Simple Pricing**: Just $1 per message, no subscriptions
- 📱 **SMS Delivery**: Messages delivered via Twilio SMS
- 💳 **Secure Payments**: Stripe integration for safe payment processing
- 📊 **User Dashboard**: Track and manage all scheduled messages
- ⏰ **Automatic Delivery**: Cron-based scheduler ensures perfect timing

## Tech Stack

- **Frontend**: SvelteKit + TypeScript + Tailwind CSS
- **Backend**: SvelteKit API routes
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-3.5-turbo
- **SMS**: Twilio
- **Payments**: Stripe
- **Scheduling**: node-cron

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Twilio account
- Stripe account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/loved_ones_db"

# OpenAI API Key
OPENAI_API_KEY="sk-..."

# Twilio Credentials
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"

# Stripe Keys
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# App URL
PUBLIC_APP_URL="http://localhost:5173"
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd loved-ones
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Or run migrations (for production)
   npm run db:migrate
   ```

4. **Set up Stripe webhook**
   - In your Stripe dashboard, create a webhook endpoint pointing to `https://yourdomain.com/api/webhook/stripe`
   - Select these events: `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy the webhook secret to your `.env` file

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Usage

### For Users

1. **Schedule a Message**
   - Visit `/schedule`
   - Fill out the form with recipient details and occasion
   - Preview the AI-generated message
   - Pay $1 to schedule the message

2. **Manage Messages**
   - Visit `/dashboard`
   - View all your scheduled messages
   - Cancel upcoming messages
   - Send messages immediately (for testing)

### API Endpoints

- `POST /api/generate-message` - Generate AI message
- `POST /api/create-payment` - Create Stripe checkout session
- `POST /api/webhook/stripe` - Handle Stripe webhooks
- `GET /api/payment-success` - Get payment details
- `GET /api/messages` - Get user messages
- `DELETE /api/messages` - Cancel a message
- `POST /api/messages` - Send message immediately

## How It Works

1. **Message Creation**
   - User fills out form with occasion details
   - OpenAI generates personalized message
   - User reviews and approves message

2. **Payment Processing**
   - Stripe handles $1 payment
   - Webhook creates database records
   - Message status updated to 'PAID'

3. **Message Scheduling**
   - Cron job runs every minute
   - Checks for messages due within 5-minute window
   - Sends SMS via Twilio
   - Updates message status to 'SENT'

## Database Schema

### Users
- `id` - Unique identifier
- `email` - User email address
- `name` - User's name
- `createdAt` - Account creation date

### Messages
- `id` - Unique identifier
- `userId` - Reference to user
- `recipientName` - Message recipient
- `recipientPhone` - Recipient phone number
- `occasion` - Type of occasion
- `personalNote` - Optional personal details
- `generatedMessage` - AI-generated message text
- `scheduledFor` - When to send message
- `status` - Current message status
- `paymentId` - Reference to payment

### Payments
- `id` - Unique identifier
- `userId` - Reference to user
- `stripePaymentId` - Stripe session/payment ID
- `amount` - Payment amount in cents
- `status` - Payment status

## Deployment

### Environment Setup
1. Set up production environment variables
2. Configure production database
3. Set up Stripe webhook with production URL
4. Configure Twilio phone number

### Build and Deploy
```bash
# Build the application
npm run build

# Start production server
npm run preview
```

### Recommended Platforms
- **Vercel** - Easy SvelteKit deployment
- **Railway** - Includes database hosting
- **DigitalOcean** - Full control with App Platform
- **Heroku** - Traditional platform option

## Monitoring

The application logs important events:
- Message scheduling
- SMS sending attempts
- Payment processing
- Webhook events
- Errors and failures

Consider adding:
- Error tracking (Sentry)
- Application monitoring (DataDog, New Relic)
- Database monitoring
- SMS delivery reports

## Security Considerations

- ✅ Stripe webhook signature verification
- ✅ Environment variable protection
- ✅ Input validation and sanitization
- ⚠️ **TODO**: User authentication (currently uses email-based access)
- ⚠️ **TODO**: Rate limiting for API endpoints
- ⚠️ **TODO**: Phone number validation and formatting

## Scaling Considerations

For high volume usage, consider:

1. **Database Optimization**
   - Add indexes for frequent queries
   - Consider read replicas
   - Implement connection pooling

2. **Message Queue**
   - Replace cron with Redis/Bull queue
   - Implement retry logic for failed messages
   - Add message priority handling

3. **Caching**
   - Cache AI responses for similar requests
   - Implement Redis for session storage

4. **Load Balancing**
   - Multiple server instances
   - Database connection pooling
   - CDN for static assets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support or questions:
- Email: support@loved-ones.app
- Issues: GitHub Issues page

## Roadmap

- [ ] User authentication system
- [ ] Email notifications
- [ ] Recurring message templates
- [ ] Multiple recipients per message
- [ ] Message editing after scheduling
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] WhatsApp integration
- [ ] Voice message support
- [ ] Multi-language support

---

Built with ❤️ using SvelteKit