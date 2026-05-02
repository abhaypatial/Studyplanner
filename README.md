# AI/Data Science Study Planner (Serverless Edition)

**A beginner-friendly local app for planning and practicing AI, data science, machine learning, Python, and SQL.**

This project runs entirely in your browser or phone. You do not need to publish anything online, rent a server, or run a backend to use it.

## What This App Does

- Builds a study plan for roles like Data Analyst, Data Scientist, ML Engineer, AI Engineer, and AI Architect.
- Lets you mark skills you already know so the plan skips beginner work.
- Creates a timeline based on your target completion window.
- Gives you a local practice sandbox.
- Shows study material links for the module you are working on.
- Lets you mark modules as done and continue with **Resume Study**.
- Lets you add a Google Gemini API key for tutor features directly from the browser.
- Stores app data locally on your device.

## Project Links

- GitHub repo: https://github.com/abhaypatial/Studyplanner
- Gemini API key page: https://aistudio.google.com/app/apikey

## How To Run The Web App

You only need Node.js installed to run the frontend. The backend python files are no longer required because the app is 100% serverless!

1. Open a terminal in the project folder.
2. Run the following commands:

```bash
cd frontend
npm install
npm run dev
```

3. Open `http://localhost:3000` in your browser.

## How To Make This an iOS App

Because this app is 100% serverless, you can package it into a real iOS app using Capacitor and TestFlight.

**Step 1: Install Capacitor**
```bash
cd frontend
npm install @capacitor/core @capacitor/ios
npm install -D @capacitor/cli
```

**Step 2: Initialize**
```bash
npx cap init "Study Planner" "com.studyplanner.app"
```
*(Open the generated `capacitor.config.ts` and change `"webDir": "public"` to `"webDir": "out"`)*

**Step 3: Build for Production**
```bash
npm run build
```

**Step 4: Add iOS Project & Open in Xcode**
```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

From Xcode (requires a Mac), you can attach your Apple Developer account, click **Product > Archive**, and upload it directly to TestFlight!

## How To Add A Gemini API Key

The Gemini API key is optional. The app can run without it, but tutor features need it.

1. Go to Google AI Studio: `https://aistudio.google.com/app/apikey`
2. Create or copy your API key.
3. Open the app (`http://localhost:3000` or on your phone).
4. Click **Tutor Settings**.
5. Paste your key into the password field.

Keep your API key private. Your key is stored ONLY on your device's local storage and is never uploaded anywhere except securely to Google.
