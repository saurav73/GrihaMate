# GrihaMate Changelog

## 2026-10-22
- Removed three genuinely unused imports in the backend (`PropertyService` in `AdminController`, `java.util.HashMap` in `ContactController`, `java.math.BigDecimal` in `RoomRequestService`) — verified no references in the file bodies
- Re-verified README setup docs against the code: ports (8081) and the `jwt.secret` note are still accurate; no doc changes needed today

## 2026-10-21
- Fixed stale backend port (8080 -> 8081) in `griha-mate-backend/README.md`, `griha-mate-react/GEMINI_AI_INTEGRATION.md`, and `griha-mate-react/HOW_TO_LOGIN_ADMIN.md` to match `server.port=8081` in `application.properties`
- Documented `jwt.secret` as a must-set local value in the backend README setup guide (the committed value is a redacted placeholder)
- Audited the repo for new committed secrets after the 2026-10-20 redaction of the Cloudinary API key/secret and eSewa merchant secret: no new secrets found; Gemini keys in `config.ts` remain environment-backed placeholders

## 2026-10-20
- Removed the real Cloudinary API key/secret (embedded in `cloudinary.url`) and the eSewa merchant secret committed in `griha-mate-backend/src/main/resources/application.properties` in an earlier revision; replaced with placeholders plus warning comments. The old values remain in git history, so rotate the Cloudinary API key/secret in the Cloudinary dashboard and the eSewa secret in the eSewa merchant dashboard

## 2026-10-19
- Removed the real Gmail app password that was committed in `griha-mate-backend/src/main/resources/application.properties` since the initial commit; replaced with a placeholder. The old value remains in git history, so rotate the app password in the Google account
- Added a warning comment above the mail password line pointing to the app-password setup instructions

## 2026-10-17
- Removed leftover debug `console.log` statements from frontend components (AI search dialog, Gemini service, Explore voice search, availability subscriptions); kept logs that record real fallback behavior
- Added file-header JSDoc to App entry, core components, frontend lib modules, and key pages

## 2026-10-15
- Added class-level Javadoc to all REST controllers (11), JPA entities (10), service classes (8), and repository interfaces (10)

## 2026-10-13
- Fixed frontend setup docs: `VITE_API_URL` (not `NEXT_PUBLIC_API_URL`), `npm run dev` (not `npm start`) in root README and `DOCUMENTATION.md`
- Fixed `app.base.url` in `application.properties` to match `server.port` (8081)
- Added class-level Javadoc to `AuthController` and `DataSeeder`

## 2026-10-11
- Added root README: overview, features, structure, docs index, setup
- Added CHANGELOG covering the January 2026 build history
- Fixed `DOCUMENTATION.md`: backend port 8080→8081, frontend directory name

## 2026-01-19
- Applied pending fixes across the platform (`apply all the fixes`)
- Enhanced the voice-interactive search feature (`enhance the voice interactive feaature`)

## 2026-01-18
- Managed system and user flow (`managing the system and the user flow`)
- Processing fixes (`fixing in the processing part`)
- Admin verification adjustments (`Adjusting admin verification`)

## 2026-01-17
- Refined the property detail page (`refining the property detail page`)
- Premium model implementation (`implementing premium model`)
- Premium upgrade payment flow with Stripe and eSewa (`Implement premium upgrade payment flow with Stripe and eSewa`)
- Refined landlord dashboard, added seeker features (`refined landlord dashboard and added seeker features`)

## 2026-01-16
- Subscription logic implementation (`implementing the subscription logic`)
