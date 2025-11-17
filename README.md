# Order Plus (React Native)

Order Plus is a **food ordering app** built with React Native, inspired by modern delivery platforms (Swiggy / Zomato–style UX).

It showcases:

- Multi-screen navigation with onboarding and auth
- Google sign-in powered by Firebase Auth
- A Firestore-driven, real-time menu
- A fully managed cart with rich item customization
- Order summary, history, and tracking
- Basic profile and location handling (maps + geolocation)

This project is ideal as a **portfolio piece** to demonstrate mobile app architecture, third-party integrations, and production-style flows.

---

## Highlights (Why this project is interesting)

- **Real-world auth flow** using Google + Firebase Auth
- **Realtime data** from Firestore `menu` collection
- **Stateful cart** with customizations affecting pricing
- **Multi-stack navigation** depending on onboarding/auth state
- **Location features** with maps & geolocation
- **Payment integration ready** via Razorpay (with native setup)

---

## Features

- **Onboarding & splash flow**
  - Branded splash screen followed by an onboarding experience.
  - Onboarding completion state stored in `AsyncStorage` (`hasOnboarded`).

- **City selection & persistence**
  - City selection during onboarding and later via profile.
  - Selected city stored as `selectedCity` in `AsyncStorage`.

- **Google sign-in with Firebase Auth**
  - Google login via `@react-native-google-signin/google-signin` and `@react-native-firebase/auth`.
  - User profile (name, email, avatar) written/updated in Firestore under `users/{uid}`.

- **Firestore-backed menu**
  - Menu items loaded in real time from Firestore `menu` collection.
  - Live updates via `onSnapshot`, so menu changes appear instantly in the app.

- **Cart & item customization**
  - Global cart via `CartContext`:
    - Add, remove, adjust quantity, clear cart.
    - Derived `totalPrice` and `totalItems`.
  - Item customization examples:
    - **Pizzas**: crust (classic/thin/cheese burst) and cheese level (regular/extra) with price deltas.
    - **Burgers**: optional extra patty.
    - **Fries**: regular vs large.
    - **Beverages**: regular vs large.
  - Each customized combination is treated as a unique cart line item.

- **Ordering flow**
  - Typical flow: **Menu → Cart → Order Summary → Orders → Order Tracking**.
  - Order tracking screen to follow placed orders.

- **Profile & location**
  - Profile screen showing user info and access to orders.
  - Location picker screen using maps + geolocation for selecting an address.

- **Navigation & layout**
  - Navigation powered by `@react-navigation/native` and `@react-navigation/native-stack`.
  - `SafeAreaProvider` for notch-safe layout.
  - Shared color system via `src/theme.js`.

- **Payments (Razorpay)**
  - `react-native-razorpay` is included and ready to be wired into the checkout flow (requires Razorpay keys and native setup).

- **Testing & tooling**
  - Jest test setup with `__tests__/App.test.tsx`.
  - ESLint and Prettier configs for consistent code quality.

---

## Tech Stack

- **Core**
  - React Native `0.82.1`
  - React `19.1.1`
  - JavaScript + TypeScript (`App.tsx` is TypeScript, most screens are JS)

- **Navigation**
  - `@react-navigation/native`
  - `@react-navigation/native-stack`

- **State & context**
  - Custom `CartContext` using React Context and hooks

- **Backend & auth**
  - `@react-native-firebase/app`
  - `@react-native-firebase/auth`
  - `@react-native-firebase/firestore`

- **Auth provider**
  - `@react-native-google-signin/google-signin`

- **Location & maps**
  - `@react-native-community/geolocation`
  - `react-native-maps`

- **Payments**
  - `react-native-razorpay`

- **UI helpers**
  - `react-native-safe-area-context`
  - `react-native-screens`

- **Tooling**
  - Jest
  - ESLint (`@react-native/eslint-config`)
  - Prettier

> Node.js engine requirement: **Node >= 20** (see `package.json`).

---

## Screenshots & Demo

