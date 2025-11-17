# Order Plus (React Native)

Order Plus is a React Native food ordering app inspired by modern delivery platforms. It includes onboarding, city selection, Google sign‑in with Firebase, a Firestore-driven menu, cart and checkout flows with rich item customization, order history and tracking, and basic profile/location management.

This project was bootstrapped with `@react-native-community/cli` and targets both Android and iOS.

---

## Features

- **Onboarding & splash flow**
  - Splash screen followed by an onboarding experience.
  - Onboarding completion state is persisted in `AsyncStorage` (`hasOnboarded`).
- **City selection & persistence**
  - Dedicated city selection screen used during onboarding and later via profile.
  - Selected city is stored and restored from `AsyncStorage` (`selectedCity`).
- **Google sign‑in with Firebase Auth**
  - Google login via `@react-native-google-signin/google-signin` and `@react-native-firebase/auth`.
  - User profile (name, email, avatar) stored/updated in Firestore under `users/{uid}`.
- **Firestore-backed menu**
  - Menu items loaded in real time from Firestore `menu` collection.
  - Live updates via Firestore snapshot listener.
- **Cart & item customization**
  - Central cart context (`CartContext`) with add, remove, adjust quantity, clear cart, and totals.
  - Customization flows for:
    - **Pizzas**: crust (classic/thin/cheese burst) and cheese level with price deltas.
    - **Burgers**: optional extra patty.
    - **Fries**: regular vs large.
    - **Beverages**: regular vs large.
- **Ordering flow**
  - Menu → Cart → Order Summary → Orders list → Order tracking.
  - Order tracking screen for following a placed order.
- **Profile & location**
  - Profile screen with user info.
  - Location picker screen using maps/geolocation for address selection.
- **Navigation & layout**
  - Navigation powered by `@react-navigation/native` and `@react-navigation/native-stack`.
  - `SafeAreaProvider` and themed UI via `src/theme.js`.
- **Payments (Razorpay)**
  - `react-native-razorpay` included for payment integration (requires native keys/config on your side).
- **Testing & tooling**
  - Jest test setup with `__tests__/App.test.tsx`.
  - ESLint and Prettier configuration.

---

## Tech Stack

- **Core**
  - React Native `0.82.1`
  - React `19.1.1`
  - JavaScript + TypeScript (e.g. `App.tsx`)
- **Navigation**
  - `@react-navigation/native`
  - `@react-navigation/native-stack`
- **State & context**
  - Custom `CartContext` for cart state
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

Node.js engine requirement: **Node >= 20** (see `package.json`).

---

## Getting Started

### 1. Prerequisites

Make sure your React Native environment is set up:

- Node.js **>= 20**
- Watchman (macOS, recommended)
- Android Studio + Android SDK (for Android)
- Xcode + Command Line Tools (for iOS, macOS only)
- `npm` or `yarn`

Follow the official guide if needed: <https://reactnative.dev/docs/set-up-your-environment>

### 2. Clone and install

From your terminal:

```sh
# clone the repo
git clone <your-repo-url> order_plus_rn_new
cd order_plus_rn_new

# install dependencies (pick one)
npm install
# or
yarn
```

### 3. Configure Firebase & Google Sign‑In

This project uses Firebase Auth + Firestore and Google Sign‑In.

1. **Create a Firebase project** and enable:
   - Authentication → Google provider
   - Firestore Database
2. **Add Android & iOS apps** in Firebase console and download:
   - `google-services.json` for Android
   - `GoogleService-Info.plist` for iOS
3. Place them in the appropriate native locations (standard React Native Firebase setup).
4. In `App.tsx`, the Google Sign‑In is configured with a `webClientId` inside `GoogleSignin.configure(...)`.
   - Replace the existing client ID with your own Web client ID from the Firebase console.

For detailed platform configuration, see:

- React Native Firebase docs: <https://rnfirebase.io/>
- Google Sign‑In docs: <https://github.com/react-native-google-signin/google-signin>

### 4. Configure Razorpay (optional but recommended)

The dependency `react-native-razorpay` is included. To fully enable payments:

1. Create a Razorpay account and obtain API keys.
2. Follow the official setup guide for React Native:
   - <https://razorpay.com/docs/payments/payment-gateway/mobile-integration/react-native/>
3. Add the required native configuration for Android and iOS (Gradle changes, URL schemes, etc.).

### 5. Assets

- The auth screen expects an app logo at:
  - `android/assets/logo.png`

Ensure this file exists (or update the path in `src/screens/AuthScreen.js`).

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

First, install CocoaPods dependencies (only on first setup or after native dependency changes):

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
- **Authenticated stack** (when onboarded and signed in):
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

## Development & Code Quality

- **Linting**: `npm run lint`
- **Testing**: `npm test`
- **Formatting**: Prettier is configured via `.prettierrc.js` (run via your editor or manually through `npx prettier` if desired).

When adding new screens or services:

- Keep shared styling in `src/theme.js`.
- Use the existing navigation patterns in `App.tsx`.
- Prefer going through `CartContext` helpers when manipulating cart state.

---

## Firestore Data Model (High Level)

The code assumes at least these collections (you can adapt as needed):

- `users` — documents keyed by `uid` containing basic profile and timestamps.
- `menu` — collection used by `MenuScreen` to render items. Each document typically includes:
  - `name`
  - `description`
  - `price`
  - `category` (e.g. `Pizza`, `Burger`, `Sides`, `Beverage`)
  - `imageUrl` (optional)

You can extend this to include restaurants, orders, etc., depending on your backend design.

---

## Troubleshooting

- If Metro fails to start or connect, try clearing caches:

  ```sh
  rm -rf node_modules
  npm install
  npx react-native start --reset-cache
  ```

- For native build issues, open the respective native project in Android Studio or Xcode and check the build logs.
- For authentication problems, double-check your Firebase configuration, SHA keys (Android), and reversed client IDs (iOS).

For more general React Native issues, see the official troubleshooting guide:

<https://reactnative.dev/docs/troubleshooting>

---

## License

Specify your license here (e.g. MIT, proprietary).
