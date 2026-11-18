# KumoYomi — Dépôt des Sources (Extensions JSON)

Dépôt communautaire séparé hébergeant les modèles génériques et les fiches de configuration `.json` utilisées par l'extension [**KumoYomi**](https://github.com/KumoYomi/kumoyomi).

## Utiliser ce dépôt dans KumoYomi

1. Ouvrez KumoYomi → onglet **Sources & Dépôts**.
2. Collez simplement l'URL de ce dépôt :
   ```text
   https://github.com/KumoYomi-Sources/extensions-source
   ```
   *(Ou l'URL brute directe : `https://raw.githubusercontent.com/KumoYomi-Sources/extensions-source/main/index.json`)*
3. Cliquez sur **Ajouter le dépôt**.

## Sources disponibles

<!-- SOURCES_TABLE_START -->
| ID | Nom | Langue | Modèle | Site | Config |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `mangamoins-fr` | **MangaMoins** | `FR` | _sur-mesure_ | [https://mangamoins.com](https://mangamoins.com) | [`sources/mangamoins-fr.json`](./sources/mangamoins-fr.json) |
| `mangas-origines-fr` | **Mangas-Origines.fr** | `FR` | `origines` | [https://mangas-origines.fr](https://mangas-origines.fr) | [`sources/mangas-origines-fr.json`](./sources/mangas-origines-fr.json) |
<!-- SOURCES_TABLE_END -->

## Ajouter ou corriger un site (Pull Request)

Consultez [`CONTRIBUTING.md`](./CONTRIBUTING.md) pour ajouter un site en quelques lignes (héritage de modèle ou sélecteurs personnalisés) via une **Pull Request**.
