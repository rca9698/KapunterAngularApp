# Kapunter Marketing Website

Professional public website for **Kapunter** — India's trusted gaming ID & wallet platform (since 2017).

Built as a standalone Angular application inside the existing `KapunterAngularApp` workspace so it can share tooling and brand assets with the main client app.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Home — hero, stats, features, how-it-works, guides teaser, testimonials, CTA |
| `/features` | Full product capability breakdown |
| `/guides` | Customer module video guides (on-site; no YouTube) |
| `/about` | Company story since 2017 + values |
| `/testimonials` | Satisfied customer stories |
| `/faq` | Accordion FAQ |
| `/contact` | Support channels + enquiry form (API-ready) |
| `/legal` | Terms & Responsible Gaming (18+) |

## Develop

From the `KapunterAngularApp` root:

```bash
npm run website:start
```

Opens the marketing site on the Angular CLI default port (usually `http://localhost:4200`).

## Production build (host-ready)

```bash
npm run website:build
```

Output lands in:

```
dist/kapunter-website/
```

Upload the **contents** of that folder to your web host (IIS, Apache, Nginx, Azure Static Web Apps, S3, etc.).

### Hosting notes

- **IIS** — `web.config` is already copied into the build output (SPA rewrite + security headers).
- **Apache** — ensure `.htaccess` is deployed (SPA rewrite).
- **Nginx** — use `try_files $uri $uri/ /index.html;`.

### SEO / brand

- Meta description & Open Graph tags in `src/index.html`
- `robots.txt` and `sitemap.xml` under `assets/`
- Brand palette matches the Kapunter client (`#ff8a00` on `#09070e`)

## Configurable redirect links

All public links (app URL, APK download, support email, WhatsApp) resolve through
`SiteConfigService` with three layers — each overriding the previous:

1. **Code defaults** — `src/app/shared/brand.ts`
2. **`assets/site-config.json`** — appsettings-style file, editable on the server
   **without a rebuild** (just replace the JSON in the deployed `assets` folder)
3. **Remote API (optional)** — set `configApiUrl` in the JSON to enable

### JSON contract (`assets/site-config.json`)

```json
{
  "appUrl": "https://kapunter.com/",
  "apkUrl": "https://kapunter.com/assets/app/kapunter.apk",
  "email": "support@kapunter.com",
  "whatsapp": {
    "enabled": true,
    "phoneNumber": "91XXXXXXXXXX",
    "defaultMessage": "Hi Kapunter, I need help with my account."
  },
  "foundedYear": 2017,
  "configApiUrl": ""
}
```

### Enabling API-driven config

Point `configApiUrl` at an endpoint (e.g. `https://api.kapunter.com/api/website/config`).
The endpoint should return the same JSON shape — **partial responses are fine**; empty or
missing fields keep their JSON/default values, and if the API is unreachable the site
silently falls back to the JSON. Example minimal ASP.NET controller:

```csharp
[ApiController]
[Route("api/website")]
public class WebsiteConfigController : ControllerBase
{
    [HttpGet("config")]
    [AllowAnonymous]
    public IActionResult GetConfig() => Ok(new
    {
        appUrl = "https://kapunter.com/",
        apkUrl = "https://kapunter.com/assets/app/kapunter.apk",
        email = "support@kapunter.com",
        whatsapp = new { enabled = true, phoneNumber = "91XXXXXXXXXX", defaultMessage = "Hi Kapunter!" }
    });
}
```

Remember to allow the website origin (e.g. `https://website.kapunter.com`) in the API CORS policy.

## Other notes

Static marketing content (features, testimonials, FAQs, customer guides) lives in `src/app/shared/content.ts`.

### Customer video guides (`/guides`)

Module walkthroughs play **on the website itself** (HTML5 `<video>` or the built-in animated guide).
Drop AI-generated MP4s into `src/assets/videos/` using the filenames listed in that folder’s README.
Until a file exists, visitors still get a playable step-by-step guide for that module.

The contact form is intentionally front-end only today — replace `ContactComponent.submit()`
with an `HttpClient` call when the API is ready.
