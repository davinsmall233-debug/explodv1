## StepThree Gallery Scraper — Recommendations (2025 Review)

### Top 3 Improvements (Prioritized)
- **Tighten injection and permissions**
  - Switch to on‑demand content script injection (e.g., `chrome.scripting.registerContentScripts` or explicit `executeScript`) instead of static `<all_urls>` content scripts.
  - Use optional host permissions + `activeTab` and request per‑site access from the side panel before scanning.
  - Narrow `web_accessible_resources` to only assets actually needed by extension pages; remove `lib/*` exposure and `<all_urls>` matches there.
- **Fix correctness/security gaps**
  - Ensure `lib/input-sanitizer.js` loads before `lib/enhanced-css-selector.js` everywhere (manifest and programmatic injection).
  - Deduplicate `PAGINATION_START/STOP` handler registrations in `background.js`.
  - Escape user‑derived fields in HTML export (e.g., `altText`, `filename`) to prevent XSS in generated reports.
  - Remove the downloads permission prompt UI if `downloads` is a required permission, or move `downloads` to `optional_permissions` if you want a runtime request.
- **Align UI with capabilities**
  - Implement advertised keyboard shortcuts (add `commands` in manifest) and context menus (plus permission and initialization code), or remove those toggles from the UI.
  - Add concise tooltips/help and a troubleshooting card.

---

### Security & Privacy Hardening
- **Permissions minimization**
  - Prefer `activeTab` + optional host permissions over `host_permissions: <all_urls>`.
  - Remove unused permissions (e.g., `notifications`) if not used.
- **Web Accessible Resources**
  - Restrict to UI assets and icons. Avoid exposing `lib/*` and broad `matches` in `web_accessible_resources`.
- **Selector and input safety**
  - Guarantee availability/order of `InputSanitizer` before `EnhancedCSSSelector`; fail safe with user‑visible guidance instead of throwing.
- **HTML export escaping**
  - Sanitize or escape all user‑derived values when composing HTML strings (filenames, alt text, titles, URLs).
- **CSP**
  - Consider removing `style-src 'unsafe-inline'` from extension pages by moving inline styles to CSS files where feasible.
- **Data persistence hygiene**
  - Keep `chrome.storage` for non‑sensitive data only; continue enforcing size/quota limits and validation in `SecureStorageManager`.

### Functionality & Correctness
- **Service worker**
  - Remove duplicate `PAGINATION_START/STOP` handler registrations.
  - Ensure broadcast/update action names are consistent (prefer a single `action` field).
- **Content scripts**
  - Add idempotence guards to prevent double initialization when programmatically reinjecting.
  - If keeping static content scripts, avoid re‑injecting the same files from the SW on failure paths.
- **Downloads & permissions UX**
  - If `downloads` remains required, hide permission request UI and show a troubleshooting hint instead; if optional, move into `optional_permissions` and request on demand.
- **Side panel flows**
  - Disable “Scan” until a connection to the current tab is confirmed; show a loading/connecting state on first render.

### Performance
- **Reduce baseline overhead**
  - Replace static `<all_urls>` content scripts with on‑demand injection to cut CPU/memory across all pages.
  - Lazy‑load heavy libs only when needed (e.g., load selector/collector modules on first scan/picker).
- **Downloads**
  - Keep concurrency configurable; consider adaptive throttling when many errors or server rate limits occur.
- **Exports**
  - For large datasets, stream generation where possible (CSV) and offer optional compression (via `CompressionStream`) for CSV/JSON.

### UI/UX & Accessibility
- **Accessibility**
  - Ensure visible focus states and ARIA labels for all interactive controls.
  - Verify keyboard navigation across the panel; add skip‑to‑content or landmarks.
- **Discoverability**
  - Add short helper text/tooltips for advanced options (regex/dimensions/next selector).
- **Long panels**
  - Consider moving rarely used advanced filters into a modal/secondary view to reduce scrolling.

### Compatibility
- **Firefox (and non‑Chromium) fallback**
  - Offer a popup/options fallback if the side panel or offscreen APIs are unavailable.
  - Provide a non‑offscreen export path (already CSV fallback exists in SW; document it and branch on capability).

### Documentation
- **Fix dead links in README**
  - Either provide `START_HERE.md`, `DEVELOPER_QUICKSTART.md`, `SOURCE_CODE_GUIDE.md`, `ARCHITECTURE.md` or remove links.
- **Add Troubleshooting**
  - Permissions troubleshooting, restricted URL caveats (`chrome://`, `about:`, `file://`), pagination selector tips.
- **Privacy note**
  - State that no sensitive user data is stored; clarify storage scopes and retention.

### Future‑Proofing & Enhancements
- **Dynamic registration**
  - Use `chrome.scripting.registerContentScripts` to enable/disable scripts per site/session without reloading the extension.
- **Optional host permissions UX**
  - Provide a clear per‑site “Grant access” flow from the side panel before scanning.
- **Recipe/Rules system**
  - Add a lightweight site recipe export/import (selectors, pagination strategies) for repeatable workflows.
- **Preflight scan**
  - Quick estimate mode that returns expected counts/memory before running a full scan.
- **Large exports**
  - Stream CSV to disk with progress; add a split‑file option for huge datasets (e.g., 100k+ rows).

### Quick Fix Checklist
- [ ] Include `lib/input-sanitizer.js` before `lib/enhanced-css-selector.js` in manifest and programmatic injections.
- [ ] Remove duplicate `PAGINATION_*` handler registrations in `background.js`.
- [ ] Escape user‑derived fields in HTML export output.
- [ ] Narrow `web_accessible_resources` to icons/UI assets; remove `lib/*` and `<all_urls>` matches.
- [ ] Switch from static `<all_urls>` content script to on‑demand injection; add idempotence guard.
- [ ] Decide: keep `downloads` required (remove prompt UI) or make it optional (request at runtime).
- [ ] Implement `commands` and context menu features or remove the related toggles from the UI.
- [ ] Remove unused permissions (e.g., `notifications`) if not used.
- [ ] Add troubleshooting and privacy notes to the README; fix or remove dead doc links.

