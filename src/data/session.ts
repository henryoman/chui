import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const sessionFilePath = join(homedir(), ".chui", "session-token");
const shouldPersistSession = process.env.CHUI_PERSIST_SESSION !== "0";
const activeSessionScope = process.env.CHUI_DEV_SESSION_SCOPE?.trim() || null;

type SessionState = {
  convexToken: string | null;
  sessionToken: string | null;
  sessionScope?: string | null;
};

type SessionGlobal = {
  __chuiSessionState?: SessionState;
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
      sessionScope?: unknown;
    };
    return {
      convexToken: typeof parsed.convexToken === "string" ? parsed.convexToken : null,
      sessionToken: typeof parsed.sessionToken === "string" ? parsed.sessionToken : null,
      sessionScope: typeof parsed.sessionScope === "string" ? parsed.sessionScope : null,
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

const sessionGlobal = globalThis as typeof globalThis & SessionGlobal;
const resolveInitialState = (): SessionState => {
  if (sessionGlobal.__chuiSessionState) {
    return sessionGlobal.__chuiSessionState;
  }
  if (!shouldPersistSession) {
    return { convexToken: null, sessionToken: null, sessionScope: activeSessionScope };
  }
  const persisted = readPersistedSession();
  if (activeSessionScope && persisted.sessionScope !== activeSessionScope) {
    return { convexToken: null, sessionToken: null, sessionScope: activeSessionScope };
  }
  return {
    convexToken: persisted.convexToken,
    sessionToken: persisted.sessionToken,
    sessionScope: activeSessionScope ?? persisted.sessionScope ?? null,
  };
};
const initialState = resolveInitialState();

sessionGlobal.__chuiSessionState = initialState;

let authToken: string | null = initialState.convexToken;
let authSessionToken: string | null = initialState.sessionToken;

const syncGlobalState = () => {
  sessionGlobal.__chuiSessionState = {
    convexToken: authToken,
    sessionToken: authSessionToken,
    sessionScope: activeSessionScope,
  };
};

export const getAuthToken = () => authToken;
export const getSessionToken = () => authSessionToken;

export const setAuthToken = (token: string, sessionToken?: string | null) => {
  authToken = token;
  authSessionToken = sessionToken ?? authSessionToken;
  syncGlobalState();
  if (shouldPersistSession) {
    persistSession({
      convexToken: authToken,
      sessionToken: authSessionToken,
      sessionScope: activeSessionScope,
    });
  }
};

export const clearAuthToken = () => {
  authToken = null;
  authSessionToken = null;
  syncGlobalState();
  clearPersistedToken();
};
