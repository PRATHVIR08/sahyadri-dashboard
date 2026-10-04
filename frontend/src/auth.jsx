import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { clearToken, setToken } from "./api";

const AuthContext = createContext(null);

const REQUIRED_DOMAIN = "@sahyadri.edu.in";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to validate email domain
  function validateDomain(email) {
    if (!email || !email.trim().toLowerCase().endsWith(REQUIRED_DOMAIN)) {
      throw new Error(`Only official college emails ending with ${REQUIRED_DOMAIN} are allowed.`);
    }
  }

  // Load student profile row from profiles table
  async function loadProfileData(authUser, authSession) {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.warn("Notice loading profile:", error.message);
      }

      if (profile) {
        const fullUser = {
          id: authUser.id,
          email: authUser.email,
          full_name: profile.full_name || "",
          name: profile.full_name || "", // for compatibility
          usn: profile.usn || "",
          course: profile.course || "",
          department: profile.department || "",
          year: profile.year || 1,
          semester: profile.semester || 1,
          section: profile.section || "A",
          interests: profile.interests || [],
          avatar_url: profile.avatar_url || "",
          photo_url: profile.avatar_url || "", // for compatibility
          role: profile.role || "student",
        };
        setUser(fullUser);
        setHasProfile(true);
      } else {
        // Authenticated user exists, but profile record is not yet in profiles table
        const basicUser = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || "",
          name: authUser.user_metadata?.full_name || "",
          role: "student",
        };
        setUser(basicUser);
        setHasProfile(false);
      }

      if (authSession?.access_token) {
        setToken(authSession.access_token);
        setSession(authSession);
      } else {
        clearToken();
        setSession(null);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  }

  // Refresh profile & session manually
  async function refresh() {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        await loadProfileData(currentSession.user, currentSession);
      } else {
        setUser(null);
        setSession(null);
        setHasProfile(false);
        clearToken();
        setLoading(false);
      }
    } catch (err) {
      console.error("Refresh error:", err);
      setUser(null);
      setSession(null);
      setHasProfile(false);
      clearToken();
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (active) {
          if (initialSession?.user) {
            await loadProfileData(initialSession.user, initialSession);
          } else {
            setUser(null);
            setSession(null);
            setHasProfile(false);
            clearToken();
            setLoading(false);
          }
        }
      } catch {
        if (active) {
          setUser(null);
          setSession(null);
          setHasProfile(false);
          clearToken();
          setLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!active) return;
      if (event === "SIGNED_OUT" || !currentSession?.user) {
        setUser(null);
        setSession(null);
        setHasProfile(false);
        clearToken();
        setLoading(false);
      } else if (currentSession?.user) {
        await loadProfileData(currentSession.user, currentSession);
      }
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Login handler
  async function login(email, password) {
    validateDomain(email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      const msg = error.message || "Invalid credentials.";
      const err = new Error(msg);
      if (msg.toLowerCase().includes("email not confirmed")) {
        err.code = "EMAIL_NOT_CONFIRMED";
      }
      throw err;
    }
    if (data?.user) {
      await loadProfileData(data.user, data.session);
    }
    return data;
  }

  // Register handler
  async function register(payload) {
    const email = payload.email?.trim();
    validateDomain(email);

    const name = payload.full_name || payload.name || "";
    const usn = payload.usn || "";

    const { data, error } = await supabase.auth.signUp({
      email,
      password: payload.password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      if (error.message?.toLowerCase().includes("rate limit") || error.status === 429) {
        throw new Error("Supabase email rate limit exceeded! Turn off 'Confirm email' in Supabase Dashboard -> Auth -> Providers -> Email to allow instant signups.");
      }
      throw new Error(error.message || "Signup failed.");
    }

    const authUser = data?.user;
    if (authUser) {
      const interestsArray = Array.isArray(payload.interests)
        ? payload.interests
        : typeof payload.interests === "string"
        ? payload.interests.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const profileRecord = {
        id: authUser.id,
        email,
        full_name: name,
        usn,
        course: payload.course || "B.E.",
        department: payload.department || "Information Science & Engineering",
        year: parseInt(payload.year) || 1,
        semester: parseInt(payload.semester) || 1,
        section: payload.section || "A",
        interests: interestsArray,
        avatar_url: payload.avatar_url || payload.photo_url || "",
        role: "student", // Always default to 'student', never admin
      };

      const { error: profileErr } = await supabase.from("profiles").upsert(profileRecord);
      if (profileErr) {
        console.error("Profile saving error:", profileErr.message);
      }
      if (data.session) {
        await loadProfileData(authUser, data.session);
      }
    }
    return data;
  }

  // Save/Update Profile handler
  async function saveProfile(profileData) {
    if (!user?.id) throw new Error("No authenticated user session.");

    const interestsArray = Array.isArray(profileData.interests)
      ? profileData.interests
      : typeof profileData.interests === "string"
      ? profileData.interests.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const record = {
      id: user.id,
      email: user.email,
      full_name: profileData.full_name || profileData.name || user.full_name || "",
      usn: profileData.usn || user.usn || "",
      course: profileData.course || user.course || "B.E.",
      department: profileData.department || user.department || "Information Science & Engineering",
      year: parseInt(profileData.year) || user.year || 1,
      semester: parseInt(profileData.semester) || user.semester || 1,
      section: profileData.section || user.section || "A",
      interests: interestsArray,
      avatar_url: profileData.avatar_url || profileData.photo_url || user.avatar_url || "",
      role: "student", // Always keep student
    };

    const { error } = await supabase.from("profiles").upsert(record);
    if (error) {
      if (error.message?.includes("Could not find the table")) {
        throw new Error(
          "Database table 'profiles' is missing in Supabase. Please run the SQL commands in 'supabase/schema.sql' inside your Supabase SQL Editor."
        );
      }
      throw new Error(error.message || "Failed to update profile.");
    }

    await refresh();
  }

  // Logout handler
  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setHasProfile(false);
    clearToken();
  }

  // Request Password Reset Email
  async function forgotPassword(email) {
    validateDomain(email);
    const redirectUrl = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });
    if (error) {
      throw new Error(error.message || "Failed to send password reset email.");
    }
  }

  // Resend Email Confirmation Link
  async function resendConfirmationEmail(email) {
    validateDomain(email);
    const redirectUrl = `${window.location.origin}/login`;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    if (error) {
      if (error.message?.toLowerCase().includes("rate limit") || error.status === 429) {
        throw new Error("Supabase email rate limit exceeded. Please wait a few minutes, or turn off 'Confirm email' in Supabase Dashboard.");
      }
      throw new Error(error.message || "Failed to resend confirmation email.");
    }
  }

  // Update Password
  async function resetPassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      throw new Error(error.message || "Failed to reset password.");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        hasProfile,
        login,
        register,
        saveProfile,
        logout,
        refresh,
        forgotPassword,
        resetPassword,
        resendConfirmationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
