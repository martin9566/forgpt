import "dotenv/config";
import crypto from "node:crypto";
import { promisify } from "node:util";
import express from "express";
import { rateLimit } from "express-rate-limit";
import pg from "pg";
import {
  AGE_GROUPS,
  BENEFIT_CATEGORIES,
  CURRENT_STATUSES,
  INCOME_BANDS,
  SOCIAL_CATEGORIES,
  STATES_AND_TERRITORIES,
} from "../shared/profile-options.js";
import { ELIGIBILITY_SCHEMES, evaluateEligibility } from "../shared/eligibility-schemes.js";

const { Pool } = pg;
const scrypt = promisify(crypto.scrypt);
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set to start the authentication API.");
}

const pool = new Pool({ connectionString: databaseUrl });
const app = express();
const port = Number(process.env.API_PORT || 3001);
const sessionCookieName = "schemefinder_session";
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
let dummyPasswordHash;

function hashPassword(password, salt) {
  return scrypt(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
}

async function verifyPassword(password, passwordHash) {
  const [algorithm, salt, expectedHex] = passwordHash.split("$");

  if (
    algorithm !== "scrypt" ||
    !/^[\da-f]{32}$/.test(salt) ||
    !/^[\da-f]{128}$/.test(expectedHex)
  ) {
    return false;
  }

  const expected = Buffer.from(expectedHex, "hex");
  const actual = await hashPassword(password, salt);

  return crypto.timingSafeEqual(actual, expected);
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function getSessionToken(request) {
  const cookie = request.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookieName}=`));
  const token = cookie?.slice(sessionCookieName.length + 1);

  return token && /^[\w-]{43}$/.test(token) ? token : null;
}

async function createSession(response, userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + sessionDurationMs);

  await pool.query("DELETE FROM sessions WHERE user_id = $1 AND expires_at <= now()", [userId]);
  await pool.query(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [tokenHash, userId, expiresAt],
  );
  response.cookie(sessionCookieName, token, {
    ...sessionCookieOptions(),
    maxAge: sessionDurationMs,
  });
}

async function requireAuth(request, response, next) {
  const token = getSessionToken(request);

  if (!token) {
    return response.status(401).json({ error: "Please sign in to continue." });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const result = await pool.query(
      `SELECT users.id, users.name, users.email
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = $1 AND sessions.expires_at > now()`,
      [tokenHash],
    );

    if (!result.rows[0]) {
      response.clearCookie(sessionCookieName, sessionCookieOptions());
      return response.status(401).json({ error: "Your session has expired." });
    }

    request.authUser = result.rows[0];
    return next();
  } catch (error) {
    console.error("Authentication check failed:", error);
    return response.status(500).json({
      error: "Unable to verify your session right now.",
    });
  }
}

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post(
  "/api/auth/signup",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many signup attempts. Please try again later." },
  }),
  async (request, response) => {
    const { name, email, password } = request.body ?? {};

    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
      return response.status(400).json({
        error: "Enter your full name (up to 100 characters).",
      });
    }

    if (
      typeof email !== "string" ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return response.status(400).json({ error: "Enter a valid email address." });
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return response.status(400).json({
        error: "Password must be between 8 and 128 characters.",
      });
    }

    const salt = crypto.randomBytes(16).toString("hex");

    try {
      const derivedKey = await scrypt(password, salt, 64, {
        N: 16384,
        r: 8,
        p: 1,
        maxmem: 64 * 1024 * 1024,
      });
      const passwordHash = `scrypt$${salt}$${derivedKey.toString("hex")}`;
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, created_at`,
        [name.trim(), email.trim().toLowerCase(), passwordHash],
      );
      const user = result.rows[0];

      return response.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      if (error.code === "23505") {
        return response.status(409).json({
          error: "An account with this email address already exists.",
        });
      }

      console.error("Account creation failed:", error);
      return response.status(500).json({
        error: "Unable to create your account right now. Please try again later.",
      });
    }
  },
);

