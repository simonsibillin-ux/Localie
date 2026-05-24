import sb from './supabase.js';

export async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/dashboard-customer.html' }
  });
  if (error) throw error;
  return data;
}

export async function signUp(email, password, meta = {}) {
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: meta }
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await sb.auth.signOut();
  if (error) throw error;
  window.location.href = '/login.html';
}

export async function getSession() {
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

export async function getUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

export async function sendPasswordReset(email) {
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reset-password.html'
  });
  if (error) throw error;
}

// Redirect to login if no session; call on protected pages
export async function requireAuth(redirectUrl = '/login.html') {
  const session = await getSession();
  if (!session) {
    window.location.href = redirectUrl;
    return null;
  }
  return session;
}

// Redirect to correct dashboard based on user type
export async function redirectToDashboard() {
  const user = await getUser();
  if (!user) return;
  const userType = user.user_metadata?.user_type;
  if (userType === 'provider') {
    window.location.href = '/dashboard-provider.html';
  } else if (userType === 'admin') {
    window.location.href = '/dashboard-admin.html';
  } else {
    window.location.href = '/dashboard-customer.html';
  }
}
