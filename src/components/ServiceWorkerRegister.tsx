"use client";

import { useEffect } from "react";

/**
 * Registers the static service worker (public/sw.js) in production builds only,
 * so the dev server's hot-reload is never interfered with.
 *
 * The scope is derived from NEXT_PUBLIC_BASE_PATH so it works identically on:
 *  - a root domain / custom domain (basePath = ""), and
 *  - a GitHub Pages project subpath (basePath = "/<repo>").
 */
export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") return;
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

        const base = process.env.NEXT_PUBLIC_BASE_PATH
            ? `/${process.env.NEXT_PUBLIC_BASE_PATH}`
            : "";
        const swUrl = `${base}/sw.js`;

        const register = () =>
            navigator.serviceWorker
                .register(swUrl, { scope: `${base}/` })
                .catch(() => {
                    /* Registration is best-effort; ignore failures (e.g. unsupported host). */
                });

        if (document.readyState === "complete") {
            register();
        } else {
            window.addEventListener("load", register, { once: true });
        }
    }, []);

    return null;
}
