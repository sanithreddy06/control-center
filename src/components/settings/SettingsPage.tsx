"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, LogOut, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [vaultCurrent, setVaultCurrent] = useState("");
  const [vaultNew, setVaultNew] = useState("");
  const [vaultConfirm, setVaultConfirm] = useState("");
  const [hasVaultPassword, setHasVaultPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setName(data.name || "");
        setEmail(data.email || "");
        setHasVaultPassword(data.hasVaultPassword);
      });
  }, []);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setError("");
    setTimeout(() => setMessage(""), 3000);
  };

  const saveProfile = async () => {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "profile", name, email }),
    });
    if (res.ok) {
      await update({ name });
      showMessage("Profile updated");
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  const changeTheme = async (newTheme: string) => {
    setTheme(newTheme);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "theme", theme: newTheme }),
    });
    await update({ theme: newTheme });
  };

  const changePassword = async () => {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "password",
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });
    if (res.ok) {
      showMessage("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  const changeVaultPassword = async () => {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "vault-password",
        currentPassword: vaultCurrent,
        newPassword: vaultNew,
        confirmPassword: vaultConfirm,
      }),
    });
    if (res.ok) {
      showMessage("Vault password updated");
      setHasVaultPassword(true);
      setVaultCurrent("");
      setVaultNew("");
      setVaultConfirm("");
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  const logoutAllDevices = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-neutral-500">Manage your preferences and security</p>
      </div>

      {message && (
        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <h2 className="mb-4 font-medium">Theme</h2>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => changeTheme(t.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                  mounted && theme === t.value
                    ? "border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700"
                )}
              >
                <t.icon className="h-5 w-5" />
                <span className="text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-medium">Profile</h2>
          <div className="space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={saveProfile}>Save Profile</Button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-medium">
            <Shield className="h-4 w-4" /> Change Password
          </h2>
          <div className="space-y-4">
            <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <Button onClick={changePassword}>Update Password</Button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-medium">
            <Shield className="h-4 w-4" /> Vault Password
          </h2>
          <p className="mb-4 text-sm text-neutral-500">
            {hasVaultPassword ? "Change your document vault password" : "Set a vault password to protect your documents"}
          </p>
          <div className="space-y-4">
            {hasVaultPassword && (
              <Input label="Current Vault Password" type="password" value={vaultCurrent} onChange={(e) => setVaultCurrent(e.target.value)} />
            )}
            <Input label="New Vault Password" type="password" value={vaultNew} onChange={(e) => setVaultNew(e.target.value)} />
            <Input label="Confirm Vault Password" type="password" value={vaultConfirm} onChange={(e) => setVaultConfirm(e.target.value)} />
            <Button onClick={changeVaultPassword}>
              {hasVaultPassword ? "Update Vault Password" : "Set Vault Password"}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-medium">Session</h2>
          <p className="mb-4 text-sm text-neutral-500">
            Signed in as {session?.user?.email}
          </p>
          <Button variant="danger" onClick={logoutAllDevices}>
            <LogOut className="h-4 w-4" /> Logout All Devices
          </Button>
        </Card>
      </div>
    </div>
  );
}
