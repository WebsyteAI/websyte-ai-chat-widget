# Environment Variables Reference

Complete reference for all environment variables used in the Websyte AI Chat Widget application.

## Required Variables

These variables must be set for the application to function properly.

### Core API Keys

#### `OPENAI_API_KEY`
- **Description**: OpenAI API key for chat and embeddings
- **Required**: Yes
- **Services Used**: 
  - GPT-4o-mini for chat responses
  - text-embedding-3-small for vector search
- **Example**: `sk-proj-...`
- **Security**: Store as Cloudflare secret in production

#### `MISTRAL_AI_API_KEY`
- **Description**: Mistral AI API key for OCR processing
- **Required**: Yes
- **Services Used**: 
  - mistral-ocr-latest for document text extraction
- **Example**: `...`
- **Security**: Store as Cloudflare secret in production

### Database

#### `DATABASE_URL`
- **Description**: PostgreSQL connection string (Neon)
- **Required**: Yes
- **Format**: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`
- **Example**: `postgresql://user:pass@ep-example.us-east-1.neon.tech/dbname?sslmode=require`
- **Notes**: Must include SSL mode for Neon

### Authentication

#### `BETTER_AUTH_URL`
- **Description**: Base URL for Better Auth service
- **Required**: Yes
- **Development**: `http://localhost:5173`
- **Production**: Your production domain (e.g., `https://app.example.com`)
- **Notes**: No trailing slash

#### `BETTER_AUTH_SECRET`
- **Description**: Secret key for session encryption
- **Required**: Yes
- **Generation**: `openssl rand -base64 32`
- **Security**: Must be kept secret, rotate periodically

### External Services

