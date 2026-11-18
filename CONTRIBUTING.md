# Contribuer à KumoYomi Sources

Ce dépôt fonctionne comme **`keiyoushi/extensions-source`** pour Mihon : chaque site possède sa propre fiche JSON dans [`sources/`](./sources), éventuellement basée sur un modèle générique dans [`_templates/`](./_templates).

**Vous n'avez pas besoin de modifier `index.json`, `bundle.json` ni `README.md`** : dès que votre Pull Request est validée et fusionnée sur `main`, GitHub Actions les régénère automatiquement !

---

## Cas 1 : Ajouter un site basé sur un modèle connu (5 lignes)

Modèles disponibles dans [`_templates/`](./_templates) :
- `origines` (thème WordPress Child-Origines)
- `madara` (thème WordPress WP-Manga / Madara)
- `mangathemesia` (thème MangaThemesia / MangaStream)

Créez simplement un fichier `sources/<id-du-site>.json` :

```json
{
  "id": "mon-site-fr",
  "name": "Mon Site FR",
  "lang": "fr",
  "extends": "madara",
  "baseUrl": "https://mon-site.fr",
  "vars": {
    "mangaSubString": "manga"
  }
}
```

### Règles importantes
1. `"id"` doit être **identique au nom du fichier** (sans `.json`), en minuscules avec tirets.
2. `"baseUrl"` ne doit **pas** finir par `/`.
3. Vous pouvez aussi convertir une source existante Keiyoushi automatiquement avec :
   ```bash
   node scripts/convert-mihon.mjs --input chemin/vers/keiyoushi/src/fr/site --out sources/site-fr.json
   ```

---

## Cas 2 : Site sur-mesure (sélecteurs personnalisés)

Si le site n'utilise aucun modèle de `_templates/`, définissez directement `popular`, `latest`, `search`, `mangaDetails`, `chapters` et `pages` dans `sources/<id>.json`. Vous pouvez copier la structure de [`_templates/origines.json`](./_templates/origines.json) ou [`_templates/mangathemesia.json`](./_templates/mangathemesia.json) comme point de départ.

---

## Tester avant d'ouvrir la Pull Request

1. Vérifiez la conformité JSON en local :
   ```bash
   node scripts/validate-and-build.mjs --check
   ```
2. Dans l'extension **KumoYomi** → **Sources & Dépôts** → **Importer un JSON (.json)**, importez votre fichier `sources/<id>.json` (ou après avoir importé le modèle `_templates/<modele>.json`) et testez :
   - Le bouton **Tester**
   - Une recherche dans **Explorer**
   - L'ouverture de la **fiche manga** et de la **liste des chapitres**
   - La lecture d'un chapitre (chargement des planches)
3. Ouvrez ensuite votre Pull Request sur `main`. Le workflow `Validate Sources & Templates` vérifiera votre fichier automatiquement !
