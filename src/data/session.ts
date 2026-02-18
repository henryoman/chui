import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const sessionFilePath = join(homedir(), ".chui", "session-token");

type SessionState = {
  convexToken: string | null;
  sessionToken: string | null;
};

const readPersistedSession = (): SessionState => {
  try {
    const raw = readFileSync(sessionFilePath, "utf8").trim();
    if (!raw) {
      return { convexToken: null, sessionToken: null };
    }

    if (!raw.startsWith("{")) {
      // Backward compatibility for old plain-token format.
      return { convexToken: raw, sessionToken: null };
    }

    const parsed = JSON.parse(raw) as {
      convexToken?: unknown;
      sessionToken?: unknown;
    };
    return {
      convexToken: typeof parsed.convexToken === "string" ? parsed.convexToken : null,
      sessionToken: typeof parsed.sessionToken === "string" ? parsed.sessionToken : null,
    };
  } catch {
    return { convexToken: null, sessionToken: null };
  }
};

const persistSession = (session: SessionState) => {
  try {
    mkdirSync(dirname(sessionFilePath), { recursive: true });
    writeFileSync(
      sessionFilePath,
      `${JSON.stringify(session)}\n`,
      "utf8",
    );
  } catch {
    // Ignore persistence failures; in-memory auth still works.
  }
};

const clearPersistedToken = () => {
  try {
    rmSync(sessionFilePath, { force: true });
  } catch {
    // Ignore cleanup failures.
  }
};

const persisted = readPersistedSession();
let authToken: string | null = persisted.convexToken;
let authSessionToken: string | null = persisted.sessionToken;

export const getAuthToken = () => authToken;
export const getSessionToken = () => authSessionToken;

export const setAuthToken = (token: string, sessionToken?: string | null) => {
  authToken = token;
  authSessionToken = sessionToken ?? authSessionToken;
  persistSession({
    convexToken: authToken,
    sessionToken: authSessionToken,
  });
};

export const clearAuthToken = () => {
  authToken = null;
  authSessionToken = null;
  clearPersistedToken();
};
