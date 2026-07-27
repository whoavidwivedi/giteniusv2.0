# Dependency Overrides

## Active overrides

### jspdf → ^4.2.1

- **Advisory**: GHSA-wfv2-pwc8-crg5 (and others)
- **Why we override**: Vulnerable versions of jspdf (<=3.0.4) are used by html2pdf.js (even on 0.14.0).
- **When to remove**: When html2pdf.js or a better alternative resolves the dependency natively to a patched version.
- **Verification**: Verified the app still builds and audit passes.
