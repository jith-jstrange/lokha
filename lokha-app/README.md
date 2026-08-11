# Lokha App (`lokha-app`)

The cross-platform Flutter application for **Lokha.Today**, powering Android, iOS, Web, macOS, Linux, and Windows.

---

## 🏛️ Architecture Overview

- **Headless CMS**: Ghost CMS (`https://lokha.today/ghost/api/content/`)
- **Payment & MoR**: Creem.io (Monthly $5, Yearly $50)
- **Design System**: Tactile Paper Ambience (Heritage Parchment, Library Sepia, Velvet Ink Dark)
- **Audio Narrator**: Web Speech & Native TTS (`flutter_tts`)

---

## 🚀 Running Locally

```bash
cd lokha-app

# 1. Install dependencies
flutter pub get

# 2. Run on Chrome Web
flutter run -d chrome

# 3. Run on Android Device / Emulator
flutter run -d android

# 4. Run on iOS Simulator
flutter run -d ios
```
