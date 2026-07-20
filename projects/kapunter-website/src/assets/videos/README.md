# Customer guide videos (on-site only)

These MP4s play on the `/guides` page — **no YouTube**. Each module has **English / Hindi / Kannada** audio.

| Module | English | Hindi | Kannada |
|--------|---------|-------|---------|
| Create ID | `01-create-id-en.mp4` | `01-create-id-hi.mp4` | `01-create-id-kn.mp4` |
| Bank details | `02-bank-details-en.mp4` | `…-hi.mp4` | `…-kn.mp4` |
| Manage ID | `03-manage-id-en.mp4` | `…-hi.mp4` | `…-kn.mp4` |
| Change password | `04-change-password-en.mp4` | `…-hi.mp4` | `…-kn.mp4` |
| Passbook | `05-passbook-en.mp4` | `…-hi.mp4` | `…-kn.mp4` |
| Notifications | `06-notifications-en.mp4` | `…-hi.mp4` | `…-kn.mp4` |

Default (English) copies without suffix (`01-create-id.mp4`, etc.) are also kept for fallback.

### Visual guidance
- Orange highlight ring on the control to use
- Large bouncing arrow
- Tip bubble (“Tap Create ID…”)
- Step caption bar at the bottom

### Privacy
- Mobile: first 4 digits only
- Username: first letter only
- Password / bank numbers: masked

### Regenerate

```bash
npm run website:record-all
```

Requires: FFmpeg, Edge browser, `msedge-tts`, and env vars `KAPUNTER_MOBILE` / `KAPUNTER_PASSWORD`.
