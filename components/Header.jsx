"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true); // component is mounted on client
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        router.push("/"); // better UX: send to login page
    };

    if (!mounted) {
        // 🚀 avoid mismatch by not rendering anything auth-related until after hydration
        return (
        <header className="flex items-center justify-between px-6 py-4 bg-muted/40 border-b">
            <h1 className="uppercase font-bold text-xl">MULTI-TENANT SAAS NOTES App</h1>
        </header>
        );
    }

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-muted/40 border-b">
        <h1 className="uppercase font-bold text-xl">MULTI-TENANT SAAS NOTES App</h1>
        {isLoggedIn && (
            <Button
            variant="destructive"
            onClick={handleLogout}
            className="cursor-pointer"
            >
            Logout
            </Button>
        )}
        </header>
    );
}
