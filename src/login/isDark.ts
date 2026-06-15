const SESSION_STORAGE_KEY = "isDark";

export function getIsDark(): boolean {
    // 1. Check URL param (to sync with main app)
    const url = new URL(window.location.href);
    const value = url.searchParams.get("dark");

    if (value !== null) {
        const isDark = value === "true";
        sessionStorage.setItem(SESSION_STORAGE_KEY, `${isDark}`);
        
        // Clean URL
        url.searchParams.delete("dark");
        window.history.replaceState({}, "", url.toString());
        
        return isDark;
    }

    // 2. Check Session Storage
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored !== null) {
        return stored === "true";
    }

    // 3. Fallback to System Preference
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function setIsDark(isDark: boolean): void {
    sessionStorage.setItem(SESSION_STORAGE_KEY, `${isDark}`);
}
