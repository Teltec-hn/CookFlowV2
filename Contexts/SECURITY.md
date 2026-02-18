# CookFlow Security Manifest

> **Classification:** INTERNAL STRICT  
> **Maintainer:** Core Kernel Architect  
> **Enforcement:** Automated CI/CD & Code Review

---

## 🚫 The Cardinal Rules (Reglas de Oro)

### 1. NO Hardcoded Credentials
**Status:** BLOCKED
It is strictly forbidden to commit API Keys, Service Role Secrets, or Database Passwords to the `cookflow_roku` or `cookflow_api` source code.

**Approved Pattern:**
- **Roku:** Inject via `manifest` placeholders replaced by CI/CD or `setup_network.ps1`.
- **Backend:** standard environment variables (`.env`).

### 2. HTTPS enforcement
**Status:** BLOCKED
Production traffic MUST use TLS 1.2+. The `ConfigManager.brs` is hardcoded to reject non-HTTPS URLs in `prod` mode to prevent Man-in-the-Middle attacks.

### 3. Input Sanitization
**Status:** REQUIRED
All external data (Whisk API, Supabase) must be treated as untrusted.
- **Roku:** Use `GetApiUrl` helper to scrub paths.
- **Backend:** Use Pydantic models to validate ingress data.

---

## 🔒 Configuration Protocol

| Environment | Config Source | Network Transport | Auth Method |
| :--- | :--- | :--- | :--- |
| **Development** | `setup_network.ps1` -> `manifest` | HTTP (Local LAN) | Mock / Anonymous |
| **Production** | CI/CD Pipeline -> `manifest` | HTTPS (TLS 1.2) | Edge Function Proxy |

---

## 🚨 Incident Response

If a key is leaked in git history:
1. **Rotate** the key immediately in Supabase/Whisk dashboard.
2. **Scrub** the git history (BFG Repo-Cleaner) or re-create the repo if usage is low.
3. **Audit** logs for suspicious access during the exposure window.
