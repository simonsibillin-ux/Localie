import sb from './supabase.js';

export async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/login.html' }
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

// Detect device type based on screen width
export function getDeviceType() {
  return window.innerWidth >= 768 ? 'desktop' : 'mobile';
}

// Get correct dashboard URL based on user type and device
export function getDashboardUrl(userType) {
  const isDesktop = getDeviceType() === 'desktop';
  if (userType === 'provider') {
    return isDesktop ? '/dashboard-provider-web.html' : '/dashboard-provider.html';
  } else if (userType === 'admin') {
    return '/dashboard-admin.html';
  } else {
    return isDesktop ? '/dashboard-customer-web.html' : '/dashboard-customer.html';
  }
}

// Redirect to correct dashboard based on user type and device
export async function redirectToDashboard() {
  const user = await getUser();
  if (!user) return;
  // Try to get user_type from metadata, fallback to localStorage for existing users
  let userType = user.user_metadata?.user_type;
  if (!userType) {
    userType = localStorage.getItem('selectedUserType');
  }
  localStorage.removeItem('selectedUserType');
  window.location.href = getDashboardUrl(userType);
}
