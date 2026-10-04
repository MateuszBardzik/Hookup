# engivexlab

Website of a company that tests CAD / 3D design plugins (KiCAD, Altium, Blender, Maya…) and
builds AI-training data. Experts read about the services, apply to open positions, go through the
hiring process (Apply → Qualification test → ID verification → Training → Project work) and then
work in the worker portal (projects, tasks, payments).

Pages: Home · Services · Careers · About (+ contact form) · Apply · Worker portal (/portal) · Admin (/admin).

```
Hookup/          (project folder; the website is called engivexlab)
├── back-end/   Django + Django REST Framework (API, database)
└── front-end/  React + TypeScript + Vite (the website)
```

## Run it (Windows, PowerShell)

You need **Python 3.12+** and **Node.js 20+** installed.

**1. Back-end** (terminal 1)

```powershell
cd back-end
.\setup.cmd                          # creates .venv and installs requirements.txt
.venv\Scripts\Activate.ps1
copy .env.example .env               # then edit .env if needed
python manage.py migrate
python manage.py loaddata sample_positions   # optional: 7 sample positions (CAD + AI roles)
python manage.py loaddata sample_training    # optional: 3 sample training modules
python manage.py loaddata sample_testimonials   # optional: 3 placeholder feedback cards
python manage.py loaddata sample_faqs           # optional: 6 starter FAQ entries
python manage.py runserver           # http://127.0.0.1:8000
```

**2. Front-end** (terminal 2)

```powershell
cd front-end
npm install                          # run again after pulling changes (fonts are npm packages)
npm run dev                          # open http://localhost:5173
```

Vite forwards `/api` and `/media` to Django, so both must be running.

**Tests:** `python manage.py test` (back-end) · `npm run build` (front-end type check)

## Managing data: admin pages

Open **http://127.0.0.1:8000/admin/** (the Django back-end, not port 5173) and log in with an
admin's email and password. Only users with `is_admin` = 1 can open it; they can view, add, edit and
delete everything: users, positions, applications, training, projects, tasks, contact messages, feedback cards and FAQ entries (all database fields).
Lists can be searched and filtered, and `is_active` / `sort_order` can be changed straight from the list.

**First admin:** run `python manage.py migrate` once (adds the admin tables), then either
`python manage.py createsuperuser` (new admin account with a password) or set `is_admin` = 1 for an
existing account in a database tool and give it a password with `python manage.py changepassword you@example.com`.
Accounts created with Google/Apple login have no password until you set one.

| I want to change… | Edit |
|---|---|
| Who can log in, admin title | `back-end/config/admin_site.py` |
| Columns, filters and field groups of a table | `admin.py` in that app (`accounts/`, `positions/`, `testimonials/`, `faqs/`) |
| Admin colours and logo | `back-end/templates/admin/base_site.html` |
| "View site" link | `FRONTEND_URL` in `back-end/.env` |

You can still open `back-end/db.sqlite3` with a database tool (e.g. DB Browser for SQLite, DBeaver) if you prefer.
What each table holds:

