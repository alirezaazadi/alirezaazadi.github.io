"use client";

import { useEffect } from "react";
import { initErrorReporting } from "@/lib/error-reporting";

export function ErrorReportingInit() {
    useEffect(() => {
        initErrorReporting();
    }, []);

    return null;
}
