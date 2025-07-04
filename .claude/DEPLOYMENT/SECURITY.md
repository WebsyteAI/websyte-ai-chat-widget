# Security Documentation

Comprehensive security guide for the Websyte AI Chat Widget application.

## Overview

This document covers security best practices, authentication mechanisms, and security considerations for deploying and maintaining the application.

## Authentication & Authorization

### Better Auth Integration

The application uses Better Auth for user authentication with the following security features:

- **Session-based authentication** with secure cookies
- **CSRF protection** enabled by default
- **OAuth 2.0** support for social logins
- **Secure password hashing** using bcrypt

### Authentication Flow

1. **Login Process**:
   - User credentials validated server-side
   - Session cookie created with secure flags
   - CSRF token generated for state-changing operations

2. **Session Management**:
   - Sessions expire after inactivity
   - Secure, httpOnly, sameSite cookies
   - Session rotation on privilege escalation

3. **OAuth Security**:
   - State parameter prevents CSRF attacks
   - Redirect URI validation
   - Token exchange happens server-side

### API Authentication

#### Session Authentication
- Used for web application
- Requires valid session cookie
- CSRF token for mutations

#### Bearer Token Authentication
- Used for automation/API access
- Stateless authentication
- No CSRF protection needed

```typescript
// Middleware validates bearer tokens
if (authHeader?.startsWith('Bearer ')) {
  const token = authHeader.substring(7);
  if (token === c.env.API_BEARER_TOKEN) {
    // Valid bearer token
  }
}
```

## Rate Limiting

### Implementation

Rate limiting protects against abuse:

```typescript
const limits = {
  anonymous: { requests: 10, window: 60 },
  authenticated: { requests: 30, window: 60 },
  bearer: { requests: Infinity, window: 0 }
};
```

### Bypass Conditions
- Bearer token authentication
- Admin role users
- Internal service calls

## Data Security

### Encryption

#### At Rest
- Database: TLS encryption via Neon
- R2 Storage: Encrypted by Cloudflare
- Secrets: Encrypted in Cloudflare

#### In Transit
- HTTPS enforced for all connections
- TLS 1.2+ for database connections
- Secure WebSocket for real-time features

### Data Privacy

#### GDPR Compliance
- IP address storage optional (`STORE_IP_ADDRESSES`)
- Automatic data retention cleanup
- User data export capability (planned)
- Right to deletion support

#### Sensitive Data Handling
- No passwords in logs
- API keys masked in responses
- PII minimization in analytics

## Input Validation & Sanitization

### Request Validation

All inputs are validated:

```typescript
// Example: Widget creation
const schema = z.object({
  name: z.string().max(100),
  description: z.string().max(500).optional(),
  url: z.string().url().optional(),
  systemPrompt: z.string().max(1000).optional()
});
```

### File Upload Security
- File type validation
- Size limits enforced (25MB)
- Virus scanning (planned)
- Isolated storage in R2

### SQL Injection Prevention
- Parameterized queries via Drizzle ORM
- No raw SQL execution
- Input escaping for dynamic queries

## XSS Prevention

### Content Security Policy

```typescript
// Recommended CSP headers
{
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.openai.com"
}
```

### Output Encoding
- React automatically escapes content
- Markdown sanitized before rendering
- User content in sandboxed iframes

## CORS Configuration

### Widget Embedding
```typescript
// Permissive CORS for widget embedding
cors({
  origin: '*',
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization']
})
```

### API Endpoints
```typescript
// Restrictive CORS for API
cors({
  origin: process.env.BETTER_AUTH_URL,
  credentials: true
})
```

## Secrets Management

### Environment Variables

#### Development
- Use `.env` files (gitignored)
- Separate `.env.test` for tests
- No real credentials in tests

#### Production
- Cloudflare secrets for sensitive data
- Environment variables for config
- Regular secret rotation

### Secret Rotation Schedule
- **Quarterly**: API keys, bearer tokens
- **Semi-annually**: Auth secrets
- **Annually**: OAuth credentials
- **Immediately**: On suspected compromise

## Security Headers

### Recommended Headers

```typescript
// Security headers middleware
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
});
```

## Vulnerability Management

### Dependency Updates
- Weekly dependency scans
- Automated PRs for patches
- Manual review for major updates
- Security advisories monitoring

### Security Testing
- Static analysis with ESLint
- Dependency vulnerability scanning
- Penetration testing (planned)
- Security code reviews

## Incident Response

### Detection
- Monitor error logs for patterns
- Track authentication failures
- Alert on rate limit violations
- Watch for data exfiltration

### Response Plan
1. **Identify**: Determine scope and impact
2. **Contain**: Isolate affected systems
3. **Eradicate**: Remove threat
4. **Recover**: Restore normal operations
5. **Review**: Post-mortem and improvements

### Communication
- Security incidents: security@example.com
- Status page for users
- Transparent disclosure policy

## API Security Best Practices

### Endpoint Security
1. **Authentication required** for all non-public endpoints
2. **Authorization checks** for resource access
3. **Rate limiting** to prevent abuse
4. **Input validation** on all parameters

### Error Handling
- Generic error messages to users
- Detailed logging server-side
- No stack traces in production
- Rate limit error disclosure

## Widget Security

### Embedding Security
- Origin validation for postMessage
- Sandboxed iframe execution
- No direct DOM access
- Content Security Policy

### Data Isolation
- Widget data scoped by ID
- No cross-widget data access
- Separate storage per widget
- Session isolation

## Monitoring & Alerting

### Security Metrics
- Failed authentication attempts
- Rate limit violations
- Error rate spikes
- Unusual traffic patterns

### Alerting Rules
- 5+ failed logins from same IP
- Rate limit exceeded 10x in hour
- 500 errors above baseline
- New IP accessing admin routes

## Compliance

### Standards
- GDPR compliance for EU users
- SOC 2 readiness (planned)
- OWASP Top 10 mitigation
- PCI DSS for payments (future)

### Auditing
- Access logs retained 90 days
- Admin action logging
- Data access auditing
- Regular security reviews

## Security Checklist

### Pre-Deployment
- [ ] All secrets in environment variables
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] Security headers enabled
- [ ] Input validation complete

### Post-Deployment
- [ ] Monitor authentication logs
- [ ] Check rate limit effectiveness
- [ ] Review error patterns
- [ ] Verify HTTPS everywhere
- [ ] Test security headers

### Maintenance
- [ ] Rotate secrets quarterly
- [ ] Update dependencies weekly
- [ ] Review access logs monthly
- [ ] Conduct security training
- [ ] Update this documentation