You can add screenshots here to make this project portfolio-ready:

```text
screenshots/
└── ├── splash.png
    ├── onboarding.png
    ├── city-select.png
    ├── auth.png
    ├── restaurant-list.png
    ├── menu.png
    ├── cart.png
    ├── order-summary.png
    ├── orders.png
    └── order-tracking.png
```

Example Markdown (replace with your real paths):

```markdown
## Screenshots

| Splash | Onboarding | City Select |
|--------|------------|------------|
| ![](docs/screenshots/splash.png) | ![](docs/screenshots/onboarding.png) | ![](docs/screenshots/city-select.png) |

| Auth | Menu | Cart |
|------|------|------|
| ![](docs/screenshots/auth.png) | ![](docs/screenshots/menu.png) | ![](docs/screenshots/cart.png) |
```

Optionally add a demo link:

```markdown
## Demo

- **APK / Build**: [Download here](<your-apk-or-build-link>)
- **Video walkthrough**: [Watch on YouTube](<your-youtube-link>)
```

---

## Getting Started

### 1. Prerequisites

Make sure your React Native environment is set up:

- Node.js **>= 20**
- Watchman (macOS, recommended)
- Android Studio + Android SDK (for Android)
- Xcode + Command Line Tools (for iOS, macOS only)
- `npm` or `yarn`

Official environment setup guide: <https://reactnative.dev/docs/set-up-your-environment>

### 2. Clone and install

```sh
# clone the repo
git clone <your-repo-url> order_plus_rn_new
cd order_plus_rn_new

# install dependencies (pick one)
npm install
# or
yarn
```

### 3. Configure Firebase & Google Sign-in

This project uses Firebase Auth + Firestore and Google Sign-In.

1. **Create a Firebase project** and enable:
   - Authentication → Google provider
   - Firestore Database
2. **Add Android & iOS apps** in the Firebase console and download:
   - `google-services.json` for Android
   - `GoogleService-Info.plist` for iOS
3. Place them in the appropriate native locations (standard React Native Firebase setup).
4. In `App.tsx`, Google Sign-In is configured as:

   ```ts
   GoogleSignin.configure({
     webClientId: '<your-web-client-id>',
   });
   ```

   Replace the existing `webClientId` with your **Web client ID** from Firebase → Project Settings → OAuth client IDs.

Useful docs:

- React Native Firebase: <https://rnfirebase.io/>
- Google Sign-In: <https://github.com/react-native-google-signin/google-signin>

### 4. Configure Razorpay (optional but recommended)

The dependency `react-native-razorpay` is already added.

1. Create a Razorpay account and obtain your API keys.
2. Follow the official React Native integration guide:
   - <https://razorpay.com/docs/payments/payment-gateway/mobile-integration/react-native/>
3. Apply the required native configuration for:
   - Android: Gradle changes, `AndroidManifest` setup, etc.
   - iOS: Pod installation, URL types, etc.

### 5. Assets

The auth screen expects an app logo at:

- `android/assets/logo.png`

Either place your logo there or update the path in `src/screens/AuthScreen.js`.

---

## Running the App

### Start Metro bundler

From the project root:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

### Run on Android

In another terminal, with an emulator running or a device connected:

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### Run on iOS (macOS only)

Install CocoaPods dependencies (only on first setup or after native dependency changes):

```sh
cd ios
bundle install         # if using Bundler (recommended)
bundle exec pod install
cd ..
```

Then run:

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is configured correctly, the app should launch in your Android emulator, iOS simulator, or on a physical device.

---

## Project Structure

High-level layout (only key files/folders):

