// Lightweight client-side auth for Smart Build AI
// NOTE: Demo-only — stores users in localStorage with hashed passwords.

const USERS_KEY = "sba_users_v1";
const SESSION_KEY = "sba_session_v1";

export interface StoredUser {
  email: string;
  name: string;
  passwordHash: string;
  createdAt: number;
}
export interface Session {
  email: string;
  name: string;
  loggedInAt: number;
}

async function hash(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeUsers(u: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}

export async function signUp(email: string, name: string, password: string): Promise<Session> {
  email = email.trim().toLowerCase();
  if (!email || !password || password.length < 6) throw new Error("Password must be at least 6 characters.");
  const users = readUsers();
  if (users.find((u) => u.email === email)) throw new Error("An account with that email already exists.");
  const user: StoredUser = { email, name: name.trim() || email, passwordHash: await hash(password), createdAt: Date.now() };
  users.push(user);
  writeUsers(users);
  const session: Session = { email: user.email, name: user.name, loggedInAt: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function login(email: string, password: string): Promise<Session> {
  email = email.trim().toLowerCase();
  const users = readUsers();
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("No account found for that email.");
  if (user.passwordHash !== (await hash(password))) throw new Error("Incorrect password.");
  const session: Session = { email: user.email, name: user.name, loggedInAt: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(SESSION_KEY);
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? (JSON.parse(s) as Session) : null;
  } catch {
    return null;
  }
}
