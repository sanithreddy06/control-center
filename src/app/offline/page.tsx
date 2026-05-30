import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
          <WifiOff className="h-8 w-8 text-neutral-400" />
        </div>
        <h1 className="text-xl font-semibold">You&apos;re Offline</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Control Center requires an internet connection for most features.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button>Try Again</Button>
        </Link>
      </div>
    </div>
  );
}
