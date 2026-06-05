# AIRPORTELS · Cafe Run

Internal staff drink-ordering tool. Staff sign in with just a name + meeting room, browse the menu, customize size / sugar / ice / milk / notes, and send the order to the cafe. The cafe sees a live admin board with three lanes (Queued → Brewing → Delivered) plus a daily roll-up.

## Files

```
├── index.html              ← staff app (login → menu → cart → confirm)
├── admin.html              ← cafe-side board (today's orders + daily roll-up)
├── styles.css              ← all styles (mobile-first, brand tokens)
├── app.js                  ← orchestrates screens, sheets, cart
├── menu.js                 ← the 24-drink menu + option vocabularies
├── db.js                   ← thin storage layer: Supabase or localStorage
├── config.js               ← paste your Supabase URL + anon key here
├── brand-spec.md           ← color + type system
├── supabase-schema.sql     ← table definitions
└── vercel.json             ← static deploy config
```

## Running locally (no Supabase needed)

Open `index.html` in a browser. With `config.js` blank, the app stores orders in `localStorage` so you can demo end-to-end without provisioning anything. Admin view (`admin.html`) reads from the same local store.

```bash
# any static server works
npx serve .
# or
python3 -m http.server 5173
```

## Hooking up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, paste and run `supabase-schema.sql`. This creates `staff`, `orders`, `order_items`, indexes, and permissive RLS policies suitable for an **internal-only** tool.
3. In *Project settings → API*, copy the project URL and the `anon` public key.
4. Open `config.js` and paste them:

   ```js
   window.SUPABASE_URL      = "https://YOUR-PROJECT.supabase.co";
   window.SUPABASE_ANON_KEY = "eyJhbGciOi...";
   ```

5. Reload. The header clock will switch from `offline` to `live`. The admin board auto-polls every 15 seconds.

> **Security note:** the schema ships with anon-writable RLS so the prototype works without auth. For a production rollout, scope writes to an internal JWT or wrap it behind a private network / Vercel password protection.

## Deploying to Vercel

```bash
npm i -g vercel    # if you don't already have it
vercel             # follow the prompts (first run)
vercel --prod      # ship to prod
```

`vercel.json` is a pure static-site config. No build step, no env vars (Supabase keys live in `config.js` and are deliberately client-visible — they're the public anon key).

## Customizing

- **Menu:** edit `menu.js`. Each drink declares its category, price (THB), available temps (`hot` / `iced`), and which option groups apply (`size`, `sugar`, `ice`, `milk`).
- **Meeting rooms:** edit `window.MEETING_ROOMS` in `config.js`.
- **Brand:** color tokens live at the top of `styles.css` (`:root`). They're OKLch — change one swatch and the whole app shifts cleanly.
- **Add a 3rd-party hook (Slack / email):** wrap `DB.createOrder` in `db.js` and POST to your webhook after the local/Supabase write.

## Daily flow

1. **Morning:** the cafe opens `admin.html` on a tablet at the counter. Lanes start empty.
2. **Throughout the day:** staff hit `index.html` on their phones, place orders. New orders appear in the **Queued** lane.
3. **Cafe makes the drink:** tap *Start brewing* → moves to **Brewing**. Tap *Mark delivered* → moves to **Delivered**.
4. **End of day:** the roll-up shows how many of each drink were ordered.

The order code on the customer's confirmation screen (e.g. `#A7K2`) matches the code on the cafe-side card — that's how the runner knows who gets the cup.
