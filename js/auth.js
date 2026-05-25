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
  sessionStorage.removeItem('redirectGuard');
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
  const width = document.documentElement.clientWidth || window.innerWidth;
  return width >= 768 ? 'desktop' : 'mobile';
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

// Get user profile from profiles table
export async function getUserProfile() {
  const user = await getUser();
  if (!user) return null;
  const { data, error } = await sb.from('profiles').select('*').eq('id', user.id).single();
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

// Create or update user profile
export async function upsertProfile(fullName, location, isCustomer = true, isProvider = false) {
  const user = await getUser();
  if (!user) return null;
  const { data, error } = await sb.from('profiles').upsert({
    id: user.id,
    full_name: fullName,
    location: location || null,
    is_customer: isCustomer,
    is_provider: isProvider,
    is_admin: false
  }).select().single();
  if (error) {
    console.error('Error upserting profile:', error);
    return null;
  }
  return data;
}

// Redirect to correct dashboard based on profile roles
export async function redirectToDashboard() {
  const user = await getUser();
  if (!user) return;
  const profile = await getUserProfile();

  if (!profile) {
    window.location.href = '/login.html';
    return;
  }

  // Admin goes straight to admin dashboard
  if (profile.is_admin) {
    window.location.href = '/dashboard-admin.html';
    return;
  }

  // Both roles: show role selector
  if (profile.is_provider && profile.is_customer) {
    window.location.href = '/dashboard-select.html';
    return;
  }

  // Provider only
  if (profile.is_provider) {
    const isDesktop = getDeviceType() === 'desktop';
    window.location.href = isDesktop ? '/dashboard-provider-web.html' : '/dashboard-provider.html';
    return;
  }

  // Customer only (default)
  const isDesktop = getDeviceType() === 'desktop';
  window.location.href = isDesktop ? '/dashboard-customer-web.html' : '/dashboard-customer.html';
}
