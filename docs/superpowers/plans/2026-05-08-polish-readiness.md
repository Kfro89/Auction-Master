# Phase 7: Polish & Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement automated background data sweeps and secure the API/Frontend with a simple JWT-based authentication system.

**Architecture:** 
1. **Automated Sweeps:** Configure `APScheduler` in `main.py` to run the Whitley and Roller scrapers on a defined interval (e.g., hourly), followed by the valuation worker.
2. **Authentication:** Implement a lightweight JWT auth flow in FastAPI. A single hardcoded "Admin" user (configurable via `.env` or settings) will be used to generate tokens. The React frontend will intercept 401s and present a simple login screen.

**Tech Stack:** Python 3.12, FastAPI (Depends, OAuth2PasswordBearer), PyJWT, React 18, TypeScript, APScheduler.

---

### Task 1: Background Scraper Automation

**Files:**
- Modify: `backend/app/main.py`
- Modify: `backend/app/services/ingestion.py`

- [ ] **Step 1: Create the sweeping job**
In `backend/app/main.py`, update the `APScheduler` configuration to run the scrapers before the valuation worker.

```python
# backend/app/main.py (update start_scheduler)
from .services.ingestion import ingest_auctioneer_software

@app.on_event("startup")
async def start_scheduler():
    scheduler = AsyncIOScheduler()
    
    async def sweep_and_valuate_job():
        db = SessionLocal()
        try:
            print("Starting automated background sweep...")
            # 1. Scrape Whitley
            await ingest_auctioneer_software(
                db=db, base_url="https://www.whitleyauction.com", 
                website_key="rmeb", name="Whitley Auction", buyer_premium=18.5
            )
            # 2. Scrape Roller
            await ingest_auctioneer_software(
                db=db, base_url="https://bid.rollerauction.com", 
                website_key="rol", name="Roller Auction", buyer_premium=13.0
            )
            # 3. Process Valuations
            await process_pending_valuations(db)
            print("Background sweep complete.")
        except Exception as e:
            print(f"Background sweep failed: {e}")
        finally:
            db.close()

    # Run every 60 minutes
    scheduler.add_job(sweep_and_valuate_job, "interval", minutes=60)
    scheduler.start()
    print("Background sweep scheduler started.")
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/main.py
git commit -m "feat(scheduler): implement automated background scraping and valuation sweeps"
```

---

### Task 2: Backend JWT Authentication

**Files:**
- Create: `backend/app/auth.py`
- Modify: `backend/app/main.py`
- Modify: `backend/requirements.txt`
- Modify: `backend/app/routers/admin.py`
- Modify: `backend/app/routers/items.py`
- Modify: `backend/app/routers/inventory.py`

- [ ] **Step 1: Add PyJWT dependency**
Add `PyJWT>=2.8.0` and `passlib[bcrypt]>=1.7.4` to `backend/requirements.txt`.

- [ ] **Step 2: Create auth.py**
Implement simple JWT generation and validation using `OAuth2PasswordBearer`.

```python
# backend/app/auth.py
import os
import jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

SECRET_KEY = os.environ.get("JWT_SECRET", "super-secret-default-key-change-me")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    return username
```

- [ ] **Step 3: Add Login Endpoint**
In `backend/app/main.py`, add the login route.

```python
# backend/app/main.py (add to imports and bottom)
from fastapi.security import OAuth2PasswordRequestForm
from .auth import create_access_token

@app.post("/api/auth/login", response_model=auth.Token, tags=["auth"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    admin_user = os.environ.get("ADMIN_USER", "admin")
    admin_pass = os.environ.get("ADMIN_PASS", "password123")
    
    if form_data.username != admin_user or form_data.password != admin_pass:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": admin_user})
    return {"access_token": access_token, "token_type": "bearer"}
```

- [ ] **Step 4: Secure the Routers**
In `admin.py`, `items.py`, and `inventory.py`, add the `Depends(get_current_user)` requirement to all endpoints.
Example for `items.py`:
```python
from ..auth import get_current_user

@router.get("/")
async def list_items(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
   # ...
```

- [ ] **Step 5: Commit**

```bash
git add backend/requirements.txt backend/app/auth.py backend/app/main.py backend/app/routers/
git commit -m "feat(auth): implement JWT authentication for all backend API routes"
```

---

### Task 3: Frontend Login View & Auth Interceptor

**Files:**
- Create: `frontend/src/views/LoginView.tsx`
- Create: `frontend/src/views/LoginView.css`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create LoginView component**

```tsx
// frontend/src/views/LoginView.tsx
import React, { useState } from 'react';
import './LoginView.css';

interface LoginProps {
  onLogin: (token: string) => void;
}

const LoginView: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.access_token);
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Server unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container glass">
      <div className="login-card">
        <h1>Auction Master</h1>
        <p>Secure ERP Access</p>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          {error && <div className="error-text">{error}</div>}
          <button type="submit" disabled={loading} className="action-btn primary">
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
```

- [ ] **Step 2: Add LoginView styles**
```css
/* frontend/src/views/LoginView.css */
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
}

.login-card {
  background: var(--surface-color);
  padding: 3rem;
  border-radius: 12px;
  box-shadow: var(--shadow-deep);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.login-card p {
  color: var(--text-dim);
  margin-bottom: 2rem;
}

.login-card form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-card input {
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0,0,0,0.2);
  color: var(--text-main);
}

.error-text {
  color: var(--danger-color);
  font-size: 0.85rem;
}
```

- [ ] **Step 3: Update App.tsx to protect routes**
Add global state for the JWT token. If no token exists, render the `LoginView`. Otherwise, render the `app-shell`.

```tsx
// frontend/src/App.tsx (Update)
import LoginView from './views/LoginView';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('am_token'));
  // ... other states

  const handleLogin = (newToken: string) => {
    localStorage.setItem('am_token', newToken);
    setToken(newToken);
  };

  if (!token) {
    return <LoginView onLogin={handleLogin} />;
  }

  // ... rest of App shell (ensure all fetch calls in child views are updated to pass `Authorization: Bearer ${token}`)
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/views/LoginView.tsx frontend/src/views/LoginView.css frontend/src/App.tsx
git commit -m "feat(frontend): implement Login View and secure app shell"
```