app.post(
  "/api/auth/signin",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many sign-in attempts. Please try again later." },
  }),
  async (request, response) => {
    const { email, password } = request.body ?? {};

    if (
      typeof email !== "string" ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return response.status(400).json({
        error: "Enter a valid email address and password.",
      });
    }

    try {
      const result = await pool.query(
        `SELECT id, name, email, password_hash
         FROM users
         WHERE email = $1`,
        [email.trim().toLowerCase()],
      );
      const user = result.rows[0];
      const passwordHash = user?.password_hash ?? dummyPasswordHash;
      const passwordMatches = await verifyPassword(password, passwordHash);

      if (!user || !passwordMatches) {
        return response.status(401).json({ error: "Invalid email or password." });
      }

      await createSession(response, user.id);
      return response.json({
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (error) {
      console.error("Sign-in failed:", error);
      return response.status(500).json({
        error: "Unable to sign in right now. Please try again later.",
      });
    }
  },
);

app.get("/api/auth/me", async (request, response) => {
  const token = getSessionToken(request);

  if (!token) {
    return response.status(401).json({ error: "You are not signed in." });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const result = await pool.query(
      `SELECT users.id, users.name, users.email
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = $1 AND sessions.expires_at > now()`,
      [tokenHash],
    );
    const user = result.rows[0];

    if (!user) {
      response.clearCookie(sessionCookieName, sessionCookieOptions());
      return response.status(401).json({ error: "Your session has expired." });
    }

    return response.json({ user });
  } catch (error) {
    console.error("Session lookup failed:", error);
    return response.status(500).json({
      error: "Unable to verify your session right now.",
    });
  }
});

app.post("/api/auth/signout", async (request, response) => {
  const token = getSessionToken(request);

  try {
    if (token) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
    }

    response.clearCookie(sessionCookieName, sessionCookieOptions());
    return response.status(204).end();
  } catch (error) {
    console.error("Sign-out failed:", error);
    return response.status(500).json({
      error: "Unable to sign out right now. Please try again later.",
    });
  }
});

app.get("/api/profile", requireAuth, async (request, response) => {
  try {
    const result = await pool.query(
      `SELECT state, district, age_group, date_of_birth, category, current_status,
              income_band, benefit_categories
       FROM user_profiles
       WHERE user_id = $1`,
      [request.authUser.id],
    );

    return response.json({ profile: result.rows[0] ?? null });
  } catch (error) {
    console.error("Profile lookup failed:", error);
    return response.status(500).json({
      error: "Unable to load your profile right now.",
    });
  }
});

app.put("/api/profile", requireAuth, async (request, response) => {
  const {
    state,
    district,
    ageGroup,
    dateOfBirth,
    category,
    currentStatus,
    incomeBand,
    benefitCategories,
  } = request.body ?? {};
  const validAgeGroup = AGE_GROUPS.some((option) => option.value === ageGroup);
  const validDateOfBirth =
    typeof dateOfBirth === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) &&
    !Number.isNaN(Date.parse(`${dateOfBirth}T00:00:00Z`)) &&
    new Date(`${dateOfBirth}T00:00:00Z`).toISOString().slice(0, 10) === dateOfBirth &&
    dateOfBirth <= new Date().toISOString().slice(0, 10);
  const validAgeSelection =
    (validAgeGroup && !dateOfBirth) || (!ageGroup && validDateOfBirth);
  const validBenefits =
    Array.isArray(benefitCategories) &&
    benefitCategories.length > 0 &&
    benefitCategories.length <= BENEFIT_CATEGORIES.length &&
    new Set(benefitCategories).size === benefitCategories.length &&
    benefitCategories.every((category) =>
      BENEFIT_CATEGORIES.some((option) => option.value === category),
    );

  if (
    typeof state !== "string" ||
    !STATES_AND_TERRITORIES.includes(state) ||
    (district !== undefined &&
      district !== null &&
      (typeof district !== "string" || district.trim().length > 100)) ||
    !validAgeSelection ||
    !SOCIAL_CATEGORIES.some((option) => option.value === category) ||
    !CURRENT_STATUSES.some((option) => option.value === currentStatus) ||
    !INCOME_BANDS.some((option) => option.value === incomeBand) ||
    !validBenefits
  ) {
    return response.status(400).json({
      error: "Check your answers and complete each required field.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_profiles (
         user_id, state, district, age_group, date_of_birth, category, current_status,
         income_band, benefit_categories, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
       ON CONFLICT (user_id) DO UPDATE SET
         state = EXCLUDED.state,
         district = EXCLUDED.district,
         age_group = EXCLUDED.age_group,
         date_of_birth = EXCLUDED.date_of_birth,
         category = EXCLUDED.category,
         current_status = EXCLUDED.current_status,
         income_band = EXCLUDED.income_band,
         benefit_categories = EXCLUDED.benefit_categories,
         updated_at = now()
       RETURNING state, district, age_group, date_of_birth, category, current_status,
                 income_band, benefit_categories`,
      [
        request.authUser.id,
        state,
        district?.trim() || null,
        ageGroup || null,
        dateOfBirth || null,
        category,
        currentStatus,
        incomeBand,
        benefitCategories,
      ],
    );

    return response.json({ profile: result.rows[0] });
  } catch (error) {
    console.error("Profile save failed:", error);
    return response.status(500).json({
      error: "Unable to save your profile right now.",
    });
  }
});

app.post(
  "/api/chat",
  requireAuth,
  rateLimit({
    windowMs: 60 * 1000,
    limit: 12,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "You’re sending messages too quickly. Please wait a moment." },
  }),
  async (request, response) => {
    const { question } = request.body ?? {};

    if (typeof question !== "string" || !question.trim() || question.trim().length > 2000) {
      return response.status(400).json({
        error: "Enter a question up to 2,000 characters long.",
      });
    }

    const ragServiceUrl = process.env.RAG_SERVICE_URL || "http://127.0.0.1:3002";
    const ragRequestController = new AbortController();
    response.on("close", () => {
      if (!response.writableEnded) {
        ragRequestController.abort();
      }
    });

    try {
      const ragResponse = await fetch(`${ragServiceUrl}/answer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
        signal: ragRequestController.signal,
      });
      const result = await ragResponse.json();

      return response.status(ragResponse.status).json(result);
    } catch (error) {
      if (ragRequestController.signal.aborted || response.destroyed) {
        return;
      }
      console.error("RAG service request failed:", error);
      return response.status(503).json({
        error: "The scheme assistant is unavailable. Start the RAG service and try again.",
      });
    }
  },
);

