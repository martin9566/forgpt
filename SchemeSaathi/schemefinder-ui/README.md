# SchemeSaathi

## Authentication API

The signup and sign-in forms use the Express API with PostgreSQL. It creates
the `users`, `sessions`, and `user_profiles` tables on startup, stores passwords
as scrypt hashes, and stores only hashes of session tokens in the database.

1. Create a PostgreSQL database named `schemefinder` (or choose another name).
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL
   connection string. Keep `.env` private and do not commit it.
3. Install dependencies with `npm install`.
4. In one terminal, run the API with `npm run server`.
5. In another terminal, run the frontend with `npm run dev`.

The Vite development and preview servers proxy `/api` requests to the API on
port 3001. Set `API_PORT` and `API_PROXY_TARGET` in `.env` to use another port,
keeping both values consistent.

If the browser reports `Unexpected token '<'` or says the API returned a
webpage instead of data, the frontend is receiving its HTML page instead of an
API response. Make sure `npm run server` is running, `DATABASE_URL` is set,
and restart the Vite server after changing `.env`.

`POST /api/auth/signup` accepts JSON with `name`, `email`, and `password`. It
returns `201` with the created user's public fields, `400` for invalid input,
or `409` when the email is already registered.

`POST /api/auth/signin` accepts JSON with `email` and `password`. On success it
sets a seven-day `HttpOnly`, `SameSite=Lax` session cookie and returns the
signed-in user's public fields. Invalid credentials return a generic `401`.
`GET /api/auth/me` validates the session cookie and returns the current user.
`POST /api/auth/signout` revokes the session and clears the cookie. Signup and
sign-in attempts are rate-limited.

After sign-in, the app opens the account setup page. `GET /api/profile` loads
the signed-in user's saved profile, and `PUT /api/profile` validates and saves
their state or Union Territory, optional district, age group or optional
alternative date of birth, category (General, General-EWS, OBC-NCL, SC, or ST),
current status, approximate household income band, and selected benefit
categories. Profile data is private to the authenticated account. Income bands
are profile suggestions, not universal eligibility thresholds. Existing
profiles are prompted to provide the newly added category the next time they
sign in.

After the required profile is saved, users continue to the home page. Returning
users with a complete profile go directly there on sign-in. The home navigation
includes About us, Contact us, and a profile menu for editing profile details
or signing out.

The Contact us form submits authenticated messages to `POST /api/contact`.
Messages are saved in the PostgreSQL `contact_messages` table for review and
are limited to five submissions per account per 15 minutes.

For production, configure the API and frontend behind HTTPS, set a strong
database credential through the hosting provider's secret manager, and use a
managed PostgreSQL service with backups. The session cookie is marked `Secure`
when `NODE_ENV=production`.

## Scheme document assistant (RAG)

The home page includes a document-grounded question panel. It uses the
`SchemeFinder/data/final_justice_welfare` PDFs, PyMuPDF page extraction,
LangChain `RecursiveCharacterTextSplitter` chunks of up to 1,200 characters
with 200-character overlap, `intfloat/multilingual-e5-small` embeddings, and a
hybrid vector/BM25 retriever with reciprocal-rank fusion. Gemini generates
answers from retrieved passages and includes page citations.

1. Install the Python dependencies from this folder with
   `python -m pip install -r requirements-rag.txt`.
2. Set `GEMINI_API_KEY` in `.env` (see `.env.example`). Keep the key private.
3. Run `npm run rag:server` in a terminal. The first question downloads the
   embedding model and builds an in-memory index from the final PDF folder.
4. Run `npm run server` and `npm run dev` as usual.

The RAG service indexes readable text from all PDFs in the final folder,
including Gaura Shakti, junior advocate, and National Youth Award documents.
Restart the RAG service after adding or replacing PDFs to rebuild the index.
The service does not OCR image-only documents; those need searchable text
before indexing. Answers reflect only indexed files and should be checked
against the current scheme authority.

The home page also has a preliminary eligibility checker for Mission Vatsalya
foster care, Nari Adalat, Uttarakhand free legal aid and Gaura Shakti, Haryana
domestic-violence support, Puducherry atrocity assistance, Uttarakhand women’s
victim compensation, the Madhya Pradesh police internship and crime victim
compensation schemes, and Goa child committee grants. Users can open it with
**Check eligibility** or ask “Am I eligible for [scheme]?” The checker uses
deterministic rules, returns reasons and source pages, and does not save
answers. Results are preliminary; authorities may apply current notices,
additional rules, verification, or selection. Add a reviewed scheme definition
to `shared/eligibility-schemes.js` before offering another check; do not
generate decisions directly from unstructured model output.
