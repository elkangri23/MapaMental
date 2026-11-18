# Espacio Visual user guide

[Español](es.md) · [Français](fr.md) · **English** · [Back to the repository](../../README.en.md)

## Getting started

When you first open Espacio Visual, you’ll see a sample map. Edit it or choose **＋ Proyecto** (new project) to start your own. To follow this example, name the project “Our school garden” and choose **＋ Añadir idea** on the empty canvas. Double-click “Nueva idea”, type “School garden” and press **Enter**. Button names in this guide match the Spanish interface.

1. Select the central idea, choose **＋ Añadir idea** (add idea) and double-click the new card to name it “Planting calendar”.
2. Select the centre again before adding “Watering rota” and “Harvest log”. All three ideas now branch directly from the centre.
3. Wait for **Guardado local** (saved locally). Next time, open the map from the project selector in the top bar.

You can finish the map and turn it into slides without an AI provider. The **?** button in the sidebar opens this guide even when you’re offline.

## Editing a mind map

- **Rename an idea.** Double-click its name, or focus it and press **Enter** or **F2**. Press **Enter** to confirm or **Escape** to cancel.
- **Connect ideas.** Drag a handle from one idea to another. The link runs from the first idea to the second. Its direction helps determine which ideas belong to a branch.
- **Rearrange the map.** Drag cards, adjust the zoom or choose **Ordenar** for automatic layout. Choose **Vista de lista** to navigate and select ideas with the keyboard.
- **Delete a branch.** Select it and choose the bin. This also removes its descendants. The central idea stays in place. A map can hold up to 10,000 ideas.

## Connecting an AI provider

Open **Proveedores de IA** (the gear). Choose **Nuevo perfil** to add another profile. Enter the provider type, address, model and key where required. **Probar conexión** retrieves the model list. Select the exact model ID and choose **Guardar**. The active model appears below the chat.

- **FreeLLMAPI.** Start the service, choose **Compatible con OpenAI** and use `http://127.0.0.1:31415/v1`. When running from source, copy `.env.example` to `.env` if that file doesn’t exist yet. Set `FREELLMAPI_API_KEY` in your local copy. Choose a model from your catalogue. The gateway can forward context to a remote provider.
- **Ollama.** Download a model, start Ollama and use `http://127.0.0.1:11434` with the name listed by the service.
- **LM Studio.** Load a model, start the local server and use `http://127.0.0.1:1234` with the advertised model ID.
- **OpenAI, Anthropic and other servers.** Choose the corresponding provider type. For another OpenAI-compatible chat service, enter its base URL and model. Remote addresses require HTTPS. Keys entered in settings are stored in Windows Credential Manager.

For remote profiles, you can enter a monthly budget and per-model rates. Leave the budget blank for unlimited use. Cost estimates depend on your rates and the usage reported by the provider. The remote budget does not apply to a local address such as the FreeLLMAPI gateway.

## Developing a branch with AI

1. Select “Planting calendar” to focus the chat on that branch. Select the central idea to work with the whole map.
2. Open **Ver contexto** below the chat. Review the ideas, relationships, messages and slide excerpts that will accompany your request.
3. Choose **Generar sugerencias**. Each card identifies what it will create and which idea it will affect. You can also ask “Turn the calendar into a table and flag the missing dates.”
4. Select a card to request a draft. Review its destination and content, then apply or discard the changes. You can undo the last applied change while its revision is current.

The application uses branch content, instructions and filters to reduce repetition. Suggestions have been evaluated with models accessed through FreeLLMAPI. Quality varies by model. A date or quantity marked as pending is a detail you can fill in yourself.

## Creating and exporting slides

1. Choose **Crear presentación**. **Agrupar ideas del mapa** groups your ideas locally into 1–100 slides. **Generar con IA** requests 1–12 slides. Leave the count blank for a draft of 3–7 slides.
2. Review the AI draft and its linked ideas before you create a presentation or replace an existing one.
3. Edit titles, subtitles, body text and key points. Use **Anterior** and **Siguiente** to navigate, and **Mover antes** or **Mover después** to reorder slides. You can add and delete slides in the editor.
4. Add a crop table, a “Sow → Observe → Transplant” sequence or a sample form with fictional data. **Mejorar con IA** requests a draft for the current slide.
5. **Imprimir / Guardar PDF** opens the browser print dialog for the entire deck. Choose the PDF destination to save it. **Exportar PNG** saves the current slide as an image.

## Storage, profile and privacy

Projects, chats and backups are stored on this computer. The default location is `Documents\EspacioVisual\Proyectos` under your user folder. Each project has a `project.json` file and recoverable copies. Open **Copias** to restore a revision. The app saves a copy of the current state before restoring.

Open **Perfil** to save your name and email locally. The email is a profile detail. Protected access with OIDC, passkeys and TOTP recovery is experimental. Checks with real identity providers and devices are still pending.

When you request remote AI, the provider receives the selected context. Saving and manual editing take place locally. Cloud sync and collaborative editing are unavailable.

## Installation and maintenance

The Windows installer creates Start menu shortcuts. For the portable package, extract the whole ZIP and run `scripts\start-windows.cmd`. Wait for **Guardado local** and stop the service with `scripts\stop-windows.cmd` before updating. Extract the new ZIP to a different folder. You can remove the old program folder after stopping its service.

If the launcher reports a storage volume problem, check that the projects folder is on a fixed internal drive. Network folders and removable drives cannot be used for projects. If the browser session expires, save changes in the original window, stop the service and start it again.

For an independent backup, close the app after saving and copy the entire projects folder. Provider profiles live in `%APPDATA%\EspacioVisual` and usage records in `%LOCALAPPDATA%\EspacioVisual`. Keys kept in Windows Credential Manager must be set up separately on another computer.

## Frequently asked questions

### Can I start without an account or AI key?

Yes. Open a project, add ideas and choose **Crear presentación → Agrupar ideas del mapa**. Activate an AI profile when you want suggestions.

### Why does the model list load when chat fails?

Listing models and generating responses are separate requests. Check the selected model and service, and make sure a local model is loaded. Try a short prompt. For a 401, check the credential. For a gateway 502, retry and check whether another listed model generates a response.

### Was a custom model trained? Has LM Studio been tested?

The project has refined its instructions, context and draft validation. Real model evaluations used FreeLLMAPI. LM Studio and Ollama adapters are implemented. Full acceptance with real local models is still pending.

### Why is some information marked as pending?

A fact needed to support the answer is missing. For example, add the location and season to your planting map before requesting specific dates again.

### Can a form collect responses or a diagram run a workflow?

These are slide illustrations. You can edit the fictional form values or the steps of a sequence and export them as part of the slide.

### How do I recover earlier work?

Select the right project in the top bar. Undo the last AI change if that option is available, or open **Copias** and choose a revision to restore.