```text
order_plus_rn_new/
├── App.tsx                # Root component and navigation stacks
├── index.js               # App registry entry point
├── app.json               # App name/registration
├── android/               # Android native project
├── ios/                   # iOS native project
├── src/
│   ├── screens/
│   │   ├── SplashScreen.js
│   │   ├── OnboardingScreen.js
│   │   ├── CitySelectionScreen.js
│   │   ├── AuthScreen.js
│   │   ├── RestaurantSelectionScreen.js
│   │   ├── MenuScreen.js
│   │   ├── CartScreen.js
│   │   ├── OrderSummaryScreen.js
│   │   ├── OrdersScreen.js
│   │   ├── OrderTrackingScreen.js
│   │   ├── ProfileScreen.js
│   │   └── LocationPickerScreen.js
│   ├── components/
│   │   └── Buttons.js
│   ├── services/
│   │   ├── CartContext.js      # Cart state, totals, mutations
│   │   └── firebase.js         # Firestore instance export
│   └── theme.js                # Shared colors/theme
├── __tests__/
│   └── App.test.tsx            # Jest sample test
├── package.json
└── README.md
```

### Navigation flow (simplified)

- Initial state depends on:
  - Firebase auth state (`user`)
  - Onboarding flag (`hasOnboarded` from AsyncStorage)
- While loading those, a splash screen is shown.

Main stacks defined in `App.tsx`:

- **Onboarding stack** (when not onboarded):
  - `Splash` → `Onboarding` → `CitySelect` → `Auth`
- **Authenticated stack** (onboarded and signed in):
  - `RestaurantSelect` → `Menu` → `Cart` → `OrderSummary` → `Orders` → `OrderTracking` → `Profile` → `LocationPicker`
- **Unauthenticated + onboarded stack**:
  - `Auth` ↔ `CitySelect`

---

## Scripts

Defined in `package.json`:

- `npm start` — Start Metro bundler
- `npm run android` — Build and run on Android
- `npm run ios` — Build and run on iOS
- `npm test` — Run Jest test suite
- `npm run lint` — Run ESLint across the project

Equivalent `yarn` commands are supported.

---

## Firestore Data Model (Example)

The code assumes at least these collections (you can adapt as needed):

- **`users`** — documents keyed by `uid` containing basic profile and timestamps.
- **`menu`** — used by `MenuScreen` to render items.

Example `menu` document:

```json
{
  "name": "Margherita Pizza",
  "description": "Classic cheese pizza with tomato sauce and basil.",
  "price": 249,
  "category": "Pizza",
  "imageUrl": "https://example.com/pizzas/margherita.png"
}
```

You can extend this with restaurant metadata, order collections, etc.

---

## Development & Code Quality

- **Linting**:

  ```sh
  npm run lint
  ```

- **Testing**:

  ```sh
  npm test
  ```

- **Formatting**:
  Prettier is configured via `.prettierrc.js` (you can use your editor integration or run `npx prettier`).

When adding new screens or services:

- Reuse colors and spacing from `src/theme.js`.
- Follow existing navigation patterns in `App.tsx`.
- Interact with the cart through `CartContext` instead of ad-hoc state.

---

## What I Built / Things to Highlight (for portfolio)

You can adapt this section to your resume/portfolio:

- Implemented a **multi-step onboarding/auth flow** driven by both Firebase Auth and persisted onboarding flags.
- Built a **real-time menu experience** using Firestore snapshots, handling loading/error states gracefully.
- Designed a **customizable cart system** where add-ons (crust, extra cheese, size, etc.) affect pricing and uniqueness of line items.
- Integrated **Google Sign-In** and mapped Firebase users into an app-level `User` model.
- Added **navigation guards** via stack selection based on `user` and `hasOnboarded`.
- Prepared the app for **payment integration** via Razorpay.

---

## Troubleshooting

- If Metro fails to start or connect, try clearing caches:

  ```sh
  rm -rf node_modules
  npm install
  npx react-native start --reset-cache
  ```

- For native build issues, open the native project in **Android Studio** or **Xcode** and inspect the errors.
- For authentication problems, double-check:
  - Firebase configuration
  - SHA keys (Android)
  - Reversed client IDs / URL types (iOS)

Official React Native troubleshooting guide: <https://reactnative.dev/docs/troubleshooting>

---

## License

Specify your license here (e.g. MIT, Apache-2.0, or proprietary).
