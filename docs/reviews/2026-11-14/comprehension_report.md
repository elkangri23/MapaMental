# EGM Stage 6 — Prueba de comprensión

## What this proposes

The document proposes a personal web app for building editable mind maps and slide decks with AI. The user works on a central canvas and can ask the side chat to create content or expand a selected part; the app validates the AI’s proposed operations, applies them together, and keeps the rest of the project intact. Projects and backups stay on the user’s computer, while the user chooses a local or remote model provider and can set an estimated monthly spending limit. Slides remain a separate editable artifact linked to source map nodes, with browser presentation and PDF or PNG export.

## How the existing system works, per this document

The system does not yet exist; the document describes the planned architecture and behavior. A React and TypeScript web UI will communicate over HTTP and SSE with a local Node.js/Fastify service, which handles project files, credentials, provider adapters, and validation. Projects will be versioned JSON with rotating backups; the service will validate AI operations and commit them transactionally, while later canvas edits invalidate the undo for the last AI action. Remote requests will send a context summary identified in the UI, and local providers are intended to keep data on the computer.

## Findings

### Major — Remote disclosure and context controls omitted from paraphrase

**Affected scope:** FeatureRange, “Proveedores, privacidad y coste”.  
The paraphrase omits that the UI identifies provider and context before sending, indicates whether context was summarized to fit the model window, and does not ask for confirmation on every remote request. These details define user visibility before remote transmission.

### Major — Map/deck synchronization rule omitted from paraphrase

**Affected scope:** FeatureRange, “Persistencia, presentación y exportación”.  
The paraphrase notes that slides reference map nodes but omits that references do not automatically synchronize edits. This is a key behavior of the chosen separated artifacts.

### Major — Detailed implementation range compressed too far

**Affected scope:** DetailedRange, “Detailed Implementation Plan”.  
The paraphrase omits the six-part file plan (repository root, web UI, service, domain package, Windows packaging, and documentation) and the acceptance criteria reference plus the statement that automated tests are not included. These are central to understanding the detailed range.

