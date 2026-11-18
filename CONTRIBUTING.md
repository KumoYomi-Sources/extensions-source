# Contributing to KumoYomi Sources

This repository works just like `keiyoushi/extensions-source` for Mihon, except every source in [`sources/`](./sources) is pure **declarative JSON** — zero executable JS/Kotlin code!

**You do NOT need to edit `index.json`, `bundle.json`, or `README.md` manually.** Whenever a Pull Request is merged into `main`, GitHub Actions automatically validates all JSON files and regenerates those files.

---

## Repository Hierarchy

```text
extensions-source/
├── _templates/              # Shared reusable theme base configs (origines, madara, mangathemesia)
├── sources/                 # One JSON file per site (<id>.json)
├── scripts/
│   ├── validate-and-build.mjs  # Schema/manifest validator + index/bundle/README generator
│   └── convert-mihon.mjs       # Optional helper for converting simple Mihon theme extensions
├── index.json               # Auto-generated repository manifest pointing to templates & sources
└── bundle.json              # Auto-generated self-contained JSON manifest
```

---

## Option 1 — Extend an Existing Theme Template (Fastest)

Available templates in [`_templates/`](./_templates):
- `origines` (WordPress Child-Origines theme)
- `madara` (WordPress WP-Manga / Madara theme)
- `mangathemesia` (MangaThemesia / MangaStream theme)

Create `sources/<site-id>.json`:

```json
{
  "id": "example-en",
  "name": "Example Scans",
  "lang": "en",
  "extends": "madara",
  "baseUrl": "https://example.invalid",
  "vars": {
    "mangaSubString": "manga"
  }
}
```

### Rules
1. `"id"` **must** match the filename without `.json` (lowercase, hyphens only, typically `<site>-<lang>`).
2. `"baseUrl"` **must not** end with `/`.
3. Only commit JSON configs — never upload copyrighted covers, chapters, or test screenshots.
4. Optional: convert a standard Mihon/Keiyoushi theme folder cleanly:
   ```bash
   node scripts/convert-mihon.mjs --input /path/to/keiyoushi/src/en/example --out sources/example-en.json
   ```

---

## Option 2 — Custom Site Configuration (SSR HTML or JSON API)

If the site does not use any template in `_templates/`, define `popular`, `latest`, `search`, `mangaDetails`, `chapters`, and `pages` directly inside `sources/<id>.json`.

You can copy [`_templates/origines.json`](./_templates/origines.json) or [`_templates/mangathemesia.json`](./_templates/mangathemesia.json) as a starting point, or consult the full JSON schema in [**`KumoYomi/docs/ADDING_SOURCES.md`**](https://github.com/KumoYomi/kumoyomi/blob/main/docs/ADDING_SOURCES.md).

### What Sites Can Be Added Easily vs. Not Supported Yet?

| Pattern | Feasibility | Notes |
| --- | --- | --- |
| WordPress Madara / MangaThemesia / Origines | **Easy** | Extend `_templates/<theme>.json` and override only differences. |
| Server-rendered HTML with CSS selectors | **Easy / Medium** | Use `selector`, `attr` fallbacks (`["data-src", "src"]`), `regex`, `replace`. |
| Clean REST API (`json`) / AJAX HTML (`json-html`) | **Easy / Medium** | Supports `GET`/`POST`, `queryParams`, `formBody`, `jsonBody`, `jsonPath`, `jsonTemplate`. |
| Inline `<script>` JSON (`__NEXT_DATA__`, `ts_reader.run`) | **Supported (`v0.4.0+`)** | Use `responseType: "json"` + `request.scriptJson` (`selector` / `regex`). |
| Sequential / numbered CDN pages + JS token strip | **Supported** | Use `pages.numberedPages` + `stripTokensFromScript`. |
| Cloudflare / Anti-hotlink sites | **Supported** | KumoYomi handles `Referer` DNR rules and compact Cloudflare popup verification automatically. |
| Canvas tile descrambling / AES-encrypted payloads / dynamic CSRF login flows | **Hard / Unsupported** | Requires core parser support in `KumoYomi/kumoyomi` before adding a JSON source. |

---

## Option 3 — Use an AI Coding Assistant to Create & PR a Source

You can let an AI coding agent (Antigravity, Claude Code, Codex, Cursor, etc.) analyze the target site, author the JSON file, verify it locally, and open the PR here. Give it this prompt:

````markdown
Analyze `<TARGET_SITE_URL>` and create a KumoYomi JSON source config for `KumoYomi-Sources/extensions-source`:
1. Inspect how `<TARGET_SITE_URL>` loads:
   - Popular / Latest catalogue pages and Search results (`GET`/`POST`, HTML vs JSON API)
   - Series detail page (title, cover, author, description, status, genres)
   - Chapter list (HTML selectors, inline HTML, or AJAX/JSON endpoint)
   - Chapter page image URLs (`<img>` tags, lazy attributes, JSON API, or numbered CDN paths) and image CDN `Referer` headers
2. Check `_templates/*.json` (`origines`, `madara`, `mangathemesia`) first — reuse `"extends"` if the site matches a template.
3. Follow the full schema specification in `KumoYomi/docs/ADDING_SOURCES.md`. If the site uses `<script>` JSON hydration (`__NEXT_DATA__`, `ts_reader.run`), configure `responseType: "json"` + `request.scriptJson` (`selector` / `regex`). Only report a blocker if the site relies on unsupported patterns like canvas descrambling or per-request JS payload encryption.
4. Write `sources/<site-id>.json`, run `node scripts/validate-and-build.mjs --check` to validate syntax and manifest rules, test the config inside KumoYomi (Firefox → Sources & Repos → Import JSON + the built-in **Inspect** debugger), verify cover loading and chapter reading, then open a PR to `KumoYomi-Sources/extensions-source`.
````

---

## Testing Checklist Before Opening Your PR

1. Run local validator:
   ```bash
   node scripts/validate-and-build.mjs --check
   ```
2. Import your `sources/<id>.json` in **KumoYomi** → **Sources & Repos** → **Import JSON (.json)** *(note: if your source uses `"extends"`, import `_templates/<template>.json` first)*.
3. Verify inside KumoYomi:
   - **Test** button (or the interactive **Inspect** panel for Popular / Details / Chapters / Pages) succeeds cleanly
   - **Explore** Popular/Latest & Search return titles with working covers
   - **Manga Detail** renders metadata, genres, status, and full chapter list in proper order
   - **Reader** loads chapter pages cleanly without broken images
4. Commit only `sources/<id>.json` (or `_templates/<name>.json`) and open your Pull Request against `main`.
