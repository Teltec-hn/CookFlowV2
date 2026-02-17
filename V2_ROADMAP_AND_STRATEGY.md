# CookFlow V2.1: Enhanced Implementation Strategy

> **"From Prototype to Product"**
> *Revised based on Security & Architecture Review (2026-02-17)*

---

## 🗺️ Strategic Phasing

### Phase 1: The Foundation (Ironclad Networking & Contracts)
*   **DevOps Agent:**
    *   [ ] **Automate WSL2 Networking:** Create a PowerShell script (`setup_network.ps1`) to:
        *   Detect Host IP.
        *   Configure PortProxy.
        *   **NEW:** Write Host IP to `.env` file for Docker consumption.
    *   [ ] **Standardize Docker Env:** Create `docker-compose.yml` using `bridge` mode and `extra_hosts` for stable `api.cookflow.local` resolution inside containers.
*   **Architect Agent:**
    *   [ ] **The Golden Contract:** OpenAPI 3.0 specs.
    *   [ ] **Supabase Schema Freeze:** 
        *   **NEW:** Hardened RLS policies (User preferences private).
        *   **NEW:** Edge Function Proxy design (No exposed keys in Roku).

### Phase 2: The Core Refactor (Optimization & Security)
*   **Roku Agent (Chef DNA):**
    *   [ ] **Data Transformer:** Receive "flattened" JSONs from the backend (Edge Function) to minimize `roAssociativeArray` parsing overhead.
    *   [ ] **Image Optimization:** Switch to Cloudinary/Vercel Blob for WebP serving (40% CPU saving).
    *   [ ] **Network Service:** Retry logic + error classification.

### Phase 3: The Experience (Lean UX)
*   [ ] Skeleton Loading & Focus Management.
*   [ ] Offline Mode UI.

---

## 🔒 Security & Performance Pillars (New)

### 1. Security: The "Zero Trust" Model
*   **RLS Hardening:** `users` table restricted to `auth.uid() = id`. `chef_profiles` public read-only.
*   **API Gateway:** Roku talks to Supabase Edge Functions, NOT directly to DB tables. Edge Functions hold the secrets.
*   **Input Sanitization:** Backend "Transformer" sanitizes generic strings from Whisk before sending to Roku to prevent parser crashes.

### 2. Performance: "Cost Zero" Scale
*   **Whisk Caching:** Middle-layer table in Supabase caches Whisk responses. 100 requests for "Snoop's Pasta" = 1 Whisk API call.
*   **CDN Strategy:** Images served via free-tier CDNs (Cloudinary) formatted as WebP/SD.

---

## 🤖 updated Agent Responsibilities

| Agent Role | Responsibility |
| :--- | :--- |
| **DevOps** | `setup_network.ps1` writes `.env`. `docker-compose.yml` uses user-defined bridge network + extra_hosts. |
| **Architect** | Design Edge Functions for "Transformer" pattern. Harden RLS. |
| **Roku** | Consume flattened JSON. Display WebP images. |

---

## 📅 Immediate Action Plan

1.  **[DevOps]** Implement "Smart DNS" `docker-compose.yml` & updated `setup_network.ps1`.
2.  **[Architect]** Update `schema.sql` with secure RLS.
3.  **[Roku]** Verify `manifest` IP injection workflow.
