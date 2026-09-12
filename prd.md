# PRD — A4: Auth Login & Protect (JavaScript Lane)

## 1. Overview
Add authentication and route protection to your API using **Supabase Auth** as the Identity Provider (IdP). Users sign up and log in through Supabase, receive a JWT **access token**, and present it via the `Authorization: Bearer <token>` header to access protected routes. Document and test the flow in **Swagger UI**, then publish to GitHub.

## 2. Goal
- Users can sign up and log in via Supabase Auth.
- Protected routes verify the JWT before granting access.
- Auth logic is centralized in reusable middleware, not duplicated per route.
- Swagger UI at `/docs` supports Bearer token authorization for testing.
- Secrets never reach GitHub; README lets a peer run the project in under 5 minutes.

## 3. Tech Stack
- **Runtime:** Node.js
- **Framework:** Next.js
- **Auth SDK:** `@supabase/supabase-js`
- **API docs:** `swagger-ui-express` + `openapi.json`
- **Version control:** Git / GitHub

## 4. The Trust Triangle (architecture)
```
Client --(email/password)--> Supabase (IdP) --(JWT)--> Client
Client --(Authorization: Bearer <JWT>)--> Your Backend
Your Backend --(verify token via Supabase SDK)--> Grant/Deny access
```
Your server never stores passwords or issues its own tokens — Supabase owns identity; your server only verifies tokens it's handed.

## 5. Environment Configuration

**`.env`** (gitignored):
```
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
PORT=3000
```
**Never commit `.env` or any Supabase keys.**

## 6. API Contract

| Method | Route | Auth required | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | No | Create a new user account |
| POST | `/auth/login` | No | Authenticate user, return JWT |
| POST | `/auth/logout` | Yes (Bearer) | Terminate the user session |
| GET | `/protected/profile` | Yes (Bearer) | Read private user profile data |
| GET | `/protected/dashboard` | Yes (Bearer) | Second protected route, proves middleware reusability |
| GET | `/public/info` | No | Read public, unprotected data |

### Status codes (must be exact)
| Code | Scenario |
|---|---|
| 200 | Successful login / successful read (profile, public info) |
| 201 | Successful signup |
| 204 | Successful logout |
| 400 | Missing/invalid input (e.g. missing email or password) |
| 401 | Missing, malformed, incorrect, or expired token / bad login credentials |

## 7. Implementation Stages

### Stage 0 — Setup Supabase & Server
- Create a Supabase project; grab Project URL + Anon Key from Project Settings → API.
- Create `.env` with `SUPABASE_URL`, `SUPABASE_KEY`, `PORT`.
- Install Next.js + `@supabase/supabase-js`.
- Initialize the Supabase client from env vars; server logs a clear startup message.
- **Checkpoint:** server starts, logs `"Server running and connected to Supabase"`, no errors.
- **Commit:** `Stage 0: setup server and supabase client`

### Stage 1 — Open Auth: Sign Up & Log In
- `POST /auth/signup`: validate body (`email`, `password`) → 400 if missing → call `supabase.auth.signUp()` → 201 + user object on success.
- `POST /auth/login`: validate body → 400 if missing → call `supabase.auth.signInWithPassword()` → 401 + `{ "error": "Invalid login credentials" }` on auth failure → 200 + access token + refresh token on success.
- **Checkpoint:** `curl` signup returns 201; login returns an `access_token` string.
- **Commit:** `Stage 1: signup and login routes working`

### Stage 2 — Public & Protected Gates (unverified)
- `GET /public/info` → 200, no auth, returns a static welcome message.
- `GET /protected/profile` → extract token from `Authorization: Bearer <token>`; if header is missing/malformed/empty → 401 + `{ "error": "Access token required" }`.
- **Checkpoint:** `/public/info` → 200; `/protected/profile` (no token) → 401.
- **Commit:** `Stage 2: public route and unverified protected route`

