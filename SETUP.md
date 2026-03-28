# Admin Panel Setup Guide

Follow these steps once to get the admin panel working on your live site and phone.

---

## Step 1 — Supabase (your database)

1. Go to [supabase.com](https://supabase.com) and open your project.
2. In the left sidebar, click **SQL Editor**.
3. Click **New query**, then paste the entire contents of `supabase/schema.sql` into the editor.
4. Click **Run** (the green button). You should see "Success" messages.
5. Now go to **Settings → API** (left sidebar).
6. Copy these two values — you'll need them in Step 3:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **service_role** key (under "Project API keys" — click "Reveal" to show it)

---

## Step 2 — Cloudinary (your photo storage)

1. Go to [cloudinary.com](https://cloudinary.com) and log into your account.
2. From the **Dashboard**, copy these three values:
   - **Cloud Name** (top-left, e.g. `djabcdefg`)
   - **API Key**
   - **API Secret** (click "Reveal")

---

## Step 3 — Add environment variables to Netlify

1. Open your Netlify project dashboard.
2. Go to **Site configuration → Environment variables**.
3. Click **Add a variable** and add each of the following:

| Key | Value |
|-----|-------|
| `ADMIN_PASSWORD` | A password you choose (keep it safe) |
| `JWT_SECRET` | Any long random string (e.g. 32+ random characters) |
| `SUPABASE_URL` | Your Supabase Project URL from Step 1 |
| `SUPABASE_SERVICE_KEY` | Your Supabase service_role key from Step 1 |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name from Step 2 |
| `CLOUDINARY_API_KEY` | Your Cloudinary API Key from Step 2 |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API Secret from Step 2 |

---

## Step 4 — Seed your existing photos into Supabase

Your 21 existing photos need to be imported into Supabase so they appear on the site.

1. Copy `.env.example` to `.env` in the project folder and fill in your values from Steps 1–2.
2. Open Terminal in the project folder and run:

```bash
node scripts/seed-supabase.js
```

You should see: `✅ Successfully seeded 21 photos.`

---

## Step 5 — Deploy

Push your code to GitHub — Netlify will automatically pick up the changes and redeploy.

```bash
git add -A
git commit -m "Add admin panel"
git push
```

Wait ~1 minute for Netlify to finish building.

---

## Step 6 — Log in

1. Visit your live site.
2. Scroll all the way to the bottom — you'll see a tiny **©** symbol.
3. Click it to open the owner login page.
4. Enter the `ADMIN_PASSWORD` you set in Step 3.

That's it. You can now manage your portfolio from any device, including your phone.

---

## Local development (optional)

If you want to test the admin panel locally before deploying:

1. Make sure `.env` is filled in (Step 4).
2. Run:

```bash
npm run dev
```

3. Open `http://localhost:8888` in your browser.
4. Go to `http://localhost:8888/admin` to access the admin panel locally.
