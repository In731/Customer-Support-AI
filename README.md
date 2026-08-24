# NexSupport AI (Support-AI)

NexSupport AI is a modern, enterprise-ready B2B platform that allows organizations to easily create, embed, and manage custom AI chatbots trained on their own data.

By simply uploading PDF documents or text snippets, businesses can generate an embeddable chat widget that provides their customers with instant, 24/7 AI-driven support using Google's Gemini models and Retrieval-Augmented Generation (RAG).

---

## 🚀 Key Features

* **Multi-Tenant Architecture:** Securely isolates data, settings, and documents between different business tenants.
* **Retrieval-Augmented Generation (RAG):** Upload PDFs or text snippets to automatically train the chatbot. Text is chunked, embedded using `gemini-embedding-001`, and searched via MongoDB Atlas Vector Search.
* **Advanced AI:** Powered by Google's incredibly fast `gemini-3.5-flash` model for high-quality conversational responses.
* **Embeddable Chat Widget:** A lightweight, cross-origin chat widget (`chatBot.js`) that businesses can embed directly into their own websites with a single `<script>` tag.
* **Enterprise Authentication:** Seamless B2B login and session management powered by Scalekit (supporting SSO, SAML, etc.).
* **Edge Rate Limiting:** Built-in IP-based rate limiting (15 requests/min) using Upstash Serverless Redis to completely eliminate malicious bot traffic and Gemini API quota exhaustion.
* **Fortified Security:** Hardened API endpoints protected against Insecure Direct Object Reference (IDOR) and Cross-Site Request Forgery (CSRF).

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, TailwindCSS, Framer Motion
* **Backend:** Next.js Serverless API Routes
* **Authentication:** Scalekit SDK
* **Database & Vector Store:** MongoDB & MongoDB Atlas Vector Search (768 dimensions)
* **Rate Limiting:** Upstash Redis (`@upstash/ratelimit`)
* **AI & Embeddings:** Google Gemini API (`@google/genai`)
* **File Processing:** `pdf-parse`

---

## 🔒 Security Posture

NexSupport AI has undergone a senior-level security audit and implements strict security controls:
1. **Server-Side Session Validation:** Client-side IDs (`ownerId`, `tenantId`) are ignored. All secure APIs extract the verified identity directly from the encrypted `access_token` cookie via the `getSession()` utility, preventing IDOR attacks.
2. **CSRF Protection:** Critical state-changing endpoints (like `/api/auth/logout`) strictly require `POST` requests.
3. **Resource Protection:** The publicly exposed `/api/chat` endpoint is shielded by an Upstash Redis Sliding Window rate limiter.

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

### 3. Environment Variables
Create a `.env.local` file in the root directory and configure the following required variables:

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
```

### 4. Database Setup
To enable the RAG pipeline, you must configure a **Vector Search Index** in your MongoDB Atlas cluster on the `knowledgechunks` collection.
- **Dimensions:** 768
- **Similarity:** cosine

### 5. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

---

## 💡 How it works

1. **Onboarding:** A business signs up via Scalekit and configures their chatbot's persona (Name, Support Email).
2. **Ingestion:** The business uploads knowledge (PDFs). The `/api/knowledge` endpoint parses the PDF using `pdf-parse`, chunking the text, and calls `gemini-embedding-001` to generate vector embeddings. These are saved to MongoDB.
3. **Integration:** The business copies the provided `<script src=".../chatBot.js"></script>` and pastes it into their website's HTML.
4. **Chatting:** When a customer asks a question, the widget sends a CORS-enabled POST request to `/api/chat`. 
5. **RAG Pipeline:** The backend rate-limits the request via Upstash, embeds the user's question, performs a MongoDB Vector Search to find the most relevant document chunks, and streams a highly contextual answer back to the user via `gemini-3.5-flash`.
