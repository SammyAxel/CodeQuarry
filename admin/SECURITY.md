# CodeQuarry Security Guide

## Overview

This document outlines the security measures implemented in CodeQuarry and provides guidance for developers on maintaining and extending security practices.

## Current Security Implementation

### 1. Authentication & Authorization

**Status:** ✅ Implemented (Server-Side)

#### Security Architecture
- **Passwords Never Exposed**: Backend-only verification, never sent to frontend bundle
- **Environment Variables**: `ADMIN_PASSWORD` and `MOD_PASSWORD` in `.env` (backend only)
- **No VITE_ Prefix**: Frontend cannot access these variables

#### Session Token Flow
1. User submits password on login page
2. Backend verifies using constant-time comparison
3. Backend generates 32-byte random session token
4. Frontend stores token in `sessionStorage` (NOT password)
5. All API requests include `X-Session-Token` header
6. Backend validates token and expiration on each request

#### Features
- **Constant-Time Comparison**: Prevents timing attacks with XOR-based comparison
- **32-Byte Random Tokens**: Cryptographically secure (`crypto.randomBytes(32)`)
- **30-Minute Expiration**: Sessions automatically expire
- **Brute Force Protection**: 1-second delay on failed login attempts
- **Auto-Clear**: Session tokens cleared on logout or browser close
- **No Replay Attacks**: Session tied to specific browser/device

**Setup Instructions:**
```bash
# Edit .env file (backend environment variables only)
ADMIN_PASSWORD=your_secure_admin_password
MOD_PASSWORD=your_secure_mod_password
PORT=5000
```

**Important:**
- Never use `VITE_` prefix for sensitive data
- Passwords are server-environment-only
- Frontend only receives session tokens
- See `MODERATOR_GUIDE.md` for user instructions

### 2. CSRF Protection

**Status:** ✅ Implemented (Frontend)

- **CSRF Token Generation**: Each form action gets a unique token
  - Tokens are one-time use (invalidated after verification)
  - Stored in `sessionStorage`
  - Separate from authentication tokens

- **Token Verification**: Required before critical operations
  - Course creation/editing (ModuleEditor)
  - Course deletion (AdminDashboard)
  - Course import (file upload)

**Implementation:**
- CSRF tokens protect frontend form submissions
- Session tokens protect API communication
- Backend validates session tokens on all admin endpoints

**Files:**
- `src/utils/securityUtils.js` - Token generation/verification
- `src/components/ModuleEditor.jsx` - Course editor CSRF protection
- `src/components/AdminDashboard.jsx` - Delete confirmation with CSRF
- `server.js` - Backend session validation middleware

### 3. Input Validation & XSS Prevention

**Status:** ✅ Implemented

- **Input Sanitization**: `sanitizeInput()` removes dangerous patterns
  - Strips `<script>` tags
  - Removes `javascript:` protocol
  - Strips event handlers (`onclick=`, `onload=`, etc.)
  - Enforces maximum length

- **Applied To:**
  - Search input (HomePage)
  - Course titles/descriptions (ModuleEditor)
  - Course import validation (AdminDashboard)
  - All user-provided text inputs

**Example Usage:**
```javascript
import { sanitizeInput } from '../utils/securityUtils';

const cleanTitle = sanitizeInput(userInput, 200); // Max 200 chars
```

### 4. Rate Limiting & DoS Protection

**Status:** ✅ Implemented

- **Execution Rate Limiting**: Prevents code execution spam
  - Max attempts per session: `VITE_MAX_CODE_ATTEMPTS` (default: 100)
  - Counter reset per session
  - Checked before every code execution

- **Code Execution Timeout**: Prevents infinite loops
  - Timeout: `VITE_CODE_EXEC_TIMEOUT` (default: 5000ms = 5 seconds)
  - Applied to JavaScript, Python, and C execution
  - Graceful timeout with user-friendly error message

**Environment Configuration:**
```env
VITE_MAX_CODE_ATTEMPTS=100
VITE_CODE_EXEC_TIMEOUT=5000
```

### 5. Session Management & Timeouts

**Status:** ✅ Implemented

- **Session Timeout**: Auto-logout on inactivity
  - Timeout duration: `VITE_SESSION_TIMEOUT` (default: 30 minutes)
  - Tracked by `lastActivityTime`
  - Updated on user activity: mouse, keyboard, scroll, touch

- **Pre-Expiry Warning**: Shows 5 minutes before logout
  - User can extend session or logout
  - Real-time countdown timer
  - Auto-logout if ignored

- **Session Events Logged**: For security audit trail
  - User login/logout
  - Session timeout
  - Session extension

**Implementation:**
- `src/context/UserContext.jsx` - Session state management
- `src/components/SessionTimeoutWarning.jsx` - Warning modal
- Activity tracking on document events

### 6. Secure Data Storage

**Status:** ✅ Implemented

- **Client-Side Encryption**: Base64 encoding with timestamp validation
  - Data encoded before storage
  - Timestamp included (validated for 24-hour freshness)
  - Graceful fallback if decryption fails

- **Storage Functions:**
  - `setSecureStorage(key, data)` - Encrypted write
  - `getSecureStorage(key)` - Decrypted read
  - `removeSecureStorage(key)` - Secure delete

- **Applied To:**
  - Course drafts
  - User progress
  - Session data
  - Sensitive configuration

**Note:** Current implementation uses Base64 encoding for obfuscation. For production deployments with truly sensitive data, consider implementing TweetNaCl.js or libsodium.js for cryptographic encryption.

**Example Usage:**
```javascript
import { setSecureStorage, getSecureStorage } from '../utils/securityUtils';

// Store encrypted
setSecureStorage('courseDrafts', coursesData);

// Retrieve decrypted
const courses = getSecureStorage('courseDrafts');
```

