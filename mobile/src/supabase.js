import { saveSession, getSession, clearSession } from './session';

export const SUPABASE_URL = 'https://kehkxgouyjceypxmtvip.supabase.co';
export const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlaGt4Z291eWpjZXlweG10dmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MjY0MTAsImV4cCI6MjA5MjEwMjQxMH0.MV72tv-63uoV-cBEa0aCF5rgfR4BKufQO1F7zKwjvd8';

export const EMAIL_REDIRECT_URL = 'https://cevoka.github.io/todo-app/';
const TODOS_URL = `${SUPABASE_URL}/rest/v1/todos`;

function headers(token) {
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${token || ANON_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

async function request(method, url, body, token) {
  const res = await fetch(url, {
    method,
    headers: headers(token),
    body: body ? JSON.stringify(body) : null,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.error_description || data?.message || data?.msg || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// ── Auth ───────────────────────────────────────────────────
export async function signUp(email, password) {
  return request('POST', `${SUPABASE_URL}/auth/v1/signup`, {
    email,
    password,
    options: { emailRedirectTo: EMAIL_REDIRECT_URL },
  });
}

export async function signIn(email, password) {
  const data = await request('POST', `${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    email,
    password,
  });
  await saveSession(data);
  return data;
}

export async function signOut() {
  const session = await getSession();
  try {
    if (session?.access_token) {
      await request('POST', `${SUPABASE_URL}/auth/v1/logout`, {}, session.access_token);
    }
  } catch (_) {}
  await clearSession();
}

export async function restoreSession() {
  const session = await getSession();
  if (!session) return null;
  if (Date.now() < session.expires_at - 60000) return session.access_token;
  try {
    const data = await request('POST', `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      refresh_token: session.refresh_token,
    });
    await saveSession(data);
    return data.access_token;
  } catch (_) {
    await clearSession();
    return null;
  }
}

// ── Todos CRUD ─────────────────────────────────────────────
export async function listTodos(token) {
  return request('GET', `${TODOS_URL}?order=created_at.asc`, null, token);
}

export async function createTodo(token, text) {
  const [row] = await request('POST', TODOS_URL, { text, done: false }, token);
  return row;
}

export async function updateTodo(token, id, patch) {
  return request('PATCH', `${TODOS_URL}?id=eq.${id}`, patch, token);
}

export async function deleteTodo(token, id) {
  return request('DELETE', `${TODOS_URL}?id=eq.${id}`, null, token);
}

export async function deleteDoneTodos(token) {
  return request('DELETE', `${TODOS_URL}?done=eq.true`, null, token);
}
