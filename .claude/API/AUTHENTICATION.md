# Authentication

Websyte AI uses OAuth 2.0 and bearer token authentication to secure API access.

## 🔐 Authentication Methods

### 1. OAuth 2.0 (Web Application)

For user-facing applications, use OAuth 2.0 with these providers:

- **Google OAuth**
- **GitHub OAuth**

#### OAuth Flow

1. Redirect users to the login page:
```
https://your-domain.com/login?provider=google
```

2. After successful authentication, users are redirected to your callback URL with a session cookie.

3. The session cookie automatically authenticates subsequent API requests.

### 2. Bearer Token (API Access)

For programmatic access, use bearer tokens.

#### Generate a Token

1. Login to your dashboard
2. Navigate to **Settings > API Tokens**
3. Click **Generate New Token**
4. Copy the token (you won't see it again!)

#### Using Bearer Tokens

Include the token in the `Authorization` header:

```bash
curl -X GET \
  https://your-domain.com/api/automation/widgets \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

#### Token Format

```
Bearer websyte_prod_1234567890abcdef
```

## 🛡️ Security Considerations

### Token Storage

**DO:**
- Store tokens in environment variables
- Use secure key management services
- Encrypt tokens at rest

**DON'T:**
- Commit tokens to version control
- Expose tokens in client-side code
- Share tokens via insecure channels

### Token Rotation

- Tokens don't expire by default
- Rotate tokens every 90 days
- Revoke compromised tokens immediately

### API Token Scopes

Tokens can have different permission levels:

- **read** - Read-only access to widgets and content
- **write** - Create and modify widgets and content
- **delete** - Delete widgets and content
- **admin** - Full access including user management

## 🔑 Authentication Examples

### JavaScript/TypeScript

```typescript
// Using fetch
const response = await fetch('https://your-domain.com/api/automation/widgets', {
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }
});

// Using axios
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://your-domain.com/api',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN'
  }
});

const widgets = await client.get('/automation/widgets');
```

### Python

```python
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://your-domain.com/api/automation/widgets',
    headers=headers
)

widgets = response.json()
```

### cURL

```bash
curl -X GET \
  https://your-domain.com/api/automation/widgets \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
```

## 🚨 Error Responses

### Missing Authentication

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### Invalid Token

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired token"
  }
}
```

### Insufficient Permissions

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions for this operation"
  }
}
```

## 🔄 Token Management API

### List Tokens

```bash
GET /api/user/tokens
```

### Create Token

```bash
POST /api/user/tokens
Content-Type: application/json

{
  "name": "Production API",
  "scopes": ["read", "write"]
}
```

### Revoke Token

```bash
DELETE /api/user/tokens/:tokenId
```

## 📚 Best Practices

1. **Use HTTPS Always** - Never send tokens over unencrypted connections
2. **Limit Token Scope** - Only grant necessary permissions
3. **Monitor Usage** - Track API calls per token
4. **Implement Retry Logic** - Handle token refresh gracefully
5. **Use Short-Lived Tokens** - For temporary access

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid token" error**
   - Check token hasn't been revoked
   - Ensure correct token format
   - Verify token is for correct environment

2. **"Unauthorized" error**
   - Confirm Authorization header is present
   - Check for typos in "Bearer" prefix
   - Ensure space between "Bearer" and token

3. **"Forbidden" error**
   - Verify token has required scopes
   - Check resource ownership
   - Confirm account is active

### Debug Headers

Include these headers for debugging:

```bash
X-Debug-Token: true
X-Debug-Auth: true
```

## 📖 Next Steps

- [Explore the Widgets API](./WIDGETS.md)
- [Set up automation](./AUTOMATION.md)
- [Integrate chat](./CHAT.md)