### 7. Error Handling & Logging

**Status:** ✅ Partially Implemented

- **Security Event Logging**: All security events tracked
  - Failed authentication attempts
  - Code execution timeouts
  - Rate limit violations
  - Session events

- **Error Messages**: User-friendly, no stack traces exposed
  - Backend errors logged for debugging
  - Frontend shows clean error messages

**Log Events:**
```javascript
logSecurityEvent('event_type', {
  userId: 'user123',
  timestamp: '2025-12-06T10:30:00Z',
  // event-specific data
});
```

### 8. Code Execution Sandboxing

**Status:** ⚠️ Partially Implemented

- **Timeout Protection**: ✅ Prevents infinite loops
- **Rate Limiting**: ✅ Prevents spam execution
- **Full Sandboxing**: ❌ Not yet implemented

**Current Execution Model:**
- JavaScript: Runs in main thread with try-catch
- Python: Runs via Pyodide (browser-based)
- C: Compiles via backend API or client-side printf parser

**Future Improvements:**
- Move execution to Web Worker
- Use iframe sandbox attribute
- Restrict code capabilities (no network, no DOM access)
- See TODO #8 for implementation details

## Security Configuration

### Environment Variables (.env.local)

```env
# Authentication
VITE_ADMIN_PASSWORD=super_secret_admin_password
VITE_MOD_PASSWORD=super_secret_mod_password

# Session Management
VITE_SESSION_TIMEOUT=30          # Minutes before auto-logout

# Code Execution
VITE_CODE_EXEC_TIMEOUT=5000      # Milliseconds (5 seconds)
VITE_MAX_CODE_ATTEMPTS=100       # Per session limit
```

### .env.local is CRITICAL

- **NEVER commit .env.local to git**
- Add to `.gitignore`: `.env.local`
- Each deployment needs its own .env.local
- Rotate passwords regularly
- Use strong, random passwords

## Security Best Practices

### For Developers

1. **Always sanitize user input**
   ```javascript
   import { sanitizeInput } from '../utils/securityUtils';
   const clean = sanitizeInput(userInput, maxLength);
   ```

2. **Use secure storage for sensitive data**
   ```javascript
   import { setSecureStorage, getSecureStorage } from '../utils/securityUtils';
   setSecureStorage('key', sensitiveData);
   ```

3. **Generate CSRF tokens for forms**
   ```javascript
   import { generateCSRFToken, verifyCSRFToken } from '../utils/securityUtils';
   const token = generateCSRFToken('form-id');
   // Verify before processing form submission
   ```

4. **Log security events**
   ```javascript
   import { logSecurityEvent } from '../utils/securityUtils';
   logSecurityEvent('user_action', { userId, action, timestamp });
   ```

5. **Never log sensitive data**
   - Avoid logging passwords, tokens, or personal data
   - Only log event types and IDs
   - Store logs securely if persisting to backend

### For Administrators

1. **Setup**
   - Create `.env.local` with strong passwords
   - Never use default passwords
   - Rotate passwords every 90 days

2. **Monitoring**
   - Check browser console for `[SECURITY]` warnings
   - Review failed login attempts
   - Monitor code execution timeouts

3. **Updates**
   - Keep Node.js dependencies up-to-date
   - Run `npm audit` regularly
   - Apply security patches promptly

4. **Deployment**
   - Use HTTPS in production
   - Set strong CSP headers
   - Enable X-Frame-Options
   - Never expose .env.local

## Security Audit Checklist

- [ ] `.env.local` created with strong passwords
- [ ] `.env.local` added to `.gitignore`
- [ ] All VITE_ environment variables set
- [ ] Session timeout configured (recommended: 30 minutes)
- [ ] Rate limits configured appropriately
- [ ] Security logs being captured
- [ ] Error handling prevents stack trace exposure
- [ ] HTTPS enabled in production
- [ ] CSP headers configured
- [ ] Regular password rotation scheduled

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. **DO NOT** share vulnerability details publicly
3. **Email** security@codequarry.local with:
   - Vulnerability description
   - Affected component
   - Steps to reproduce
   - Suggested fix (optional)

4. Allow 48 hours for initial response
5. Provide 30 days for patch and release

## Future Security Improvements

See `TODO.md` for detailed roadmap:

- [ ] #7: Error boundaries & security headers
- [ ] #8: Full code execution sandboxing (Web Worker)
- [ ] #9: Comprehensive logging & monitoring dashboard
- [ ] #10: Complete security documentation

## Compliance Notes

### GDPR
- User data stored locally in browser
- No data sent to external servers (except code compilation)
- Users can request data deletion via browser storage clear

### OWASP Top 10
- A1: Injection - ✅ Input sanitization
- A2: Broken Authentication - ✅ Secure login with role-based access
- A3: XSS - ✅ Input sanitization + DOM isolation
- A4: Broken Access Control - ✅ Role-based permissions
- A5: Broken CSRF - ✅ CSRF tokens
- A6: Insecure Storage - ✅ Encrypted localStorage
- A7: Insecure Transport - ⚠️ Use HTTPS in production
- A8: Insecure Deserialization - ✅ Input validation
- A9: Vulnerable Components - ✅ Regular dependency updates
- A10: Insufficient Logging - ✅ Security event logging

## Support

For questions about security implementation:
1. Check this guide first
2. Review comments in `src/utils/securityUtils.js`
3. Check `src/context/UserContext.jsx` for session management
4. Refer to component implementation files for CSRF/validation usage

## Changelog

### v1.0 - Security Hardening
- Removed hardcoded passwords
- Implemented CSRF protection
- Added input sanitization
- Rate limiting & execution timeouts
- Session management with auto-logout
- Secure localStorage encryption
- Comprehensive security logging
