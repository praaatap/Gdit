# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.x.x   | :white_check_mark: |
| 2.x.x   | :x:                |
| < 2.0   | :x:                |

## Security Considerations

### OAuth Credentials

gdit uses OAuth 2.0 for Google authentication. Here's what you need to know:

1. **Your Own Credentials**: Each user must create their own OAuth credentials through the Google Cloud Console. This ensures that:
   - You have full control over your application's access
   - No third party has access to your tokens
   - You can revoke access at any time

2. **Token Storage**: OAuth tokens are stored locally at `~/.gdit/token.json`. These tokens:
   - Are only readable by your user account
   - Are automatically refreshed when expired
   - Should never be shared or committed to version control

3. **Scope Limitations**: gdit only requests the minimum necessary permissions:
   - `drive.file`: Access only to files created by gdit
   - `userinfo.email`: Display your email address
   - `userinfo.profile`: Display your name

### Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **Do NOT** open a public GitHub issue
2. Email us at: security@your-email.com (replace with your actual email)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will:
- Acknowledge receipt within 48 hours
- Provide an estimated timeline for a fix
- Keep you informed of progress
- Credit you in the security advisory (unless you prefer anonymity)

### Best Practices

1. **Never share your credentials**: Keep `~/.gdit/credentials.json` private
2. **Use .gitignore**: The `.gdit/` directory should already be ignored
3. **Revoke access when not needed**: Use Google Account settings
4. **Keep gdit updated**: Install the latest version for security fixes

## Known Limitations

- gdit stores credentials unencrypted on disk (standard OAuth practice)
- Anyone with access to your computer can potentially access your Drive files
- Consider full-disk encryption for sensitive data

## Contact

For security concerns: security@your-email.com
