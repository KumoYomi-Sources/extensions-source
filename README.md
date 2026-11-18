# KumoYomi Extensions Source

Official community repository hosting reusable scraping templates (`_templates/*.json`) and site source definitions (`sources/*.json`) for [**KumoYomi**](https://github.com/KumoYomi/kumoyomi).

---

## Use This Repository in KumoYomi

1. Open **KumoYomi** → **Sources & Repos**.
2. Paste this repository URL into the repository field:
   ```text
   https://github.com/KumoYomi-Sources/extensions-source
   ```
   *(Or direct raw manifest URL: `https://raw.githubusercontent.com/KumoYomi-Sources/extensions-source/main/index.json`)*
3. Click **Add repository**, then explore or enable the sources you want.

---

## Available Sources

<!-- SOURCES_TABLE_START -->
| ID | Name | Lang | Template | Website | Config |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `mangamoins-fr` | **MangaMoins** | `FR` | _custom_ | [https://mangamoins.com](https://mangamoins.com) | [`sources/mangamoins-fr.json`](./sources/mangamoins-fr.json) |
| `mangas-origines-fr` | **Mangas-Origines.fr** | `FR` | `origines` | [https://mangas-origines.fr](https://mangas-origines.fr) | [`sources/mangas-origines-fr.json`](./sources/mangas-origines-fr.json) |
<!-- SOURCES_TABLE_END -->

---

## Add or Fix a Source (Human or AI)

Want to add support for a website or fix a broken selector? You can do it manually **or** ask an AI coding assistant to inspect the site and prepare the Pull Request for you!

- Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for template inheritance, custom JSON selectors, validation commands, and the **AI-Assisted Source Creation Prompt**.
- Read [**KumoYomi's full schema documentation**](https://github.com/KumoYomi/kumoyomi/blob/main/docs/ADDING_SOURCES.md) for every field supported by `ParserEngine`.

### Quick Feasibility Check

- **Easy**: Sites matching `_templates/origines.json`, `_templates/madara.json`, or `_templates/mangathemesia.json` (often `< 25` lines of JSON).
- **Easy / Medium**: Server-rendered HTML sites or clean REST JSON / AJAX endpoints (`popular`, `latest`, `search`, `mangaDetails`, `chapters`, `pages`, `numberedPages`, `warmupUrl`).
- **Unsupported today**: Sites requiring canvas image descrambling, per-request JS AES/HMAC API signing, or HTML `<script>` JSON hydration arrays (e.g., `__NEXT_DATA__`) when no REST endpoint exists.
