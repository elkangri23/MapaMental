# Guide d’Espacio Visual

[Español](es.md) · **Français** · [English](en.md) · [Retour au dépôt](../../README.fr.md)

> Ce logiciel, y compris ce guide et les images originales du dépôt, est distribué sous GNU AGPLv3 uniquement. L’utilisation commerciale et l’hébergement sont autorisés. Les versions modifiées distribuées ou exécutées comme service réseau doivent proposer leur code source sous la même licence. Conservez la mention `elkangri23`. Consultez [LICENSE](../../LICENSE) et [COPYRIGHT](../../COPYRIGHT). Les dépendances gardent leurs propres licences.

## Premiers pas

À la première ouverture, Espacio Visual affiche une carte d’exemple. Modifiez-la ou choisissez **＋ Proyecto** (nouveau projet) pour partir de votre propre idée. Pour suivre cet exemple, nommez le projet « Notre potager scolaire » puis, sur la carte vide, choisissez **＋ Añadir idea**. Double-cliquez sur « Nueva idea », saisissez « Potager scolaire » et validez avec **Entrée**. Les noms des boutons reproduisent ceux de l’interface en espagnol.

1. Sélectionnez l’idée centrale, cliquez sur **＋ Añadir idea** (ajouter une idée) puis double-cliquez sur la nouvelle carte pour la nommer « Calendrier des semis ».
2. Sélectionnez à nouveau le centre avant d’ajouter « Tours d’arrosage » et « Suivi des récoltes ». Les trois branches partiront ainsi de la même idée.
3. Attendez l’indication **Guardado local** (enregistré sur cet ordinateur). À la prochaine ouverture, retrouvez la carte dans le sélecteur de projets en haut de la fenêtre.

Vous pouvez terminer la carte et la convertir en diapositives sans configurer d’IA. Le bouton **?** de la barre latérale ouvre ce guide même hors connexion.

## Modifier une carte mentale

- **Renommer.** Double-cliquez sur le nom d’une idée ou placez-y le focus et appuyez sur **Entrée** ou **F2**. Validez avec **Entrée** ou annulez avec **Échap**.
- **Relier.** Faites glisser une poignée d’une idée à une autre. Le lien va de la première idée à la seconde. Ce sens contribue à définir les idées comprises dans une branche.
- **Organiser.** Déplacez les cartes, ajustez le zoom ou cliquez sur **Ordenar** pour les disposer automatiquement. La **Vista de lista** permet de parcourir et de sélectionner les idées au clavier.
- **Supprimer.** Sélectionnez une branche et cliquez sur la corbeille. Ses descendants sont également supprimés. L’idée centrale est conservée. Une carte peut contenir jusqu’à 10 000 idées.

## Configurer un fournisseur d’IA

Ouvrez **Proveedores de IA** avec la roue dentée. Choisissez **Nuevo perfil** pour ajouter un profil. Renseignez le type de service, son adresse, le modèle et la clé si nécessaire. **Probar conexión** interroge le catalogue. Sélectionnez l’identifiant exact du modèle et cliquez sur **Guardar**. Le modèle actif apparaît sous la conversation.

- **FreeLLMAPI.** Démarrez le service, choisissez **Compatible con OpenAI** et saisissez `http://127.0.0.1:31415/v1`. Si vous utilisez le code source, copiez `.env.example` dans `.env` si ce fichier n’existe pas encore. Renseignez `FREELLMAPI_API_KEY` dans votre copie locale. Choisissez un modèle figurant au catalogue. La passerelle peut transmettre le contexte à un fournisseur distant.
- **Ollama.** Téléchargez un modèle, démarrez Ollama et utilisez `http://127.0.0.1:11434` avec le nom indiqué par le service.
- **LM Studio.** Chargez un modèle, démarrez le serveur local et utilisez `http://127.0.0.1:1234` avec l’identifiant publié.
- **OpenAI, Anthropic et autres serveurs.** Choisissez le type de fournisseur correspondant. Pour un autre service de conversation compatible avec OpenAI, renseignez son URL de base et le modèle. Les adresses distantes nécessitent HTTPS. Les clés saisies dans les paramètres sont conservées dans le Gestionnaire d’informations d’identification de Windows.

Les profils distants permettent de définir un budget mensuel et des tarifs par modèle. Laissez le budget vide pour travailler sans plafond. L’estimation dépend des tarifs et de la consommation communiquée par le fournisseur. Le budget distant ne s’applique pas à une adresse locale comme celle de FreeLLMAPI.

## Développer une branche avec l’IA

1. Sélectionnez « Calendrier des semis » pour travailler sur cette branche. Sélectionnez l’idée centrale pour travailler sur l’ensemble de la carte.
2. Ouvrez **Ver contexto** sous la conversation. Vous pouvez y consulter les idées, relations, messages et extraits de diapositives qui accompagneront la demande.
3. Cliquez sur **Generar sugerencias**. Chaque carte indique le contenu proposé et l’idée concernée. Vous pouvez aussi écrire « Transforme le calendrier en tableau et indique les dates manquantes ».
4. Cliquez sur une suggestion pour demander un brouillon. Vérifiez sa destination et son contenu avant d’appliquer ou d’écarter les modifications. Vous pouvez annuler la dernière modification appliquée tant que la révision correspondante reste active.

