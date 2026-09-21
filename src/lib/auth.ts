import { supabase } from './supabase';

export interface SignUpPayload {
  email: string;
  password: string;
  username: string;
  fullName: string;
  nim: string;
}

export interface SignInPayload {
  identifier: string;
  password: string;
}

/**
 * Sign up a new user with Supabase Auth and insert their profile.
 */
export async function signUp({ email, password, username, fullName, nim }: SignUpPayload) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase client not initialized. Check environment variables.' } };
  }

  // 1. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { data: null, error: { message: authError.message } };
  }

  const user = authData.user;
  if (!user) {
    return { data: null, error: { message: 'Sign-up succeeded but no user was returned.' } };
  }

  // 2. Immediately sign in to establish an active session so auth.uid() is
  //    populated for the RLS policy on the profiles table.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { data: null, error: { message: `Account created but session could not be established: ${signInError.message}` } };
  }

  // 3. Insert profile row — session is now active, RLS can see auth.uid()
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email,
      username,
      full_name: fullName,
      nim,
    });

  if (profileError) {
    return { data: null, error: { message: `Account created but profile insert failed: ${profileError.message}` } };
  }

  // 4. Sign out so the user can log in fresh from the login page
  await supabase.auth.signOut();

  return { data: authData, error: null };
}

/**
 * Sign in with an identifier (email, username, NIM, or full name) and password.
 * If the identifier is not an email, we look up the matching email from the profiles table first.
 */
export async function signIn({ identifier, password }: SignInPayload) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase client not initialized. Check environment variables.' } };
  }

  let email = identifier.trim();

  // If the identifier doesn't contain '@', resolve the email from profiles
  if (!email.includes('@')) {
    const { data: profile, error: lookupError } = await supabase
      .from('profiles')
      .select('email')
      .or(`username.eq.${email},nim.eq.${email},full_name.eq.${email}`)
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error('[auth] profiles lookup error:', lookupError);
      // Distinguish RLS / permission errors from network errors
      const isPermissionError =
        lookupError.code === 'PGRST116' ||
        lookupError.code === '42501' ||
        lookupError.message?.toLowerCase().includes('permission') ||
        lookupError.message?.toLowerCase().includes('policy') ||
        lookupError.message?.toLowerCase().includes('rls');

      if (isPermissionError) {
        return {
          data: null,
          error: {
            message:
              'Akses ke data profil ditolak. Silakan login menggunakan email lengkap (@student.unram.ac.id).',
          },
        };
      }

      return {
        data: null,
        error: {
          message: `Gagal mencari akun: ${lookupError.message || 'Coba lagi dalam beberapa saat.'}`,
        },
      };
    }

    if (!profile) {
      return { data: null, error: { message: 'Akun tidak ditemukan. Periksa username / NIM Anda.' } };
    }

    email = profile.email;
  }

  // Now sign in with the resolved email
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data, error: null };
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  if (!supabase) {
    return { error: { message: 'Supabase client not initialized.' } };
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}
