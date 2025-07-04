# Deployment Guide

Comprehensive guide for deploying the Websyte AI Chat Widget to production.

## Prerequisites

Before deploying, ensure you have:

1. **Cloudflare Account** with Workers enabled
2. **Neon Database** provisioned
3. **API Keys** for OpenAI, Mistral AI, and Apify
4. **Domain** configured in Cloudflare (optional)
5. **Wrangler CLI** installed and authenticated

## Deployment Steps

### 1. Database Setup

Create and configure your Neon database:

```bash
# Generate database schema
pnpm db:generate

# Push schema to database
pnpm db:push

# Verify schema
pnpm db:studio
```

### 2. R2 Bucket Creation

Create the R2 bucket for file storage:

```bash
# Create bucket via dashboard or CLI
wrangler r2 bucket create websyte-ai-widget

# Verify bucket creation
wrangler r2 bucket list
```

### 3. Environment Configuration

Set all required secrets:

```bash
# Core secrets
wrangler secret put DATABASE_URL
wrangler secret put OPENAI_API_KEY
wrangler secret put MISTRAL_AI_API_KEY
wrangler secret put APIFY_API_TOKEN
wrangler secret put BETTER_AUTH_SECRET

# Optional secrets
wrangler secret put API_BEARER_TOKEN
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
```

### 4. Build and Deploy

```bash
# Install dependencies
pnpm install

# Build the application
pnpm build

# Deploy to Cloudflare
pnpm deploy
```

### 5. Post-Deployment

1. **Verify Deployment**:
   ```bash
   # Check worker status
   wrangler tail
   
   # Test health endpoint
   curl https://your-worker.workers.dev/api/health
   ```

2. **Configure Custom Domain** (optional):
   - Go to Cloudflare Dashboard > Workers & Pages
   - Select your worker
   - Add custom domain under "Routes"

3. **Set Environment Variables**:
   - Go to Worker Settings > Variables
   - Add non-secret variables:
     - `BETTER_AUTH_URL`
     - `STORE_IP_ADDRESSES`
     - `MESSAGE_RETENTION_DAYS`

## Production Configuration

### Recommended Settings

```env
# Privacy compliant defaults
STORE_IP_ADDRESSES=false
MESSAGE_RETENTION_DAYS=90

# Production URLs
BETTER_AUTH_URL=https://app.yourdomain.com

# Security
API_BEARER_TOKEN=[generated-token]
```

### Performance Optimization

1. **Enable Smart Placement**:
   ```json
   // wrangler.jsonc
   {
     "placement": { "mode": "smart" }
   }
   ```

2. **Configure Caching**:
   - Widget content cached for 5 minutes
   - Static assets cached indefinitely
   - API responses use appropriate cache headers

3. **Set Rate Limits**:
   - Anonymous: 10 requests/minute
   - Authenticated: 30 requests/minute
   - Bearer token: Unlimited

### Security Hardening

1. **CORS Configuration**:
   - Restrict origins in production
   - Update `cors()` middleware settings

2. **API Security**:
   - Enable bearer token for automation
   - Rotate secrets quarterly
   - Monitor usage patterns

3. **Database Security**:
   - Use connection pooling
   - Enable SSL/TLS
   - Restrict IP access

## Monitoring

### Cloudflare Analytics

Monitor via Cloudflare Dashboard:
- Request volume and patterns
- Error rates and types
- Performance metrics
- Geographic distribution

### Application Logs

```bash
# Real-time logs
wrangler tail

# Filter by log level
wrangler tail --format json | jq 'select(.level == "error")'

# Search specific patterns
wrangler tail | grep "widget_id="
```

### Key Metrics to Monitor

1. **API Performance**:
   - Response times
   - Error rates
   - Rate limit hits

2. **Resource Usage**:
   - R2 storage consumption
   - Database connections
   - Worker CPU time

3. **Business Metrics**:
   - Widget creation rate
   - Chat message volume
   - Active users

## Rollback Procedures

### Quick Rollback

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback [deployment-id]
```

### Database Rollback

```bash
# Generate down migration
pnpm db:generate

# Apply rollback
pnpm db:push
```

## Troubleshooting

### Common Issues

**503 Service Unavailable**
- Check worker logs for errors
- Verify all secrets are set
- Ensure database is accessible

**Authentication Errors**
- Verify BETTER_AUTH_URL matches
- Check BETTER_AUTH_SECRET is set
- Ensure cookies are enabled

**File Upload Failures**
- Check R2 bucket exists
- Verify bucket binding in wrangler.jsonc
- Monitor R2 storage limits

**Slow Response Times**
- Check database query performance
- Monitor external API latency
- Review worker CPU usage

### Debug Mode

Enable detailed logging:

```typescript
// In workers/app.ts
const DEBUG = c.env.NODE_ENV === 'development';
```

## Scaling Considerations

### Current Limits

- **Workers**: 1000 requests/second
- **R2**: 1000 requests/second per bucket
- **Database**: Based on Neon plan
- **Workflows**: 10-minute execution limit

### Scaling Strategies

1. **Horizontal Scaling**:
   - Workers auto-scale globally
   - Use Cloudflare's edge network

2. **Database Scaling**:
   - Upgrade Neon plan as needed
   - Implement connection pooling
   - Add read replicas

3. **Storage Scaling**:
   - R2 scales automatically
   - Monitor usage and costs
   - Implement lifecycle policies

## Cost Management

### Cloudflare Workers
- Free tier: 100,000 requests/day
- Paid: $5/month + $0.50/million requests

### R2 Storage
- Storage: $0.015/GB/month
- Operations: $0.36/million reads
- Bandwidth: Free

### External APIs
- OpenAI: ~$0.0001 per chat message
- Mistral: ~$0.001 per page OCR
- Apify: Based on crawler usage

### Cost Optimization
1. Cache API responses
2. Implement request throttling
3. Monitor usage patterns
4. Set spending alerts

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check API performance
- Review security alerts

**Weekly**:
- Update dependencies
- Review usage metrics
- Test backup procedures

**Monthly**:
- Rotate API keys
- Review cost reports
- Update documentation

**Quarterly**:
- Security audit
- Performance review
- Dependency updates

### Update Procedures

```bash
# Update dependencies
pnpm update

# Test changes
pnpm test:all

# Deploy updates
pnpm deploy
```

## Disaster Recovery

### Backup Strategy

1. **Database**: Neon automatic backups
2. **R2 Files**: Versioning enabled
3. **Code**: Git repository
4. **Secrets**: Secure backup storage

### Recovery Plan

1. **Service Outage**:
   - Switch to backup region
   - Enable maintenance mode
   - Communicate with users

2. **Data Loss**:
   - Restore from Neon backup
   - Recover R2 objects
   - Verify data integrity

3. **Security Breach**:
   - Rotate all secrets
   - Review access logs
   - Notify affected users