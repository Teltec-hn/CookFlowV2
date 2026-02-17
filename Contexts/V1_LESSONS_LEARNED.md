# CookFlow V1: Lessons Learned

> **"Experience is the teacher of all things." — Julius Caesar**

This document captures critical learnings from CookFlow V1 development and deployment. Use this as a **preventative checklist** to avoid repeating architectural mistakes and operational pitfalls.

---

## 🌐 Network Management: The Silent Killer

### Problem: Persistent Timeout Errors

**Symptom:**
```
TIMEOUT ERROR: Request to http://192.168.1.X:8000/api/v1/chefs failed
roUrlTransfer timeout after 30 seconds
```

**Root Causes Identified:**

1. **Dynamic IP Assignment** in development environments
2. **Docker bridge networking** isolating containers from LAN
3. **WSL2 networking quirks** on Windows hosts
4. **0.0.0.0 binding issues** in FastAPI/Uvicorn
5. **SSL certificate validation** failures with Supabase

---

### Solution: Network Hardening Protocol

#### 1. Static IP Assignment (Development)

**Router Configuration:**
```
Device: Roku Express
MAC Address: XX:XX:XX:XX:XX:XX
Reserved IP: 192.168.1.100 (static lease)
```

**Why:**
- Prevents IP churn on DHCP renewal
- Enables consistent URL in `manifest` file
- Facilitates firewall rule configuration

**Verification Command:**
```bash
# On Roku debug console
ping 192.168.1.100
```

---

#### 2. Docker Network Exposure

**❌ Anti-Pattern:**
```yaml
# docker-compose.yml
services:
  api:
    ports:
      - "8000:8000"  # Only accessible from host
```

**✅ Correct Pattern:**
```yaml
services:
  api:
    network_mode: "host"  # Direct LAN access
    # OR
    ports:
      - "0.0.0.0:8000:8000"  # Explicit external binding
```

**Additional Configuration:**
```python
# main.py (FastAPI)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # ⚠️ Critical: Bind to all interfaces
        port=8000,
        reload=True
    )
```

**Validation Checklist:**
- [ ] Can ping API from Windows host: `curl http://localhost:8000/health`
- [ ] Can ping API from LAN device: `curl http://192.168.1.X:8000/health`
- [ ] Can ping API from Roku: Check network logs in debug console

---

#### 3. WSL2 Port Forwarding (Windows-Specific)

**Issue:**
WSL2 creates a virtual network adapter. Ports bound in WSL are NOT automatically accessible from LAN.

**PowerShell Fix (Run as Administrator):**
```powershell
# Get WSL IP
wsl hostname -I

# Forward port 8000 from Windows to WSL
netsh interface portproxy add v4tov4 `
  listenport=8000 `
  listenaddress=0.0.0.0 `
  connectport=8000 `
  connectaddress=<WSL_IP>

# Verify
netsh interface portproxy show all
```

**Permanent Solution:**
Add to `~/.bashrc` in WSL:
```bash
export WSL_HOST=$(tail -1 /etc/resolv.conf | cut -d' ' -f2)
alias start-api="uvicorn main:app --host 0.0.0.0 --port 8000"
```

**Windows Firewall Rule:**
```powershell
New-NetFirewallRule -DisplayName "CookFlow API" `
  -Direction Inbound `
  -LocalPort 8000 `
  -Protocol TCP `
  -Action Allow
```

---

#### 4. Supabase SSL Certificate Handling

**Error Encountered:**
```
SSL CERTIFICATE_VERIFY_FAILED
supabase-py unable to establish secure connection
```

**Root Cause:**
Docker containers may lack updated CA certificates.

**Dockerfile Fix:**
```dockerfile
FROM python:3.11-slim

# Install system certificates
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Python Alternative (Development Only):**
```python
# ⚠️ NOT FOR PRODUCTION
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
```

**Production Solution:**
```python
import certifi
from supabase import create_client

client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
    options={
        "verify": certifi.where()  # Use bundled certificates
    }
)
```

---

## 🔄 Cross-Platform Compatibility: JSON Parsing Wars

### Problem: BrightScript vs. Kotlin Serialization Differences

**Scenario:**
API returns nested arrays. Roku crashes. Android TV works fine.

**Example Response:**
```json
{
  "chefs": [
    {
      "id": "rapper_001",
      "name": "Chef Snoop",
      "specialties": ["soul food", "bbq"]  // ⚠️ Problem: nested array
    }
  ]
}
```

**BrightScript Behavior:**
```brightscript
' roAssociativeArray can handle arrays in values
chef = response.chefs[0]
print chef.specialties  ' Works, but...
print chef.specialties[0]  ' MAY fail on some Roku models (TYPE_MISMATCH)
```

**Root Cause:**
Roku's `roArray` type coercion is unpredictable when nested in `roAssociativeArray`.

---

### Solution: Platform-Safe JSON Contracts

#### Rule 1: Flatten When Possible

**❌ Anti-Pattern:**
```json
{
  "specialties": ["soul food", "bbq"]
}
```

**✅ Safe Pattern:**
```json
{
  "specialties_csv": "soul food,bbq",
  "specialties": ["soul food", "bbq"]  // Keep for Android
}
```

**BrightScript Parsing:**
```brightscript
specialtiesArray = chef.specialties_csv.Split(",")
```

---

#### Rule 2: Explicit Type Declarations

**API Response Schema (OpenAPI):**
```yaml
ChefProfile:
  type: object
  required: [id, name, specialties_csv]
  properties:
    id:
      type: string
      example: "rapper_001"
    name:
      type: string
      example: "Chef Snoop"
    specialties_csv:
      type: string
      description: "Comma-separated list for Roku compatibility"
    specialties:
      type: array
      items:
        type: string
      description: "Array format for Android/Web"
