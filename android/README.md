# COSMOS LAB ∞ — Android APK

This is a **native Android WebView wrapper** for the existing, hosted COSMOS LAB website.

- **Launch screen:** https://cosmos-lab-v3.vercel.app/hub.html
- **Application ID:** `gr.cosmoslab.mobile`
- **Displayed name:** COSMOS ∞
- **Supported Android:** Android 8.0 (API 26) and later
- **Target SDK:** 34; **compile SDK:** 35
- **Android Gradle Plugin:** 8.7.3; **Gradle:** 8.9; **JDK:** 17
- **Permissions:** Internet only
- **Features:** all 41 linked physics toy models and eight scientific lab spaces (the computations remain hosted on the COSMOS website); native Back navigation; Android file picker for CSV imports; first-party `blob:` export support (CSV, JSON, PNG) saved to Android Downloads/COSMOS on Android 10+; download handling for HTTPS assets; loading indicator and retry screen.
- **Security:** HTTPS-only WebView, third-party URLs open outside in the browser, JavaScript export bridge allowed only on the COSMOS main origin, no cleartext HTTP and no broad file/storage permissions.
- **Offline:** network connection required; the app is a shell rather than a fully bundled offline engine.

## Build the APK

The repository contains a GitHub Actions build at `.github/workflows/cosmos-android-apk.yml`. It builds using the official Android SDK and uploads an installable **debug-signed** APK (not an unsigned AAB), named `COSMOS-LAB.apk`.

When the workflow succeeds, the APK is available from:

- [GitHub Release: COSMOS Android](https://github.com/mariodinakus/cosmos-lab/releases/tag/cosmos-mobile-v1.0.0)
- [Direct APK link](https://github.com/mariodinakus/cosmos-lab/releases/download/cosmos-mobile-v1.0.0/COSMOS-LAB.apk)
- [All Actions runs](https://github.com/mariodinakus/cosmos-lab/actions/workflows/cosmos-android-apk.yml)

The direct APK link will only work **after a successful workflow build** and release upload. If the build fails, inspect Actions logs rather than guessing that it succeeded.

In Android Studio, open `android/` as a project. Alternatively, on a machine with Java 17, Android SDK 35 and Gradle 8.9:

```bash
cd android
gradle :app:assembleDebug
```

The result is `android/app/build/outputs/apk/debug/app-debug.apk`.

## Install on Android

Download `COSMOS-LAB.apk` on the phone, allow *Install unknown apps* for the browser or file manager you are using, open the APK and confirm installation. Only install the file from your own GitHub repository.

**Important:** The GitHub Actions debug keystore may be regenerated, so installing a newer APK over an older build could fail with a certificate mismatch. If so, uninstall the old debug build first; app-local browser data and saved comparisons may be lost. For reliable in-place updates and Play Store publication, configure a privately secured, persistent release signing key. Do not commit signing keys to this public repository.

## Limitations

The Android shell does not convert COSMOS into an offline application or independent APK-compiled physics engine; the deployed website must remain online. For imported scientific data, the user is responsible for sources and data preparation. Numerical toy models are not experimental proofs of fundamental physical theories.

## Native code

- `app/src/main/java/gr/cosmoslab/mobile/MainActivity.java` — navigation, security, CSV picker, native download handling
- `app/src/main/AndroidManifest.xml` — app launcher, labels and permissions
- `app/src/main/res/drawable/ic_launcher.xml` — black/cyan/white vector launcher icon
- `app/src/main/res/layout/activity_main.xml` — native WebView, loading and retry UI
