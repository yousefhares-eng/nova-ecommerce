# Security Policy

## Reporting a vulnerability

Please do not open a public issue for security vulnerabilities. Contact the project owner privately with a clear description, reproduction steps, and potential impact.

## Deployment requirements

- Keep `.env` and all credentials out of source control.
- Use HTTPS and a strong, unique `JWT_SECRET`.
- Use MongoDB Atlas network restrictions and a dedicated database user.
- Configure a persistent object-storage provider for production uploads.
- Connect a PCI-compliant payment provider before accepting real card payments.
