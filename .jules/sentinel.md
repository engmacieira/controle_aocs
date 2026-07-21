## 2026-07-17 - Exposure of Firebase Database Internals via Frontend Alerts
**Vulnerability:** Information Disclosure / Data Leakage through raw database exception messages.
**Learning:** Returning or displaying raw `Error.message` from Firebase Firestore or Auth SDK directly to the user (e.g., via `alert()`) exposes database schema details, collection names, permission violations, and internal system paths.
**Prevention:** Catch database/system errors, log the complete trace securely to backend or developer console only, and display generic, non-informative localized error messages to the client.