### Stage 3 — The Guard: Token Verification
- In `GET /protected/profile`, call `supabase.auth.getUser(token)` to verify.
- Invalid/expired/tampered token → 401 + `{ "error": "Invalid or expired token" }`.
- Valid token → 200 + user metadata (ID, email, created-at).
- **Checkpoint:** valid token → 200 + user details; mutate one character of the token → 401.
- **Commit:** `Stage 3: profile route token verification`

### Stage 4 — Middleware Protection & Logout
- Extract token verification into a reusable **middleware** function.
- Apply middleware to `GET /protected/profile`.
- Add `GET /protected/dashboard` using the same middleware, to prove reusability.
- `POST /auth/logout`: protected route, calls `supabase.auth.signOut(token)`, returns 204.
- **Checkpoint:** both protected routes reject invalid tokens and accept valid ones via the same middleware.
- **Commit:** `Stage 4: auth middleware and logout endpoint`

### Stage 5 — Swagger UI
- Define a `securitySchemes` block (`type: http`, `scheme: bearer`) in `openapi.json`.
- Link `/protected/*` endpoints to this security scheme.
- Serve via `swagger-ui-express` at `/docs`.
- Test: click "Authorize," paste JWT, "Try it out" on `/protected/profile`.
- Take a screenshot for the README.
- **Checkpoint:** `/docs` shows a lock icon on protected routes; authorize + test succeeds.
- **Commit:** `Stage 5: Swagger UI documentation with bearer auth`

### Stage 6 — Publish to GitHub
- Public repo; `.env` in `.gitignore`; **no secrets committed, ever**.
- README includes:
  - Project description
  - Local env var setup instructions
  - How to run the project
  - API reference table (endpoint, method, auth required Y/N)
  - Swagger UI screenshot
- **Checkpoint:** a peer can clone, plug in their own `.env`, and run it in under 5 minutes.
- **Commit:** `Stage 6: publish to GitHub and write README`

### ★ Stage 7 — Bonus: The AI Rematch (optional)
- From memory, write a prompt specifying: frameworks, Supabase auth integration, all six routes, exact status codes (401 vs 400 vs 201), middleware-based token verification, and Swagger UI.
- Generate code in a separate folder; run Stage 3 and Stage 4 checkpoints against it.
- Add an "AI vs Me" README section covering:
  - Did it correctly parse the `Bearer ` prefix?
  - Any security flaws (e.g. unsafe handling of invalid tokens)?
  - What your prompt missed vs. what the AI assumed.

## 8. Definition of Done (acceptance criteria)
- [ ] Server starts locally with a single documented command
- [ ] `.env` used correctly; `.gitignore` prevents it from being pushed
- [ ] `POST /auth/signup` and `POST /auth/login` work against Supabase Auth
- [ ] `GET /protected/profile` extracts and verifies the bearer token
- [ ] Status codes exact: 201 signup, 200 login/read, 204 logout, 400 missing input, 401 bad/missing/expired token
- [ ] Token verification extracted into reusable middleware, applied to ≥2 protected routes
- [ ] Swagger UI at `/docs` with working Bearer auth
- [ ] Public GitHub repo, ≥6 clean commits, comprehensive README with API table + screenshot

## 9. Non-Goals
- No custom password hashing or JWT signing — Supabase handles this
- No role-based access control beyond "authenticated vs not" (no admin roles in this assignment)
- No frontend UI — this is API-only (Swagger UI is for testing/docs, not a client app)

## 10. Suggested File Structure
```
project/
├── .env                      # gitignored
├── .gitignore
├── openapi.json              # Swagger/OpenAPI spec with bearer securityScheme
├── pages/api/ (or app routes) # Next.js route handlers
│   ├── auth/
│   │   ├── signup.js
│   │   ├── login.js
│   │   └── logout.js
│   ├── protected/
│   │   ├── profile.js
│   │   └── dashboard.js
│   └── public/
│       └── info.js
├── lib/
│   ├── supabaseClient.js     # initialized Supabase client
│   └── middleware/
│       └── requireAuth.js    # reusable bearer-token verification middleware
├── package.json
└── README.md
```
