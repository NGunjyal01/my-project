"use client";
import { useState } from "react";
import { apiFetch, setToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    async function handleLogin() {
        const res = await apiFetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        if (res.error) {
            alert(res.error);
        } else if (res.token) {
            setToken(res.token); // store token in localStorage
            router.push("/dashboard"); // navigate to dashboard
        }
    }

    return (
    <div className="flex min-h-screen items-center justify-center">
        <div className="w-80 space-y-4">
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button className="w-full" onClick={handleLogin}>Login</Button>
        </div>
    </div>)
}