#### `APIFY_API_TOKEN`
- **Description**: Apify API token for web crawling
- **Required**: Yes (for crawling features)
- **Usage**: Website content extraction
- **Get From**: [Apify Console](https://console.apify.com/account/integrations)

## Optional Variables

These variables have defaults but can be configured.

### API Security

#### `API_BEARER_TOKEN`
- **Description**: Bearer token for automation API
- **Required**: No (automation API disabled if not set)
- **Generation**: `openssl rand -hex 32`
- **Usage**: Programmatic access to `/api/automation/*` endpoints
- **Security**: Share only with trusted automation tools

### OAuth Providers

#### `GOOGLE_CLIENT_ID`
- **Description**: Google OAuth client ID
- **Required**: Only if using Google login
- **Get From**: [Google Cloud Console](https://console.cloud.google.com/)
- **Example**: `123456789012-abcdefghijklmnop.apps.googleusercontent.com`

#### `GOOGLE_CLIENT_SECRET`
- **Description**: Google OAuth client secret
- **Required**: Only if using Google login
- **Security**: Store as secret, never commit to code

### Privacy & Compliance

#### `STORE_IP_ADDRESSES`
- **Description**: Whether to store user IP addresses
- **Default**: `false`
- **Values**: `"true"` or `"false"` (string)
- **GDPR**: Set to `false` for GDPR compliance
- **Usage**: Chat message tracking

#### `MESSAGE_RETENTION_DAYS`
- **Description**: Days to retain chat messages
- **Default**: `90`
- **Format**: String number (e.g., `"30"`, `"180"`)
- **Notes**: Cron job runs daily at 2 AM to cleanup

### Monitoring

#### `METRICS_ENDPOINT`
- **Description**: External metrics collection endpoint
- **Required**: No
- **Format**: HTTPS URL
- **Usage**: Future telemetry feature
- **Status**: Not yet implemented

## Development Variables

Used only in development and testing environments.

#### `NODE_ENV`
- **Description**: Application environment
- **Values**: `development`, `test`, `production`
- **Default**: `production` in Cloudflare Workers
- **Usage**: Enables debug logging, mocks

## Test Environment Variables

Set these in `.env.test` for integration tests.

#### `TEST_MODE`
- **Description**: Indicates test environment
- **Value**: `"true"`
- **Usage**: Enables test-specific behavior

#### `DISABLE_RATE_LIMITING`
- **Description**: Disables API rate limiting
- **Value**: `"true"`
- **Usage**: Allows rapid test execution

#### `MOCK_OPENAI`
- **Description**: Mock OpenAI API calls
- **Value**: `"true"`
- **Usage**: Prevents API charges in tests

#### `MOCK_APIFY`
- **Description**: Mock Apify crawler calls
- **Value**: `"true"`
- **Usage**: Prevents crawler runs in tests

## Cloudflare Bindings

These are configured in `wrangler.jsonc`, not environment variables.

### R2 Storage

```json
{
  "r2_buckets": [{
    "binding": "WIDGET_FILES",
    "bucket_name": "websyte-ai-widget"
  }]
}
```

### Workflows

```json
{
  "workflows": [{
    "name": "widget-content-pipeline",
    "binding": "WIDGET_CONTENT_WORKFLOW",
    "class_name": "WidgetContentPipeline",
    "script_name": "websyte-ai-chat-widget"
  }]
}
```

## Environment Setup

### Local Development

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials:
   ```env
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   MISTRAL_AI_API_KEY=...
   APIFY_API_TOKEN=...
   BETTER_AUTH_URL=http://localhost:5173
   BETTER_AUTH_SECRET=...
   ```

3. Optional: Add OAuth providers:
   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

### Production Deployment

1. Set secrets via Wrangler:
   ```bash
   wrangler secret put DATABASE_URL
   wrangler secret put OPENAI_API_KEY
   wrangler secret put MISTRAL_AI_API_KEY
   wrangler secret put APIFY_API_TOKEN
   wrangler secret put BETTER_AUTH_SECRET
   wrangler secret put API_BEARER_TOKEN
   ```

2. Set non-sensitive vars in dashboard:
   - `BETTER_AUTH_URL`
   - `STORE_IP_ADDRESSES`
   - `MESSAGE_RETENTION_DAYS`

### Testing

Create `.env.test`:
```env
DATABASE_URL=postgresql://test...
OPENAI_API_KEY=test-key
MISTRAL_AI_API_KEY=test-key
APIFY_API_TOKEN=test-key
BETTER_AUTH_URL=http://localhost:5173
BETTER_AUTH_SECRET=test-secret
TEST_MODE=true
DISABLE_RATE_LIMITING=true
MOCK_OPENAI=true
MOCK_APIFY=true
```

## Security Best Practices

### Secret Management

1. **Never commit secrets** to version control
2. **Use different secrets** for each environment
3. **Rotate secrets** periodically (quarterly)
4. **Limit access** to production secrets
5. **Audit usage** through provider dashboards

### API Key Security

- **OpenAI**: Use project-specific keys with spending limits
- **Mistral**: Monitor usage for unusual activity
- **Apify**: Use read-only tokens where possible
- **Bearer Tokens**: Generate cryptographically secure tokens

### Database Security

- **Use SSL**: Always include `?sslmode=require`
- **IP Allowlisting**: Configure in Neon dashboard
- **Connection Pooling**: Use Neon's pooler endpoint
- **Separate Databases**: Use different DBs for dev/staging/prod

## Troubleshooting

### Common Issues

**"Environment variable X is not defined"**
- Check spelling and capitalization
- Ensure variable is set in correct environment
- Verify Cloudflare secrets are deployed

**"Invalid API key"**
- Check for extra spaces or quotes
- Verify key hasn't been rotated
- Ensure using correct environment's key

**"Database connection failed"**
- Verify DATABASE_URL format
- Check SSL mode is set
- Confirm database is accessible

**"Authentication failed"**
- Ensure BETTER_AUTH_SECRET matches
- Verify BETTER_AUTH_URL is correct
- Check for trailing slashes

### Debug Commands

```bash
# List Cloudflare secrets
wrangler secret list

# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Verify API keys (be careful not to expose)
echo $OPENAI_API_KEY | head -c 10

# Check environment in worker
wrangler tail
```

## Migration Guide

### From Development to Production

1. Generate new secrets for production
2. Set all required variables
3. Configure OAuth redirect URLs
4. Update BETTER_AUTH_URL
5. Enable IP storage if needed
6. Set appropriate retention period

### Updating Secrets

1. Generate new secret value
2. Update in Cloudflare dashboard
3. Deploy new worker version
4. Verify functionality
5. Document rotation in changelog