| Table | What it holds |
|---|---|
| `accounts_user` | Users. `is_admin` = 1 for staff, 0 for testers. Profile fields live here too. |
| `positions_position` | Positions (Careers page; the home page lists the first 3 — change `rolesSection.maxShown` in `site.ts`). `category` = `pcb`, `3d`, `character`, `annotation`, `ai_training`, `evaluation`, `qa` or `other` (icon + filter tabs); `employment_type` = `contract` / `part_time` / `full_time`; `pay` e.g. `$45/hr` or `$200 per task`; `location`, `countries`. **Lists, one item per line:** `highlights` (check list on the card), `responsibilities`, `requirements`, `why_apply`. `is_active` = 0 hides one; `sort_order` sets the order. `image` is a path inside `back-end/media/`. **Qualification test:** `test_instructions` + `test_form_url` (each position's own Google Form, see below). |
| `positions_application` | Applications from the Apply form (name, email, phone, location, experience, resume file, motivation, availability). **Hiring process:** `stage` 1 Apply → 2 Qualification test → 3 ID verification → 4 Training → 5 Project work (new applications start at 2); `status` in progress / on hold / not selected / withdrawn; `id_verified`; `admin_note` (shown to the applicant). Change them on the admin pages (straight from the list). |
| `portal_trainingmodule` / `portal_trainingcompletion` | Training modules (title, description, link, duration) and who marked each one as done. |
| `portal_project` / `portal_task` | Projects (pay per task, status, `members` = workers who see it) and tasks (one worker each; link to where the work is done). A worker clicks "Mark as submitted"; you set `approved` (counts as paid, Payments page) or `rejected` (sent back with `review_note`). Tip: select tasks in the list → action "Approve selected tasks". |
| `contact_contactmessage` | Messages from the "Contact us" form on the About page. Tick `is_handled` after answering. |
| `testimonials_testimonial` | Feedback cards on the landing page. `kind` = `vendor` or `user`; `is_active` = 0 hides one; `sort_order` sets the order. The section disappears when no rows are active. |
| `faqs_faq` | FAQ on the landing page: `question`, `answer` (line breaks are kept), `is_active`, `sort_order`. |

## Hiring process

1. **Apply** — the Apply page (`/apply`, needs a free account) saves an application: position, experience, optional resume
   (PDF/DOC/DOCX, max 5 MB), motivation, availability. Name, email, phone and location are copied from the account / profile.
2. **Qualification test** — submitting the form moves the application to this step **automatically**. The success
   screen offers "Take the qualification test" right away; later it's in the portal (Qualification tests).
   Every position has its own test: set its Google Form link in `test_form_url` (admin pages → Positions).
   Answers stay in Google Forms. When you've reviewed them, set `stage` to 3 (or `status` to "Not selected").
3. **ID verification** — check their ID your own way (e.g. video call), tick `id_verified`, set `stage` 3 → 4.
   The site never stores ID documents.
4. **Training** — they work through the training modules in the portal.
5. **Project work** — add them to a project (`members`) and create tasks for them.

The applicant follows every step on their dashboard (/portal).

> Resumes are saved in `back-end/media/resumes/`. In development anyone with the exact file link can open it;
> before going live, serve `media/` privately (not through a public web server folder).

## Qualification test = Google Form

The test popup shows the position's `test_instructions` and a **Start the test** button that opens that
position's `test_form_url` in a new tab. It's available while the application is at step 2 (right after applying).
A position with no `test_form_url` shows "Test not available yet".

To pre-fill the user's name and email in the form:

1. Open the form in Google Forms → **⋮** (top right) → **Get pre-filled link**.
2. Type `{name}` in the name question and `{email}` in the email question (also possible: `{first_name}`, `{last_name}`).
3. Click **Get link** → **Copy link**, and paste it into `test_form_url` for that position.

The website replaces the placeholders with the logged-in user's details when they open the test.

## Where to change things

| I want to change… | Edit |
|---|---|
| Colors, fonts, corner radius, shadows, section spacing | `front-end/src/styles/theme.css` — every colour on the site is a named value there |
| Fonts | loaded in `front-end/src/main.tsx` (npm packages `@fontsource/instrument-serif` + `@fontsource/inter`, no Google request); names in `theme.css` → `--font-serif` / `--font-sans` |
| Page background | `--bg-*` values in `theme.css` (plain by default; optional grid, glows, contour lines) |
| **Texts** of every page: hero, services, why us, hiring steps, careers, apply, about, contact, navigation, social links | `front-end/src/config/site.ts` |
| Pictures | `front-end/public/`: `logo.png` (logo; browser-tab icons `favicon-32.png`, `apple-touch-icon.png`; admin copy in `back-end/accounts/static/engivexlab/logo.png`), `hero-engivexlab.webp` (hero; `site.ts` → `hero.image`), `tools/` (official tool logos, see `tools/README.txt`), `services/*.svg`, `about/*.svg` |
| Hero illustration (glass cards: PCB board, QA checklist, 3D mesh part, annotated cube, image labelling, people's cursor tags) and its moving parts (pulses on the connectors, glowing nodes, checklist ticks, annotation box, PCB trace light, scan line, drifting cursors) | `front-end/src/features/landing/HeroIllustration.tsx` (drawing; card positions in `CARDS`, cursor names in `CURSORS`) + `HeroIllustration.module.css` (colours, motion); node positions in `heroPicture.ts` |
| Moving background of the whole first screen (network lines from the illustration's nodes, particles, indigo orbs, bottom waves, mouse light) | `front-end/src/features/landing/HeroBackdrop.tsx` (`LINES` = where each line goes, `PARTICLES`) + `HeroBackdrop.module.css` (strength, colours, timing; `.network` mask = fade behind the text). Picture size and sphere positions: `heroPicture.ts`. Pauses off screen; off for "reduce motion". |
| Section layout: open sections vs. full-width bands | `global.css` → `.panel`, `.band`, `.band-white`, `.band-dark` |
| First screen (hero + tool strip fit one screen, no scrolling) | `.fold` and the `@media` blocks in `front-end/src/features/landing/Landing.module.css` |
| Home page (order of sections) | `front-end/src/pages/LandingPage.tsx`; sections in `src/features/landing/` |
| Services / Careers / About / Apply pages | `front-end/src/pages/ServicesPage.tsx`, `CareersPage.tsx`, `AboutPage.tsx`, `ApplyPage.tsx`; shared styles `src/features/pages/Pages.module.css` |
| Dark banner at the top of inner pages | `front-end/src/components/PageHero.tsx` |
| Hiring steps (circles) | `front-end/src/features/hiring/HiringSteps.tsx` |
| Position cards + details popup | `front-end/src/features/positions/` |
| Navigation bar / footer | `front-end/src/components/Header.tsx`, `Footer.tsx` (links: `site.ts` → `nav`) |
| Login / Sign-up dialogs | `front-end/src/features/auth/` |
| Worker portal: sidebar menu | `front-end/src/features/portal/PortalLayout.tsx` (`PORTAL_MENU`) |
| Worker portal pages | `front-end/src/pages/portal/` (Open positions = `PositionsPage.tsx`; `ProfilePage.tsx` for the profile, field list at the top) |
| API calls from the website | `front-end/src/api/` |
| Admin pages (/admin/) | see "Managing data: admin pages" above |
| Database tables | `back-end/*/models.py` → then `python manage.py makemigrations` and `migrate` |
| API endpoints | `back-end/*/views.py` + `urls.py` |

Each `.tsx` component has its styles next to it in a `.module.css` file.

## Email verification (sign-up)

1. Someone signs up → the account is created **unverified** and an email with a **Verify my email** link is sent.
2. Clicking the link opens `/verify-email` on the website → the account is verified and the person is logged in.
3. Trying to log in before that shows **"Email verification required"** with a **Resend verification email** button.

- Links work once and expire after 3 days (`PASSWORD_RESET_TIMEOUT` in `settings.py`).
- Google / Apple logins count as verified (those services already checked the address).
- Accounts that existed before this feature were marked verified automatically by `migrate`.
- On the admin pages (Users) you can see and tick `email_verified` by hand.
- Email text: `back-end/templates/emails/verify_email.txt` + `.html`; sending code: `back-end/accounts/emails.py`.

**Sending the emails** (settings in `back-end/.env`, see `.env.example`):

- *Development (default, nothing set):* nothing is sent — the email, including the link, is printed in the
  terminal where `python manage.py runserver` runs. Copy the link into the browser.
- *Mailgun HTTP API (recommended):* set `MAILGUN_API_KEY` (Mailgun → API keys) and `MAILGUN_DOMAIN` (your sending
  domain). It sends over HTTPS, so it works even where SMTP ports are blocked. EU-region domain: also set
  `MAILGUN_API_URL=https://api.eu.mailgun.net`. A Mailgun *sandbox* domain only delivers to the few "authorized
  recipients" you add in Mailgun — add your own domain so any address works. Code: `back-end/config/mailgun_backend.py`.
- *Any SMTP server (used when `MAILGUN_API_KEY` is empty):* with a Gmail account: turn on 2-Step Verification,
  create an **App password** (Google Account → Security → App passwords), then
  `EMAIL_HOST=smtp.gmail.com`, `EMAIL_PORT=587`, `EMAIL_USE_TLS=true`, `EMAIL_HOST_USER=you@gmail.com`,
  `EMAIL_HOST_PASSWORD=<app password>`. Restart `runserver` after editing `.env`.
- `FRONTEND_URL` in `.env` must be the website's address (it's used in the link).
- If the mail server can't be reached, sign-up still works (the account is created) and the dialog says the email
  couldn't be sent; the error is printed in the `runserver` terminal and "Resend" can be used once it's fixed.

**`TimeoutError` / "connection attempt failed" when sending:** the computer can't reach the mail server.
Check `EMAIL_HOST` / `EMAIL_PORT`, then test in PowerShell: `Test-NetConnection smtp.gmail.com -Port 587`.
If it says `TcpTestSucceeded : False`, a firewall, antivirus, company network or hosting provider is blocking the
port (cloud servers often block SMTP). Try port 465 (`EMAIL_PORT=465`, `EMAIL_USE_SSL=true`, `EMAIL_USE_TLS=false`),
another network, or — simplest — the Mailgun HTTP API above, which doesn't use SMTP at all.
The same applies to `SMTPServerDisconnected: Connection unexpectedly closed` (something on the network or an
antivirus "mail shield" cuts the SMTP connection).

## Google / Apple login

Both buttons are fully wired but stay disabled until you add keys to `back-end/.env`
(see comments in `.env.example`). On the real site they are hidden instead.

- **Google:** create a Web OAuth client ID in Google Cloud Console, add
  `http://localhost:5173` to *Authorized JavaScript origins*, put the ID in `GOOGLE_CLIENT_ID`.
- **Apple:** needs a paid Apple Developer account, a Services ID and an HTTPS domain
  (Apple does not accept localhost). Set `APPLE_CLIENT_ID` and `APPLE_REDIRECT_URI`.

## Put it online (Ubuntu server)

Live server: Ubuntu 24.04 at `64.227.11.252`, domain `engivexlab.com`. The server gets the code from the
GitHub repo (`MateuszBardzik/Hookup`, branch `main`). Files in `deploy/`:

| File | What it does |
| --- | --- |
| `server-setup.sh` | **Once, on the server.** Installs Python tools, Node.js 22, nginx, certbot; creates the app user `engivex`; writes the live `.env`; sets up the app service, nginx and firewall; builds; gets the HTTPS certificate |
| `update.sh` | `git pull`, then installs packages, migrates the database, builds the website, restarts |
| `engivexlab.service` | Runs Django with gunicorn (systemd service) |
| `nginx.conf` | Serves the website, sends `/api/` and `/admin/` to Django, serves `/static/` and `/media/` |
| `env.production.example` | Template of the live `back-end/.env` |
| `upload.cmd` | Alternative without GitHub: copies the project from your PC with `scp` |

Never commit `.env` (secrets) — `.gitignore` keeps it, the database, uploads and build output out of Git.

**First time**

1. On your PC: commit and `git push` (branch `main`).
2. On the server (`ssh root@64.227.11.252`), let it read the repo with a *deploy key*:
   `ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519` and `cat ~/.ssh/id_ed25519.pub`, then on GitHub:
   repo → Settings → Deploy keys → Add deploy key → paste it (read-only is fine).
   (Public repo? Skip this and clone with `https://github.com/MateuszBardzik/Hookup.git`.)
3. `git clone git@github.com:MateuszBardzik/Hookup.git /srv/engivexlab/app` (answer `yes` to the GitHub fingerprint question)
4. `bash /srv/engivexlab/app/deploy/server-setup.sh engivexlab.com you@example.com`
   (your e-mail is only for certificate notices; `www.engivexlab.com` is included when it is set up in DNS).
5. Admin login: `cd /srv/engivexlab/app/back-end && sudo -u engivex .venv/bin/python manage.py createsuperuser`
6. Mailgun key etc.: `nano /srv/engivexlab/app/back-end/.env`, then `systemctl restart engivexlab`.

**After every change:** `git push` on your PC, then on the server `bash /srv/engivexlab/app/deploy/update.sh`
(or from your PC in one line: `ssh root@64.227.11.252 "bash /srv/engivexlab/app/deploy/update.sh"`).

**Useful on the server:** `systemctl status engivexlab` (is it running) · `journalctl -u engivexlab -f` (live log, also
shows e-mails when Mailgun isn't set) · `systemctl restart engivexlab` (after editing `.env`).

The live site has its own database (`/srv/engivexlab/app/back-end/db.sqlite3`) and uploads (`media/`); updates never
touch them. To copy your local data once instead, stop the app (`systemctl stop engivexlab`), copy `db.sqlite3`
and `media` with `scp` into `/srv/engivexlab/app/back-end/`, then run `bash /srv/engivexlab/app/deploy/update.sh`.

## API summary

| Method | URL | Login? |
|---|---|---|
| GET | `/api/auth/config/` | no |
| POST | `/api/auth/signup/` (sends the verification email) · `/api/auth/login/` (403 `email_not_verified` until verified) · `/api/auth/google/` · `/api/auth/apple/` | no |
| POST | `/api/auth/verify-email/` (`uid`, `token` from the link) · `/api/auth/resend-verification/` (`email`, max 5 per hour) | no |
| POST | `/api/auth/logout/` | yes |
| GET / PATCH | `/api/profile/` | yes |
| GET | `/api/positions/` · `/api/positions/<id>/` · `/api/testimonials/` · `/api/faqs/` | no |
| POST | `/api/contact/` (max 5 per hour per visitor) | no |
| GET / POST | `/api/positions/applications/` (my applications / the Apply form) | yes |
| GET | `/api/portal/summary/` · `/api/portal/training/` · `/api/portal/projects/` · `/api/portal/tasks/` | yes |
| POST | `/api/portal/training/<id>/complete/` · `/api/portal/tasks/<id>/submit/` | yes |
| — | `/admin/` (admin pages, in the browser) | admin email + password |

Logged-in requests send the header `Authorization: Token <token>`.