```

---

#### Rule 3: Test on Actual Devices

**Emulator Lies:**
- Roku beta emulator does NOT replicate production memory constraints
- Android TV emulator has more lenient type coercion

**Minimum Test Matrix:**
| Device | OS Version | Test Case |
|--------|-----------|-----------|
| Roku Express | 11.5.0 | JSON with nested arrays |
| Roku Streaming Stick+ | 12.0.0 | Large payloads (10KB+) |
| Chromecast with Google TV | Android 12 | Same JSON as Roku |
| NVIDIA Shield | Android 11 | Stress test (100 items) |

---

## 🛠️ Environment Setup: Deployment Checklists

### Pre-Flight Checklist (Before Every Deploy)

**Docker/WSL Environment:**
- [ ] `docker-compose up` completes without errors
- [ ] Database migrations applied: `alembic upgrade head`
- [ ] Environment variables loaded: `printenv | grep SUPABASE`
- [ ] Health endpoint returns 200: `curl http://localhost:8000/health`
- [ ] Logs show "Application startup complete"

**Network Validation:**
- [ ] WSL port proxy active: `netsh interface portproxy show all`
- [ ] Windows Firewall allows port 8000
- [ ] LAN devices can reach API: `curl http://<HOST_IP>:8000/health` from phone
- [ ] Roku can reach API: Check `manifest` URL matches current IP

**Database Connectivity:**
- [ ] Supabase connection pool healthy: Check connection count
- [ ] Sample query succeeds: `SELECT * FROM chef_profiles LIMIT 1`
- [ ] SSL certificate valid: `openssl s_client -connect <SUPABASE_HOST>:6543`

---

### Docker Bridge Fix (Common Failure Mode)

**Symptom:**
```
docker-compose up works, but Roku gets ETIMEDOUT
```

**Diagnosis:**
```bash
# Inside container
docker exec -it cookflow_api bash
curl http://localhost:8000/health  # Works

# From host Windows
curl http://localhost:8000/health  # Works

# From Roku
# FAILS with timeout
```

**Solution Options:**

**Option A: Host Networking (Linux Only)**
```yaml
services:
  api:
    network_mode: "host"
```

**Option B: Bridge with Port Mapping (Windows/Mac)**
```yaml
services:
  api:
    ports:
      - "0.0.0.0:8000:8000"
    networks:
      - cookflow_net

networks:
  cookflow_net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

**Option C: Tunneling (Development Fallback)**
```bash
# Use ngrok or localtunnel
npx localtunnel --port 8000
# Update Roku manifest with public URL
```

---

## ⚠️ Error Handling: Never Show a Blank Screen

### Principle: Graceful Degradation

**User Expectation:**
> "The app should always show SOMETHING, even if the internet is down."

---

### Implementation: Layered Fallbacks

#### Layer 1: Network Error Detection

**BrightScript (Roku):**
```brightscript
function FetchChefs() as Object
    request = CreateObject("roUrlTransfer")
    request.SetUrl(m.apiBaseUrl + "/chefs")
    request.RetainBodyOnError(true)
    
    port = CreateObject("roMessagePort")
    request.SetPort(port)
    request.AsyncGetToString()
    
    msg = wait(10000, port)  ' 10 second timeout
    
    if msg = invalid then
        ' Timeout - use cached data
        return LoadCachedChefs()
    else if msg.GetResponseCode() <> 200 then
        ' HTTP error - use fallback
        return GetDefaultChefs()
    end if
    
    return ParseJSON(msg.GetString())
end function
```

---

#### Layer 2: Local Cache

**Cache Strategy:**
```brightscript
function LoadCachedChefs() as Object
    ' Read from registry (Roku persistent storage)
    sec = CreateObject("roRegistrySection", "ChefCache")
    cachedData = sec.Read("chefs_data")
    
    if cachedData <> "" then
        return ParseJSON(cachedData)
    else
        ' No cache - use hardcoded defaults
        return GetDefaultChefs()
    end if
