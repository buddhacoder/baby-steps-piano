/* ────────────────────────────────────────────────
   supabase.js – Auth + Cloud Persistence Client
   Baby Steps Piano Lab – Milestone 4
   ──────────────────────────────────────────────── */

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let supabase = null;

/** Current auth state */
const authState = {
    user: null,
    session: null,
    ready: false,
    listeners: []
};

/* ── Bootstrap ──────────────────────────────────── */

async function initSupabase() {
    try {
        const res = await fetch("/api/config");
        if (!res.ok) throw new Error("Config endpoint unavailable");
        const cfg = await res.json();

        if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
            console.warn("[supabase] No credentials configured – running in local-only mode.");
            authState.ready = true;
            _notify();
            return;
        }

        const { createClient } = window.supabase; // loaded via CDN
        if (!createClient) {
            console.warn("[supabase] Supabase JS library not loaded – running in local-only mode.");
            authState.ready = true;
            _notify();
            return;
        }

        supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);

        supabase.auth.onAuthStateChange((_event, session) => {
            authState.session = session;
            authState.user = session?.user ?? null;
            authState.ready = true;
            _notify();
        });

        // Initial session restore
        const { data } = await supabase.auth.getSession();
        authState.session = data.session;
        authState.user = data.session?.user ?? null;
        authState.ready = true;
        _notify();
    } catch (err) {
        console.warn("[supabase] Init failed, continuing in local-only mode:", err.message);
        authState.ready = true;
        _notify();
    }
}

/* ── Auth Actions ───────────────────────────────── */

async function signInWithGoogle() {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin }
    });
    if (error) console.error("[supabase] Sign-in error:", error.message);
}

async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error("[supabase] Sign-out error:", error.message);
}

function getUser() {
    return authState.user;
}

function isSignedIn() {
    return !!authState.user;
}

/* ── Cloud Persistence ──────────────────────────── */

async function loadProgressFromCloud() {
    if (!supabase || !authState.user) return null;
    try {
        const { data, error } = await supabase
            .from("user_progress")
            .select("progress, coach_threads, lesson_stack")
            .eq("user_id", authState.user.id)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("[supabase] loadProgressFromCloud error:", error.message);
            return null;
        }
        return data; // may be null if no row yet
    } catch (err) {
        console.error("[supabase] loadProgressFromCloud exception:", err.message);
        return null;
    }
}

async function saveProgressToCloud(progress, coachThreads, lessonStack) {
    if (!supabase || !authState.user) return;
    try {
        const { error } = await supabase
            .from("user_progress")
            .upsert({
                user_id: authState.user.id,
                progress: progress,
                coach_threads: coachThreads,
                lesson_stack: lessonStack,
                updated_at: new Date().toISOString()
            }, { onConflict: "user_id" });

        if (error) console.error("[supabase] saveProgressToCloud error:", error.message);
    } catch (err) {
        console.error("[supabase] saveProgressToCloud exception:", err.message);
    }
}

async function migrateLocalToCloud(localProgress, localThreads, localStack) {
    if (!supabase || !authState.user) return false;
    try {
        // Check if cloud already has data
        const existing = await loadProgressFromCloud();
        if (existing && existing.progress && Object.keys(existing.progress).length > 0) {
            console.log("[supabase] Cloud data exists – skipping migration.");
            return false;
        }

        // Upload local data to cloud
        await saveProgressToCloud(localProgress, localThreads, localStack);
        console.log("[supabase] Local data migrated to cloud.");
        return true;
    } catch (err) {
        console.error("[supabase] Migration failed:", err.message);
        return false;
    }
}

/* ── Profile ────────────────────────────────────── */

async function ensureProfile() {
    if (!supabase || !authState.user) return;
    try {
        const { data, error } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", authState.user.id)
            .single();

        if (error && error.code === "PGRST116") {
            // No profile yet – create one
            const meta = authState.user.user_metadata || {};
            await supabase.from("profiles").insert({
                id: authState.user.id,
                display_name: meta.full_name || meta.name || "Pianist",
                avatar_url: meta.avatar_url || meta.picture || null
            });
        }
    } catch (err) {
        console.error("[supabase] ensureProfile error:", err.message);
    }
}

/* ── Badges ─────────────────────────────────────── */

async function loadBadgesFromCloud() {
    if (!supabase || !authState.user) return [];
    try {
        const { data, error } = await supabase
            .from("badges")
            .select("badge_id, earned_at")
            .eq("user_id", authState.user.id);

        if (error) {
            console.error("[supabase] loadBadges error:", error.message);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error("[supabase] loadBadges exception:", err.message);
        return [];
    }
}

async function awardBadgeCloud(badgeId) {
    if (!supabase || !authState.user) return;
    try {
        const { error } = await supabase
            .from("badges")
            .upsert({
                user_id: authState.user.id,
                badge_id: badgeId,
                earned_at: new Date().toISOString()
            }, { onConflict: "user_id,badge_id" });

        if (error) console.error("[supabase] awardBadge error:", error.message);
    } catch (err) {
        console.error("[supabase] awardBadge exception:", err.message);
    }
}

/* ── Observable Pattern ─────────────────────────── */

function onAuthChange(fn) {
    authState.listeners.push(fn);
    // Fire immediately if already ready
    if (authState.ready) fn(authState);
    return () => {
        authState.listeners = authState.listeners.filter(l => l !== fn);
    };
}

function _notify() {
    authState.listeners.forEach(fn => {
        try { fn(authState); } catch (e) { console.error("[supabase] listener error:", e); }
    });
}

/* ── Exports (window-scoped for plain JS) ───────── */

window.BabyStepsAuth = {
    init: initSupabase,
    signInWithGoogle,
    signOut,
    getUser,
    isSignedIn,
    onAuthChange,
    loadProgressFromCloud,
    saveProgressToCloud,
    migrateLocalToCloud,
    ensureProfile,
    loadBadgesFromCloud,
    awardBadgeCloud
};
