import Link from "next/link";
import { Mail, MessageCircle, Code2, Share2 } from "lucide-react";
import { APP_NAME, APP_VERSION } from "@/lib/constants";

export function Footer() {
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#";
  const github = process.env.NEXT_PUBLIC_GITHUB_URL || "#";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL || "#";
  const email = process.env.NEXT_PUBLIC_EMAIL || "hello@saisanithreddy.online";

  return (
    <footer className="mt-auto border-t border-neutral-200/80 bg-white/50 px-6 py-6 dark:border-neutral-800 dark:bg-neutral-950/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="text-center text-sm text-neutral-500 sm:text-left">
          <p>© 2026 Sai Sanith Reddy</p>
          <p className="mt-0.5">
            {APP_NAME} v{APP_VERSION} · Created by Sai Sanith Reddy
          </p>
        </div>
        <div className="flex items-center gap-4 pb-2 lg:pb-0 lg:pr-20">
          <Link
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="Instagram"
          >
            <Share2 className="h-5 w-5" />
          </Link>
          <Link
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="GitHub"
          >
            <Code2 className="h-5 w-5" />
          </Link>
          <Link
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </Link>
          <Link
            href={`mailto:${email}`}
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
