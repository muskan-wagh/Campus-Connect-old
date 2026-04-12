"use client";

import { useSearchParams } from "next/navigation";

export default function LoginClient() {
    const searchParams = useSearchParams();
    const message = searchParams.get("message");

    if (!message) return null;

    return (
        <div className="mb-6 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-800">
            {message}
        </div>
    );
}
