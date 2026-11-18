## Description de la Pull Request

- [ ] Ajout d'une nouvelle source dans `sources/<id>.json`
- [ ] Mise à jour / correction d'une source existante
- [ ] Ajout ou amélioration d'un modèle dans `_templates/<nom>.json`

### Détails
- **Site concerné :** (URL du site)
- **Modèle utilisé (`extends`) :** (`origines`, `madara`, `mangathemesia`, ou `sur-mesure`)
- **Langue :** (`fr`, `en`, ...)

### Checklist avant soumission
- [ ] Le nom du fichier correspond exactement au champ `"id"` du JSON (`sources/<id>.json`)
- [ ] Le champ `"baseUrl"` ne se termine **pas** par `/`
- [ ] Testé localement dans KumoYomi (catalogue, recherche, fiche, chapitres, lecture des planches)
- [ ] `node scripts/validate-and-build.mjs --check` passe sans erreur (pas besoin de modifier `index.json` manuellement : il est régénéré automatiquement après le merge !)
