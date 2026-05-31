# Control Center

Personal digital hub for **Sai Sanith Reddy** — a premium, minimalistic web application at [control.saisanithreddy.online](https://control.saisanithreddy.online).

## Features

- **Authentication** — Login-only access with bcrypt password hashing (admin-created accounts)
- **Dashboard** — Greeting, clock, weather, summary cards, quick access modules
- **Notes** — Google Keep-style notes with rich text, categories, pin & search
- **Todos** — Tasks with due dates, priorities, and completion tracking
- **Documents Vault** — Secure file storage with separate vault password
- **Exams** — Exam tracking with automatic archiving after exam date
- **Calendar** — Monthly view with exams, todos, birthdays, and events
- **Bookmarks** — Categorized links with favorites
- **Universal Search** — Search across notes, todos, exams, and bookmarks
- **Analytics** — Owner-only traffic dashboard for all subdomains
- **Settings** — Theme (light/dark/system), profile, password & vault management
- **PWA** — Installable on mobile and desktop with offline fallback

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL + Storage)
- NextAuth v5 + bcrypt
- Vercel deployment

## Getting Started

### 1. Clone and install

```bash
cd control-center
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the SQL migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Create a **Storage bucket** named `documents` (private)
4. Copy your project URL and API keys

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Create admin account

```bash
npm run create-admin -- your@email.com YourSecurePassword "Sai Sanith Reddy"
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Set `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to `https://control.saisanithreddy.online`
5. Deploy

### Custom domain

Add `control.saisanithreddy.online` in Vercel → Settings → Domains.

## Cross-domain Analytics

Add this script to `saisanithreddy.online` and all subdomains:

```html
<script src="https://control.saisanithreddy.online/analytics.js" defer></script>
```

Or host `public/analytics.js` on each site.

## PWA Icons

Generate PNG icons:

```bash
node scripts/generate-icons.js
```

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Protected app routes
│   ├── api/            # API routes
│   ├── login/          # Login page
│   └── offline/        # PWA offline fallback
├── components/         # UI components
├── lib/                # Utilities, auth, Supabase
└── types/              # TypeScript types
supabase/
└── migrations/         # Database schema
scripts/
├── create-admin.js     # Seed admin user
└── generate-icons.js   # PWA icon generator
```

## Security Notes

- No public signup — accounts created via `create-admin` script only
- Passwords hashed with bcrypt (12 rounds)
- Document vault uses separate password
- File uploads restricted to PDF, images, and Word docs (max 10MB)
- All routes protected by NextAuth middleware
- Analytics page restricted to admin role

## License

Private — © 2026 Sai Sanith Reddy