end function
```

**Android TV (Kotlin + Room):**
```kotlin
@Dao
interface ChefDao {
    @Query("SELECT * FROM chefs ORDER BY last_updated DESC")
    suspend fun getCachedChefs(): List<Chef>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun cacheChefs(chefs: List<Chef>)
}

// Repository layer
suspend fun fetchChefs(): Result<List<Chef>> {
    return try {
        val response = api.getChefs()
        db.chefDao().cacheChefs(response.data)
        Result.success(response.data)
    } catch (e: IOException) {
        // Network failure - return cached data
        val cached = db.chefDao().getCachedChefs()
        if (cached.isNotEmpty()) {
            Result.success(cached)
        } else {
            Result.failure(e)
        }
    }
}
```

---

#### Layer 3: Hardcoded Defaults

**Why:**
Even if network fails AND cache is empty (fresh install), show SOMETHING.

**Implementation:**
```brightscript
function GetDefaultChefs() as Object
    return {
        "data": [
            {
                "id": "default_001",
                "name": "Chef Classic",
                "specialties_csv": "comfort food,basics",
                "avatar_url": "pkg:/images/default_chef.png"  ' Local asset
            }
        ],
        "meta": {
            "source": "offline_fallback",
            "timestamp": ""
        }
    }
end function
```

---

### User Feedback on Errors

**Bad UX:**
```
[Blank screen with spinning loader forever]
```

**Good UX:**
```
╔══════════════════════════════════╗
║  😊 Browsing Offline Recipes     ║
║                                  ║
║  You're viewing cached content.  ║
║  Connect to WiFi for updates.    ║
╚══════════════════════════════════╝
```

**Implementation:**
```brightscript
if response.meta.source = "offline_fallback" then
    ShowBanner("Browsing Offline Recipes")
end if
```

---

## 📊 Monitoring & Debugging

### Roku Debug Console

**Enable Developer Mode:**
1. Press Home 3x, Up 2x, Right, Left, Right, Left, Right
2. Enable installer and debugger
3. Connect via `telnet <ROKU_IP> 8085`

**Useful Commands:**
```
genkey  ' Generate signing key
sgnodes ' List SceneGraph nodes
r       ' Reload app
```

---

### API Logging Strategy

**Structured Logs (JSON):**
```python
import structlog

logger = structlog.get_logger()

@app.get("/chefs")
async def get_chefs(request: Request):
    logger.info(
        "chef_fetch_attempt",
        client_ip=request.client.host,
        user_agent=request.headers.get("user-agent"),
        platform="roku" if "Roku" in request.headers.get("user-agent", "") else "unknown"
    )
    # ... logic
```

**Critical Metrics to Log:**
- Request latency (p50, p95, p99)
- Error rate by platform (Roku vs Android)
- Cache hit ratio
- Supabase query duration

---

## 🎓 Team Knowledge Sharing

### Agent-to-Agent Workflow

As you scale development, assign specialized roles:

| Role | Responsibility | Key Tools |
|------|---------------|-----------|
| **Architect Agent** | Define Supabase schemas, API contracts | SQL, OpenAPI specs |
| **Roku Agent (Chef DNA)** | Optimize BrightScript, memory management | SceneGraph, roUrlTransfer |
| **Android TV Agent** | Kotlin/Compose, Leanback library | Jetpack, Retrofit |
| **DevOps Agent** | Deploy, monitor, WSL/Docker troubleshooting | Docker, Uvicorn, Ngrok |

**Communication Protocol:**
- All schema changes → Update `schema.sql` in repo
- All API changes → Update OpenAPI spec FIRST, then code
- Cross-platform bugs → File issue with BOTH platform logs

---

## ✅ V2 Success Criteria

Use these learnings to ensure V2 avoids V1 pitfalls:

- [ ] Zero timeout errors in production (99.9% uptime)
- [ ] JSON responses validated against OpenAPI schema in CI/CD
- [ ] Every API call has 3-layer fallback (network → cache → default)
- [ ] WSL port forwarding automated via startup script
- [ ] Device testing matrix executed before each release
- [ ] Roku app never shows blank screen (loading states + fallbacks)
- [ ] Average API response time < 200ms (cached via Redis)
- [ ] SSL certificate expiry monitored (alerts at 30-day threshold)

---

## 🚨 Emergency Playbook

**If Production Roku App Goes Down:**

1. **Immediate Triage (5 min)**
   - Check API health: `curl https://api.cookflow.com/health`
   - Check Supabase status: Dashboard → Logs
   - Check error rate: Filter logs for `error` level

2. **Rollback Decision (10 min)**
   - If API change deployed in last 24h → Rollback
   - If Supabase migration failed → Revert migration
   - If third-party (Whisk) down → Enable cached-only mode

3. **User Communication (15 min)**
   - Update status page
   - Push silent app update with offline mode enabled
   - Post on social media if >1000 users affected

---

*Document Version: 1.0*  
*Last Updated: 2026-02-17*  
*Maintained by: CookFlow Engineering Team*
