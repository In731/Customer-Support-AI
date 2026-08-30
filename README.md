# NexSupport AI (Enterprise AI Customer Support)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%20Vector%20Search-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20%26%20Embeddings-orange?style=flat&logo=google)](https://ai.google.dev/)
[![Upstash Redis](https://img.shields.io/badge/Upstash-Rate%20Limiting-red?style=flat&logo=redis)](https://upstash.com/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-yellow?style=flat&logo=vitest)](https://vitest.dev/)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue?style=flat&logo=githubactions)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)

NexSupport AI is a modern, enterprise-ready B2B customer support platform that enables organizations to create, embed, and manage custom AI chatbots trained on their business documentation.

By uploading PDF manuals or text snippets, businesses generate an embeddable chat widget that provides their visitors with instant, 24/7 AI-driven support using Google's Gemini models and multi-tenant Retrieval-Augmented Generation (RAG).

---

## 🚀 Key Features

* **Multi-Tenant Architecture:** Securely isolates data, settings, and vector chunks across business tenants using `$vectorSearch` pre-filtering to guarantee complete data privacy.
* **Client-Side Batching Queue:** A custom React architecture that bypasses Serverless execution limits (Vercel/AWS) by chunking large PDFs on the frontend and streaming them to the Gemini API in batches, reducing server timeouts by 100%.
* **Retrieval-Augmented Generation (RAG):** Context is intelligently split using **LangChain's RecursiveCharacterTextSplitter**, vectorized using `gemini-embedding-001` (768 dimensions), and queried with cosine similarity via MongoDB Atlas Vector Search.
* **Zero-Overhead Analytics Engine:** Tracks daily query volumes, deflection rates, and detects "Knowledge Gaps" (unanswered questions) using asynchronous TTL indexing without blocking user chat responses.
* **Embeddable Chat Widget:** A lightweight, dependency-free chat widget (`chatBot.js`) featuring modern Shadcn-style UI that embeds into any website with a single `<script>` tag.
* **Enterprise Authentication:** Seamless B2B login and session management powered by Scalekit (supporting SSO, SAML, and OAuth).

---

## 🔒 Security Posture

NexSupport AI implements strict, multi-layered enterprise security controls:

1. **RFC 3986 Hostname Firewall ([`src/lib/cors.ts`](./src/lib/cors.ts)):** The chat API verifies the exact `Origin` and `Referer` hostnames against tenant-allowed domains, strictly blocking substring bypasses, sibling suffix attacks (`evil-acme.com`), and referer query smuggling.
2. **Server-Side Session Validation (Anti-IDOR):** Client-supplied tenant IDs are ignored on mutating operations. All authenticated endpoints extract identity directly from verified session tokens via the `getSession()` utility.
3. **Multi-Layered Edge Rate Limiting:** Public chat (`/api/chat`) and ingestion (`/api/knowledge`) routes are shielded by Upstash Serverless Redis Sliding Window rate limiters to eliminate DDoS and brute-force attacks.
4. **Memory DoS & Payload Bounds:** Strict backend limits (10MB buffer maximum, 20 chunks per batch) reject oversized payloads before they reach Node.js memory buffers.
5. **XSS Sanitization:** The embed widget uses `textContent` DOM insertion instead of `innerHTML`, blocking stored and reflected Cross-Site Scripting.

---

## 🛠️ Tech Stack

### Frontend & Widget
- **Framework:** Next.js (App Router) & React
- **Styling & Motion:** TailwindCSS & Framer Motion (for real-time upload progress and micro-interactions)
- **Embed Widget:** Vanilla JS (`chatBot.js`) with zero external runtime dependencies

### Backend & Infrastructure
- **API Engine:** Next.js Serverless API Routes
- **Database:** MongoDB & Mongoose (with connection pooling error-recovery in `db.ts`)
- **Vector Search:** MongoDB Atlas Vector Search (Cosine Similarity, 768 dimensions)
- **Authentication:** Scalekit SDK (B2B Multi-Tenant OAuth)
- **Rate Limiting:** Upstash Serverless Redis (`@upstash/ratelimit`)

### AI & Testing
- **LLM Engine:** Google Gemini (`gemini-3.5-flash` for generation, `gemini-embedding-001` for vectors)
- **NLP Processing:** LangChain (`RecursiveCharacterTextSplitter`) & `pdf-parse`
- **Testing & CI:** Vitest (Automated unit testing) & GitHub Actions (CI on push/PR)

---

## 🧪 Automated Testing & CI/CD

The project includes an automated test suite powered by **Vitest** and enforced via **GitHub Actions** (`.github/workflows/ci.yml`):
* **AI NLP Mathematics:** Verifies LangChain's chunking configurations (overlap bounds, max chunk sizing) to ensure text isn't truncated or corrupted.
* **CORS Firewall Threat Vectors:** Asserts that `isOriginAllowed` handles valid domains, multi-level subdomains, port normalization (`localhost:3000`), and blocks adversarial suffix injections (`evil-acme.com.attacker.net`) and URL parameter smuggling.

To run the test suite locally:
```bash
npm test
```

To run lint checks:
```bash
npm run lint
```

---

## ⚙️ Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/support-ai.git
cd support-ai/support-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URL="mongodb+srv://<user>:<password>@cluster0.mongodb.net/support-ai?retryWrites=true&w=majority"

# Google Gemini API
GEMINI_API_KEY="your_google_gemini_api_key"

# Scalekit Authentication
SCALEKIT_ENVIRONMENT_URL="your_scalekit_env_url"
SCALEKIT_CLIENT_ID="your_scalekit_client_id"
SCALEKIT_CLIENT_SECRET="your_scalekit_client_secret"

# Upstash Redis (For Rate Limiting)
UPSTASH_REDIS_REST_URL="your_upstash_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token"

# Public App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup
Configure a **Vector Search Index** in your MongoDB Atlas cluster on the `knowledgechunks` collection:
- **Index Name:** `vector_index`
- **Dimensions:** 768
- **Similarity:** cosine
- **Path:** embedding

### 5. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to access the application.

---

## 🗺️ Project Structure

```text
├── .github/workflows/
│   └── ci.yml             # Automated CI pipeline (lint + unit tests on Node 22)
├── public/
│   └── chatBot.js         # Lightweight, cross-origin embeddable chat widget
├── src/
│   ├── app/
│   │   ├── api/           # Serverless API Routes (chat, knowledge, settings, analytics, auth)
│   │   ├── dashboard/     # Tenant Management UI (Settings, Knowledge, and Analytics)
│   │   └── embed/         # Embed script snippet generator & live preview
│   ├── components/        # React Components (DashboardClient, EmbedClient, HomeClient)
│   ├── lib/               # Utilities (db.ts connection pooling, cors.ts, Scalekit session)
│   ├── model/             # Mongoose Schemas (Settings, Knowledge, Analytics)
│   └── types.d.ts         # Centralized TypeScript interfaces
├── __tests__/             # Vitest Unit Test Suites
├── LICENSE                # MIT License
```

---

## 📡 Core API Routes

- `POST /api/chat`: Public-facing, CORS-protected endpoint that handles incoming widget messages, executes RAG, and streams AI responses.
- `POST /api/knowledge`: (Phase 1 Ingestion) Parses uploaded PDFs/TXT and runs LangChain to return structured text chunks to the browser.
- `POST /api/knowledge/embed`: (Phase 2 Ingestion) Receives chunk batches from the browser queue, calls Gemini Embeddings, and bulk-inserts vectors into MongoDB.
- `GET /api/knowledge`: Retrieves a tenant's uploaded documents and chunk processing stats.
- `DELETE /api/knowledge`: Removes a document and cascades deletion of all associated vector chunks.
- `GET /api/settings/public`: Exposes safe public widget branding tokens (color, icon, welcome text) to the embed script.
- `POST /api/settings`: Updates tenant configurations, including the CORS Domain Whitelist.
- `GET /api/analytics`: Fetches real-time chat volumes, deflection metrics, and unanswered knowledge gaps.

---

## 🏗️ Architecture Diagram

```mermaid
graph TD
    User([End User]) -->|Types message| Widget[chatBot.js Widget]
    Widget -->|POST /api/chat| API[Next.js Serverless API]
    
    API -->|1. Rate Limit Check| Upstash[(Upstash Redis)]
    API -->|2. RFC Hostname Check| CORS[src/lib/cors.ts]
    API -->|3. Auth Check| DB1[(MongoDB Settings)]
    API -->|4. Embed Query| Gemini1[Google Gemini API]
    
    Gemini1 -->|Returns Vector| API
    API -->|5. $vectorSearch with tenantId| Atlas[(Atlas Vector Database)]
    
    Atlas -->|Returns Context| API
    API -->|6. Prompt Generation| Gemini2[Google Gemini API]
    
    Gemini2 -->|Streams Answer| API
    API -->|7. Async Telemetry| DB2[(MongoDB Analytics)]
    
    API -->|Sends Response| Widget
```

---

## 💡 How It Works

1. **Onboarding:** A business signs up via Scalekit and configures their chatbot's persona (Name, Support Email, and Allowed Domains).
2. **Ingestion (Batched):** The business uploads PDFs. The `/api/knowledge` endpoint parses the PDF and returns LangChain chunks. The React frontend orchestrates a Client-Side Queue, streaming batches of 5 chunks to `/api/knowledge/embed` while rendering a real-time progress bar. This guarantees 0% server timeouts.
3. **Integration:** The business copies the provided `<script src=".../chatBot.js" data-owner-id="..."></script>` and pastes it into their website's HTML.
4. **Chatting:** When a customer asks a question, the widget sends a CORS-secured POST request to `/api/chat`. 
5. **RAG Pipeline:** The backend rate-limits the request via Upstash, enforces RFC 3986 Hostname validation, embeds the user's question, performs a multi-tenant MongoDB Vector Search to find the most relevant document chunks, and returns a contextual answer via `gemini-3.5-flash`.
6. **Analytics:** The outcome of the conversation is asynchronously logged to MongoDB TTL Analytics collections without blocking the user's response.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