app.post(
  "/api/contact",
  requireAuth,
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many contact messages. Please try again later." },
  }),
  async (request, response) => {
    const { name, email, message } = request.body ?? {};
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanMessage = typeof message === "string" ? message.trim() : "";

    if (!cleanName || cleanName.length > 100) {
      return response.status(400).json({ error: "Enter your name (up to 100 characters)." });
    }
    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return response.status(400).json({ error: "Enter a valid email address." });
    }
    if (cleanMessage.length < 5 || cleanMessage.length > 2000) {
      return response.status(400).json({ error: "Your message must be between 5 and 2,000 characters." });
    }

    try {
      await pool.query(
        `INSERT INTO contact_messages (user_id, name, email, message)
         VALUES ($1, $2, $3, $4)`,
        [request.authUser.id, cleanName, cleanEmail, cleanMessage],
      );
      return response.status(201).json({ message: "Your message has been submitted." });
    } catch (error) {
      console.error("Contact message submission failed:", error);
      return response.status(500).json({ error: "Unable to submit your message right now." });
    }
  },
);

app.post(
  "/api/eligibility/check",
  requireAuth,
  rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Please wait a moment before checking eligibility again." },
  }),
  (request, response) => {
    const { schemeId, answers } = request.body ?? {};
    const knownScheme = ELIGIBILITY_SCHEMES.some((scheme) => scheme.id === schemeId);

    if (
      !knownScheme ||
      !answers ||
      typeof answers !== "object" ||
      Array.isArray(answers)
    ) {
      return response.status(400).json({ error: "Choose a supported scheme and complete its questions." });
    }

    const result = evaluateEligibility(schemeId, answers);
    if (result?.decision === "invalid_answers") {
      return response.status(400).json({ error: result.reasons[0] });
    }

    return response.json({ result });
  },
);

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "API endpoint not found." });
});

app.use((error, _request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ error: "Request body must be valid JSON." });
  }

  console.error("API request failed:", error);
  return response.status(500).json({ error: "An unexpected server error occurred." });
});

async function start() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name varchar(100) NOT NULL,
      email varchar(254) NOT NULL UNIQUE,
      password_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id bigserial PRIMARY KEY,
      user_id uuid REFERENCES users(id) ON DELETE SET NULL,
      name varchar(100) NOT NULL,
      email varchar(254) NOT NULL,
      message text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash varchar(64) PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL
    )
  `);
  await pool.query(
    "CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)",
  );
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      state varchar(80) NOT NULL,
      district varchar(100),
      age_group varchar(20),
      date_of_birth date,
      current_status varchar(40) NOT NULL,
      income_band varchar(30) NOT NULL,
      benefit_categories text[] NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now(),
      CHECK ((age_group IS NOT NULL) <> (date_of_birth IS NOT NULL))
    )
  `);
  await pool.query(
    "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS category varchar(20)",
  );
  const dummySalt = crypto.randomBytes(16).toString("hex");
  const dummyDerivedKey = await hashPassword("not-a-real-password", dummySalt);
  dummyPasswordHash = `scrypt$${dummySalt}$${dummyDerivedKey.toString("hex")}`;

  app.listen(port, () => {
    console.log(`Signup API listening on http://localhost:${port}`);
  });
}

start().catch(async (error) => {
  console.error("Unable to start signup API:", error);
  await pool.end();
  process.exitCode = 1;
});
