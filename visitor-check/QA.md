# Verification record

## English and device-language revision

Visitor and administrator interfaces have complete English, Chinese, Spanish, French, German and Japanese catalogs. English is the static default and fallback. A supported URL language overrides a saved manual choice, which overrides device-language preferences. Unsupported device languages fall back to English. Selecting Automatic restores device-language matching. Display-language choices never replace captured browser-language evidence.

Codex in-app browser checks covered English entry, French switching, Automatic matching the device's Chinese preference, English administrator login, English record details, Japanese dashboard translation, and logout. The same visitor reference remained after language switching. The administrator record retained the browser's original zh-CN language despite an English entry page. No relevant browser warning or error appeared in the inspected logs.

Screenshots were inspected at desktop 1280 × 900 and mobile 390 × 844. The visitor page, administrator header, notices and details dialog fit these viewports. The mobile records table scrolls horizontally to preserve its columns. The temporary viewport override was reset after checking.

## Automatic recording and network classification

Opening `/` creates the baseline immediately and automatically updates available browser fields, without a click. The page displays its recording notice, status and reference. Local or reserved IP addresses skip third-party lookups. Without an IPAPI_KEY, the administrator interface explicitly says network classification is not configured; no live VPN, carrier or hosting detection is claimed.

Provider classification is checked with synthetic fixtures, including overlapping flags, true/false/unknown distinctions, malformed responses, IP mismatches, IPv6 equivalence and provider rate limits. ISP classification is not treated as proof of residential access; IP and device clues are not treated as proof of nationality.

## Automated checks

`node --test visitor-check/test/*.test.js`: 27 tests passed, zero failures. Coverage includes automatic entry without JavaScript, one-record enrichment and retries, same-origin and update-token checks, asynchronous lookups preserving device updates, deletion without resurrection, authenticated lifecycle, persistence, retention, secure sessions, login throttling, trusted proxy selection, reserved address filtering and private-directory isolation in the existing website server.

Language coverage includes device preference order, English fallback, explicit override, blocked preference storage, complete catalogs and matching placeholders, captured device-language preservation, no extra submission on display-language changes, and administrator language changes retaining open details, deletion confirmation, network meanings, loading and error states without refetching or mutating records.

`node --check` passed for the server, IP lookup module and all frontend scripts. `git diff --check` reported no whitespace errors. The deployment archive includes the language scripts and tests and excludes local records, credentials and `.env`.

## Deployment checks still required

The actual domain, HTTPS certificate, reverse proxy, trusted hop count, persistent volume, API key and live provider connectivity remain unverified until the user's server is available. The Dockerfile is supplied but has not been built here. No external site has been deployed.
