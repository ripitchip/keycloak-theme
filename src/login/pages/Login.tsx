import { useState, useEffect } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { getIsDark } from "../isDark";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { realm, url, usernameHidden, login, registrationDisabled, messagesPerField, social } =
        kcContext;

    const { msg } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    // Watch for theme changes to update local styles if needed
    const [isDark, setIsDark] = useState(true);
    useEffect(() => {
        setIsDark(getIsDark());
        // Simple listener for the toggle button in Template
        const interval = setInterval(() => {
            const current = getIsDark();
            if (current !== isDark) setIsDark(current);
        }, 100);
        return () => clearInterval(interval);
    }, [isDark]);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("username", "password")}
            headerNode={msg("loginAccountTitle")}
            displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
            infoNode={
                <div id="kc-registration-container" className="text-center mt-6">
                    <div id="kc-registration">
                        <span className={clsx("text-sm font-medium transition-colors", isDark ? "text-[#737373]" : "text-gray-500")}>
                            {msg("noAccount")}{" "}
                            <a tabIndex={8} href={url.registrationUrl} className={clsx("font-bold hover:underline transition-all", isDark ? "text-white" : "text-black")}>
                                {msg("doRegister")}
                            </a>
                        </span>
                    </div>
                </div>
            }
            socialProvidersNode={
                <>
                    {realm.password && social?.providers !== undefined && social.providers.length !== 0 && (
                        <div id="kc-social-providers" className="mt-10">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="h-px flex-1 bg-[#262626]/50"></div>
                                <span className="text-[11px] font-bold uppercase tracking-widest text-[#737373]">
                                    {msg("identity-provider-login-label")}
                                </span>
                                <div className="h-px flex-1 bg-[#262626]/50"></div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {social.providers.map(p => (
                                    <a
                                        key={p.alias}
                                        id={`social-${p.alias}`}
                                        href={p.loginUrl}
                                        className={clsx(
                                            "flex items-center justify-center space-x-3 h-12 rounded-xl border font-bold text-sm transition-all",
                                            isDark 
                                                ? "bg-black border-[#262626] text-white hover:bg-[#0A0A0A] hover:border-white/20" 
                                                : "bg-white border-gray-200 text-black hover:bg-gray-50 hover:border-black/10"
                                        )}
                                    >
                                        {p.iconClasses && (
                                            <i className={clsx("text-lg", p.iconClasses)} aria-hidden="true"></i>
                                        )}
                                        <span dangerouslySetInnerHTML={{ __html: kcSanitize(p.displayName) }}></span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            }
        >
            <div id="kc-form" className="w-full">
                <div id="kc-form-wrapper">
                    {realm.password && (
                        <form
                            id="kc-form-login"
                            onSubmit={() => {
                                setIsLoginButtonDisabled(true);
                                return true;
                            }}
                            action={url.loginAction}
                            method="post"
                            className="space-y-4 sm:space-y-6"
                        >
                            {!usernameHidden && (
                                <div className="space-y-2">
                                    <label htmlFor="username" className={clsx("text-[13px] font-bold uppercase tracking-wider ml-1 transition-colors", isDark ? "text-[#737373]" : "text-gray-400")}>
                                        {!realm.loginWithEmailAllowed
                                            ? msg("username")
                                            : !realm.registrationEmailAsUsername
                                              ? msg("usernameOrEmail")
                                              : msg("email")}
                                    </label>
                                    <input
                                        tabIndex={2}
                                        id="username"
                                        name="username"
                                        defaultValue={login.username ?? ""}
                                        type="text"
                                        autoFocus
                                        autoComplete="username"
                                        className={clsx(
                                            "flex h-12 w-full rounded-xl border px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                            isDark 
                                                ? "border-[#262626] bg-[#0A0A0A] text-white ring-offset-black placeholder:text-[#404040] focus-visible:ring-white/20" 
                                                : "border-gray-200 bg-gray-50/50 text-black ring-offset-white placeholder:text-gray-400 focus-visible:ring-black/5"
                                        )}
                                        aria-invalid={messagesPerField.existsError("username", "password")}
                                    />
                                    {messagesPerField.existsError("username", "password") && (
                                        <p className="text-sm font-medium text-red-500" dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.getFirstError("username", "password")) }} />
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label htmlFor="password" className={clsx("text-[13px] font-bold uppercase tracking-wider transition-colors", isDark ? "text-[#737373]" : "text-gray-400")}>
                                        {msg("password")}
                                    </label>
                                    {realm.resetPasswordAllowed && (
                                        <a tabIndex={6} href={url.loginResetCredentialsUrl} className={clsx("text-[12px] font-bold hover:underline transition-colors", isDark ? "text-[#737373] hover:text-white" : "text-gray-400 hover:text-black")}>
                                            {msg("doForgotPassword")}
                                        </a>
                                    )}
                                </div>
                                <PasswordWrapper i18n={i18n} passwordInputId="password" isDark={isDark}>
                                    <input
                                        tabIndex={3}
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        className={clsx(
                                            "flex h-12 w-full rounded-xl border px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                            isDark 
                                                ? "border-[#262626] bg-[#0A0A0A] text-white ring-offset-black placeholder:text-[#404040] focus-visible:ring-white/20" 
                                                : "border-gray-200 bg-gray-50/50 text-black ring-offset-white placeholder:text-gray-400 focus-visible:ring-black/5"
                                        )}
                                        aria-invalid={messagesPerField.existsError("username", "password")}
                                    />
                                </PasswordWrapper>
                            </div>

                            <div className="flex items-center justify-between ml-1">
                                {realm.rememberMe && !usernameHidden && (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            tabIndex={5}
                                            id="rememberMe"
                                            name="rememberMe"
                                            type="checkbox"
                                            className={clsx(
                                                "h-4 w-4 rounded transition-all",
                                                isDark ? "border-[#262626] bg-black text-white focus:ring-white/20" : "border-gray-300 bg-white text-black focus:ring-black/5"
                                            )}
                                            defaultChecked={!!login.rememberMe}
                                        />
                                        <label htmlFor="rememberMe" className={clsx("text-sm font-medium transition-colors", isDark ? "text-[#737373]" : "text-gray-500")}>
                                            {msg("rememberMe")}
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2 sm:pt-4">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className={clsx(
                                        "flex-1 inline-flex items-center justify-center rounded-xl text-base font-bold transition-all border",
                                        isDark 
                                            ? "border-[#262626] bg-black text-[#737373] hover:bg-[#0A0A0A] hover:text-white" 
                                            : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-black"
                                    )}
                                    style={{ height: 'var(--button-height, 48px)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    tabIndex={7}
                                    disabled={isLoginButtonDisabled}
                                    name="login"
                                    id="kc-login"
                                    type="submit"
                                    className={clsx(
                                        "flex-1 inline-flex items-center justify-center rounded-xl text-base font-bold transition-all border-none cursor-pointer",
                                        isDark 
                                            ? "bg-white text-black hover:bg-[#E5E5E5] shadow-lg shadow-white/5" 
                                            : "bg-black text-white hover:bg-[#262626] shadow-lg shadow-black/5"
                                    )}
                                >
                                    Sign in
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </Template>
    );
}

function PasswordWrapper(props: { i18n: I18n; passwordInputId: string; children: React.ReactElement, isDark: boolean }) {
    const { i18n, passwordInputId, children, isDark } = props;
    const { msgStr } = i18n;
    const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({ passwordInputId });

    return (
        <div className="relative">
            {children}
            <button
                type="button"
                className={clsx("absolute right-3 top-1/2 -translate-y-1/2 transition-colors", isDark ? "text-[#404040] hover:text-white" : "text-gray-400 hover:text-black")}
                aria-label={msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
                aria-controls={passwordInputId}
                onClick={toggleIsPasswordRevealed}
            >
                {isPasswordRevealed ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                )}
            </button>
        </div>
    );
}
