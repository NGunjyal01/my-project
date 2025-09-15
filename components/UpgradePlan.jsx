"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function UpgradePage({ slug }) {
    const router = useRouter();

    const [tenant, setTenant] = useState(null);
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function loadData() {
        const tenantRes = await apiFetch(`/api/tenant/me`);

        if (!tenantRes.error) {
        setTenant(tenantRes);
        setUser(tenantRes.user); 
        } else {
        setMessage("❌ " + tenantRes.error);
        }
    }

    async function handleUpgrade() {
        if (!slug) return;

        setLoading(true);
        setMessage("");

        const res = await apiFetch(`/api/tenant/${slug}/upgrade`, {
        method: "POST",
        body: JSON.stringify({ plan: "pro" }),
        });

        if (!res.error) {
        setMessage("✅ Plan upgraded successfully!");
        loadData();
        } else {
        setMessage("❌ " + res.error);
        }

        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    const canUpgrade = tenant && user && (tenant.ownerId === user._id || user.role === "admin");

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <Card className="max-w-lg w-full">
            <CardHeader>
            <CardTitle>Upgrade Plan</CardTitle>
            <CardDescription>
                Upgrade your workspace to unlock unlimited notes and premium features
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            {tenant && (
                <div className="space-y-1">
                <p>
                    <span className="font-semibold">Tenant:</span> {tenant.name}
                </p>
                <p>
                    <span className="font-semibold">Slug:</span> {tenant.slug}
                </p>
                <p>
                    <span className="font-semibold">Current Plan:</span> {tenant.plan}
                </p>
                </div>
            )}

            {!canUpgrade && (
                <Alert>
                <AlertTitle>Permission Denied</AlertTitle>
                <AlertDescription>
                    Only the tenant owner or an admin can upgrade the plan.
                </AlertDescription>
                </Alert>
            )}

            {canUpgrade && (
                <div className="space-y-4">
                <div className="border rounded-md p-4">
                    <h3 className="font-semibold text-lg">Pro Plan</h3>
                    <p className="text-sm text-muted-foreground">
                    • Unlimited notes <br />
                    • Priority support <br />
                    • Advanced collaboration tools
                    </p>
                    <p className="mt-2 text-xl font-bold">₹499 / month</p>
                </div>
                <Button
                    onClick={handleUpgrade}
                    disabled={loading || tenant?.plan === "pro"}
                    className={'cursor-pointer mr-3'}
                >
                    {loading
                    ? "Upgrading..."
                    : tenant?.plan === "pro"
                    ? "Already Pro"
                    : "Upgrade to Pro"}
                </Button>
                {/* Back to Dashboard Button */}
                <Button
                    variant="secondary"
                    onClick={() => router.push("/dashboard")}
                    className={'cursor-pointer'}
                >
                    Back to Dashboard
                </Button>
                </div>
            )}

            {message && (
                <p
                className={`text-sm ${
                    message.startsWith("✅") ? "text-green-600" : "text-red-600"
                }`}
                >
                {message}
                </p>
            )}
            </CardContent>
        </Card>
        </div>
    );
}
