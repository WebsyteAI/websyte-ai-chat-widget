# Stripe Payment Integration Plan

## Overview
This document outlines the implementation strategy for integrating Stripe payments into the Websyte AI Chat Widget platform using a hybrid subscription + usage-based pricing model.

## Pricing Strategy

### Recommended Model: Hybrid Subscription + Usage-Based Pricing

**Why this model:**
- Variable costs from OpenAI API calls (GPT-4.1-mini + embeddings)
- Usage varies significantly between customers
- Provides predictable base revenue + fair usage-based scaling

### Pricing Tiers

#### 1. Free Tier
- 1 widget
- 100 messages/month
- Basic features
- "Powered by" branding required

#### 2. Starter - $19/month
- 3 widgets
- 1,000 messages/month included
- $0.02 per additional message
- Remove branding
- Basic analytics

#### 3. Pro - $49/month
- 10 widgets
- 5,000 messages/month included
- $0.015 per additional message
- Advanced analytics
- Priority support
- Custom branding

#### 4. Business - $149/month
- Unlimited widgets
- 20,000 messages/month included
- $0.01 per additional message
- API access
- White-label option
- Dedicated support

## Implementation Phases

### Phase 1: Database & Schema Setup (Week 1)

1. **Add subscription tracking tables:**
   ```sql
   -- Subscription table
   subscription (
     id,
     user_id,
     stripe_customer_id,
     stripe_subscription_id,
     stripe_price_id,
     tier,
     status,
     current_period_start,
     current_period_end,
     cancel_at,
     canceled_at,
     created_at,
     updated_at
   )
   
   -- Usage tracking table
   usage_tracking (
     id,
     user_id,
     widget_id,
     message_count,
     period_start,
     period_end,
     reported_to_stripe,
     created_at
   )
   
   -- Billing events table
   billing_events (
     id,
     user_id,
     stripe_event_id,
     event_type,
     data,
     processed_at,
     created_at
   )
   ```

2. **Update user table:**
   - Add tier limits
   - Add subscription status
   - Add spending limits

3. **Create migration scripts**

### Phase 2: Stripe Integration (Week 1-2)

1. **Stripe Setup:**
   - Create Stripe account
   - Configure API keys in environment variables
   - Set up webhook endpoint

2. **Create Products and Prices:**
   ```javascript
   // Products
   - Starter Subscription
   - Pro Subscription
   - Business Subscription
   
   // Prices (recurring + metered)
   - starter_monthly: $19/month
   - starter_usage: $0.02 per message
   - pro_monthly: $49/month
   - pro_usage: $0.015 per message
   - business_monthly: $149/month
   - business_usage: $0.01 per message
   ```

3. **Implement Core Features:**
   - Stripe Checkout integration
   - Customer portal for self-service
   - Webhook handlers for events
   - Subscription management service

### Phase 3: Usage Tracking (Week 2)

1. **Message Counting:**
   - Add middleware to count messages
   - Track usage per widget
   - Aggregate by user and billing period

2. **Stripe Usage Reporting:**
   - Implement usage records API
   - Daily usage reporting cron job
   - Handle failed reports and retries

3. **User Dashboard:**
   - Real-time usage display
   - Usage history charts
   - Billing cycle progress

### Phase 4: Access Control (Week 3)

1. **Tier Enforcement:**
   - Widget limit checking
   - Message quota enforcement
   - Feature gating by tier

2. **User Experience:**
   - Upgrade prompts at limits
   - Grace period handling
   - Clear error messages

3. **Billing Alerts:**
   - Email notifications at 80% usage
   - In-app warnings
   - Spending limit notifications

### Phase 5: Admin & Analytics (Week 3-4)

1. **Admin Dashboard:**
   - User subscription overview
   - Revenue metrics
   - Usage analytics
   - Failed payment handling

2. **Reporting:**
   - MRR/ARR tracking
   - Churn analysis
   - Usage patterns
   - Cost analysis

3. **Advanced Features (Optional):**
   - Team/organization support
   - Volume discounts
   - Custom pricing
   - Invoice customization

## Technical Implementation Details

### API Endpoints

```typescript
// Subscription endpoints
POST   /api/billing/checkout-session
GET    /api/billing/subscription
POST   /api/billing/portal-session
DELETE /api/billing/subscription

// Usage endpoints
GET    /api/billing/usage
GET    /api/billing/usage/history
POST   /api/billing/usage/report

// Webhook endpoint
POST   /api/stripe/webhook
```

### Key Stripe Features to Use

1. **Stripe Checkout** - Pre-built payment flow
2. **Customer Portal** - Self-service subscription management
3. **Usage Records API** - Track metered billing
4. **Webhooks** - Real-time updates
5. **Stripe Billing** - Automated invoicing
6. **Payment Links** - Quick upgrade CTAs

### Security Considerations

1. **Webhook Verification:**
   - Validate Stripe signature
   - Implement idempotency
   - Handle replay attacks

2. **API Security:**
   - Rate limiting
   - Authentication required
   - Audit logging

3. **Data Protection:**
   - No credit card storage
   - Minimal PII storage
   - GDPR compliance

## Cost Analysis

### Stripe Fees
- 2.9% + $0.30 per successful transaction
- No monthly fees for standard features
- Additional fees for advanced features (optional)

### Margin Calculation
- OpenAI costs: ~$0.005-0.008 per message
- Target margin: 60-70%
- Break-even: ~20-30 paying customers

### Cost Optimization
1. Cache embeddings (already implemented)
2. Implement rate limiting
3. Smart context windowing
4. Batch API operations

## Migration Strategy

### For Existing Users
1. Grandfather current users to starter tier
2. 30-day grace period
3. Clear communication campaign
4. Migration assistance

### Launch Plan
1. Beta test with small group
2. Soft launch with early adopters
3. Full launch with marketing push
4. Monitor and iterate

## Success Metrics

### Key Performance Indicators
- Conversion rate: Free to Paid
- Average Revenue Per User (ARPU)
- Monthly Recurring Revenue (MRR)
- Churn rate
- Customer Lifetime Value (CLV)

### Target Metrics (First 6 months)
- 100+ paying customers
- <5% monthly churn
- $5,000+ MRR
- 70%+ gross margin

## Monitoring & Support

### Technical Monitoring
- Payment success rate
- Webhook delivery rate
- Usage reporting accuracy
- API response times

### Customer Support
- Billing FAQ documentation
- In-app help center
- Email support for billing issues
- Dedicated support for Business tier

## Next Steps

1. Review and approve pricing strategy
2. Create Stripe account and configure products
3. Begin Phase 1 implementation
4. Set up monitoring and alerting
5. Plan beta testing group

---

*Last Updated: [Current Date]*
*Status: Planning Phase*