L’application s’appuie sur le contenu de la branche, des consignes et des filtres pour limiter les répétitions. Les suggestions ont été évaluées avec des modèles accessibles via FreeLLMAPI. Leur pertinence varie selon le modèle. Une date ou une quantité indiquée comme manquante peut être complétée à la main.

## Créer et exporter des diapositives

1. Cliquez sur **Crear presentación**. **Agrupar ideas del mapa** regroupe les idées localement en 1 à 100 diapositives. **Generar con IA** permet d’en demander de 1 à 12. Laissez le nombre vide pour obtenir un brouillon de 3 à 7 diapositives.
2. Vérifiez le brouillon de l’IA et les idées associées avant de créer une présentation ou de remplacer la précédente.
3. Modifiez les titres, sous-titres, textes et points clés. Parcourez la présentation avec **Anterior** et **Siguiente**. Réorganisez-la avec **Mover antes** et **Mover después**. L’éditeur permet aussi d’ajouter et de supprimer des diapositives.
4. Ajoutez un tableau des cultures, un parcours « Semer → Observer → Repiquer » ou un formulaire illustré de données fictives. **Mejorar con IA** prépare un brouillon pour la diapositive actuelle.
5. **Imprimir / Guardar PDF** ouvre la fenêtre d’impression du navigateur pour toute la présentation. Choisissez la destination PDF pour l’enregistrer. **Exportar PNG** enregistre la diapositive actuelle sous forme d’image.

## Enregistrement, profil et confidentialité

Les projets, conversations et sauvegardes restent sur cet ordinateur. Le dossier par défaut est `Documents\EspacioVisual\Proyectos` dans votre dossier utilisateur. Chaque projet contient un fichier `project.json` et des copies récupérables. Ouvrez **Copias** pour restaurer une révision. L’application conserve une copie de l’état courant avant la restauration.

Dans **Perfil**, vous pouvez enregistrer localement votre nom et votre adresse électronique. Cette adresse est un renseignement du profil. Le mode d’accès protégé avec OIDC, clés d’accès et récupération TOTP est expérimental. Des vérifications avec des fournisseurs d’identité et des appareils réels restent à effectuer.

Lorsque vous sollicitez une IA distante, le fournisseur reçoit le contexte sélectionné. L’enregistrement et les modifications manuelles sont locaux. La synchronisation dans le cloud et l’édition collaborative ne sont pas disponibles.

## Installation et maintenance

L’installateur Windows crée des raccourcis dans le menu Démarrer. Pour le paquet portable, extrayez tout le ZIP et lancez `scripts\start-windows.cmd`. Attendez **Guardado local** et arrêtez le service avec `scripts\stop-windows.cmd` avant la mise à jour. Extrayez le nouveau ZIP dans un autre dossier. Vous pouvez retirer l’ancien dossier du programme après l’arrêt de son service.

Si le lanceur signale un problème de volume de stockage, vérifiez que le dossier des projets se trouve sur un disque interne fixe. Les dossiers réseau et supports amovibles ne conviennent pas. Si la session du navigateur expire, enregistrez le travail dans la fenêtre d’origine, arrêtez le service et redémarrez-le.

Pour réaliser une sauvegarde indépendante, fermez l’application après l’enregistrement et copiez le dossier des projets dans son intégralité. Les profils des fournisseurs se trouvent dans `%APPDATA%\EspacioVisual` et le relevé de consommation dans `%LOCALAPPDATA%\EspacioVisual`. Les clés conservées par Windows sont à configurer séparément sur un autre ordinateur.

## Questions fréquentes

### Puis-je commencer sans compte ni clé d’IA ?

Oui. Ouvrez un projet, ajoutez des idées et choisissez **Crear presentación → Agrupar ideas del mapa**. Activez un profil d’IA lorsque vous souhaitez recevoir des suggestions.

### Pourquoi le catalogue fonctionne-t-il alors que la conversation échoue ?

Le catalogue et la génération utilisent des requêtes différentes. Vérifiez le modèle choisi, l’état du service et, pour un modèle local, son chargement en mémoire. Essayez une demande courte. En cas d’erreur 401, vérifiez la clé. En cas d’erreur 502 de la passerelle, réessayez puis vérifiez si un autre modèle du catalogue répond.

### Un modèle a-t-il été entraîné pour le projet ? LM Studio a-t-il été testé ?

Le projet a affiné les consignes, le contexte et la validation des brouillons. Les évaluations sur des modèles réels ont utilisé FreeLLMAPI. Les adaptateurs de LM Studio et d’Ollama sont disponibles. La validation complète avec des modèles locaux réels reste à faire.

### Pourquoi certaines informations sont-elles signalées comme manquantes ?

Il manque une donnée pour étayer la réponse. Pour fixer une date de semis, par exemple, précisez le lieu et la saison dans la carte avant de relancer la génération.

### Un formulaire peut-il recueillir des réponses ? Un parcours peut-il être exécuté ?

Il s’agit d’illustrations pour la présentation. Vous pouvez modifier les données fictives du formulaire ou les étapes du parcours, puis les exporter avec la diapositive.

### Comment retrouver une version antérieure ?

Sélectionnez le projet voulu dans la barre supérieure. Annulez la dernière modification de l’IA si cette option est disponible, ou ouvrez **Copias** et choisissez la révision à restaurer.
