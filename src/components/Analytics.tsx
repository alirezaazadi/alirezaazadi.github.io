"use client";

import Script from "next/script";

export function Analytics() {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    // Don't load if no GA ID configured
    if (!gaId) return null;

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                onError={() => {
                    // Silently handle blocked scripts (adblockers)
                }}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        try {
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${gaId}', {
                                page_path: window.location.pathname,
                            });
                        } catch(e) {
                            // Silently swallowed — likely blocked by adblocker
                        }
                    `,
                }}
            />
        </>
    );
}
