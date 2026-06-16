import { useEffect, useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";
import { getIsDark, setIsDark as setIsDarkPersistent } from "./isDark";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        headerNode,
        socialProvidersNode = null,
        infoNode = null,
        documentTitle,
        bodyClassName,
        kcContext,
        i18n,
        doUseDefaultCss,
        classes,
        children
    } = props;

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });
    const { msgStr } = i18n;
    const { realm, message, isAppInitiatedAction, client } = kcContext;

    // Client logo retrieval logic
    // 1. Look for "logoUri" attribute (Logo URL field in Keycloak)
    // 2. Fallback to favicon if not defined
    const clientLogoUrlFromKeycloak = client.attributes?.logoUri;

    const clientUrl = (client as any).baseUrl || (client as any).rootUrl;
    let clientHostname: string | null = null;
    try {
        clientHostname = clientUrl ? new URL(clientUrl).hostname : null;
    } catch {
        clientHostname = null;
    }
    const faviconUrl = clientHostname 
        ? `https://www.google.com/s2/favicons?sz=128&domain=${clientHostname}`
        : null;
    
    const clientLogoToDisplay = clientLogoUrlFromKeycloak || faviconUrl;

    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        setIsDark(getIsDark());
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        setIsDarkPersistent(newDark);
    };

    useEffect(() => {
        document.title = documentTitle ?? msgStr("loginTitle", realm.displayName || realm.name);
    }, []);

    useSetClassName({
        qualifiedName: "html",
        className: kcClsx("kcHtmlClass")
    });

    useSetClassName({
        qualifiedName: "body",
        className: bodyClassName ?? kcClsx("kcBodyClass")
    });

    const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

    if (!isReadyToRender) {
        return null;
    }

    return (
        <div className={clsx(
            "min-h-screen flex items-stretch font-sans overflow-hidden transition-colors duration-300",
            isDark ? "bg-black text-white" : "bg-white text-black"
        )}>
            {/* Left Column: Form Section */}
            <div className="w-full sm:w-1/2 xl:w-1/3 flex flex-col justify-between p-4 sm:p-12 md:p-16 lg:p-20 relative z-10 overflow-y-auto">
                <div className="flex-1 flex flex-col justify-center items-center py-2 sm:py-12">
                    <div className="max-w-[420px] w-full flex flex-col items-center">
                        
                        {/* Header Icons / Logos */}
                        <div className="flex items-center justify-center space-x-6 mb-4 sm:mb-12 scale-90 sm:scale-100">
                            {/* Keycloak Logo */}
                            <div className={clsx(
                                "w-14 h-14 rounded-[20px] flex items-center justify-center shadow-sm transition-colors overflow-hidden",
                                isDark ? "bg-[#262626]" : "bg-[#F2F2F2]"
                            )}>
                                <img 
                                    src={`${kcContext.url.resourcesPath}/keycloak.png`} 
                                    alt="Keycloak" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        if (!e.currentTarget.src.includes('keycloak.png')) return;
                                        e.currentTarget.src = "keycloak.png";
                                    }}
                                />
                            </div>
                            
                            {/* Elegant Thin Squiggly Arrow */}
                            <div className={clsx(
                                "w-20 h-8 flex items-center justify-center transition-colors",
                                isDark ? "text-[#404040]" : "text-[#D1D1D1]"
                            )}>
                                <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 12C15 12 20 4 35 4C50 4 55 20 70 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M66 16L70 20L66 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>

                            {/* Client Favicon Logo */}
                            <div className={clsx(
                                "w-14 h-14 rounded-[20px] flex items-center justify-center p-2 shadow-md transition-colors overflow-hidden",
                                isDark ? "bg-white text-black" : "bg-black text-white"
                            )}>
                                {clientLogoToDisplay ? (
                                    <img 
                                        src={clientLogoToDisplay} 
                                        alt={client.name || client.clientId} 
                                        className="w-10 h-10 object-contain"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                ) : (
                                    <span className={clsx(
                                        "text-xl font-bold",
                                        isDark ? "text-black" : "text-white"
                                    )}>
                                        {(client.name || client.clientId).charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-center mb-4 sm:mb-4 tracking-tight leading-tight">
                            {headerNode}
                        </h1>
                        
                        {/* Subtext - HIDDEN ON MOBILE */}
                        <p className={clsx(
                            "hidden sm:block text-center mb-10 text-[15px] leading-relaxed max-w-[340px] transition-colors",
                            isDark ? "text-[#A3A3A3]" : "text-[#666]"
                        )}>
                            Do you want to sign in to <span className={clsx("font-bold", isDark ? "text-white" : "text-black")}>{realm.displayName || realm.name}</span> with your Keycloak account?
                        </p>

                        {/* System Messages */}
                        {displayMessage && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && (
                            <div className={clsx(
                                "w-full mb-4 p-4 rounded-xl text-sm border font-medium transition-colors",
                                isDark 
                                    ? (message.type === "error" ? "bg-red-950/30 text-red-400 border-red-900/50" : 
                                       message.type === "success" ? "bg-green-950/30 text-green-400 border-green-900/50" :
                                       "bg-blue-950/30 text-blue-400 border-blue-900/50")
                                    : (message.type === "error" ? "bg-red-50 text-red-700 border-red-100" : 
                                       message.type === "success" ? "bg-green-50 text-green-700 border-green-100" :
                                       "bg-blue-50 text-blue-700 border-blue-100")
                            )}>
                                <span dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }} />
                            </div>
                        )}

                        {/* Form Content */}
                        <div id="kc-content" className="w-full">
                            {children}
                        </div>

                        {socialProvidersNode && (
                            <div className="mt-4 w-full">
                                {socialProvidersNode}
                            </div>
                        )}

                        {displayInfo && infoNode && (
                            <div className="mt-4 w-full text-center">
                                {infoNode}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer and Theme Toggle */}
                <div className="flex flex-col items-center space-y-4">
                    <button 
                        onClick={toggleTheme}
                        className={clsx(
                            "text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border transition-all",
                            isDark ? "border-[#262626] text-[#404040] hover:text-white hover:border-white" : "border-[#E5E5E5] text-[#A3A3A3] hover:text-black hover:border-black"
                        )}
                    >
                        {isDark ? "Light Mode" : "Dark Mode"}
                    </button>
                    <div className={clsx(
                        "hidden sm:block text-center text-[10px] font-bold mt-4 uppercase tracking-[0.3em] transition-colors",
                        isDark ? "text-[#404040]" : "text-[#D4D4D4]"
                    )}>
                        Alternative Sign In Methods
                    </div>
                </div>
            </div>

            {/* Right Column: Visual Section */}
            <div className={clsx(
                "hidden sm:flex sm:w-1/2 xl:w-2/3 p-4 sm:p-6 lg:p-8 items-stretch relative transition-colors duration-300",
                isDark ? "bg-black" : "bg-white"
            )}>
                <div className={clsx(
                    "flex-1 rounded-[32px] md:rounded-[48px] overflow-hidden relative border transition-colors",
                    isDark ? "border-[#1A1A1A]" : "border-gray-100"
                )}>
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg" 
                        alt="Voyageur" 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className={clsx(
                        "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity",
                        isDark ? "opacity-40" : "opacity-10"
                    )}></div>
                </div>
            </div>
        </div>
    );
}
