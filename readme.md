# PWA-Generator

Instantly turn any website into a clean, installable Progressive Web App.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FEndOverdosing%2FPWA-Generator)

## Features

-   **Automatic Icon Generation:** Creates a clean icon from the first letter of your app's name. No image files needed.
-   **Live Icon Preview:** Instantly customize the icon's background color and see the result in real-time.
-   **Full PWA Control:** Customize the App Name, Short Name, Theme Colors, and Display Mode (Standalone, Fullscreen, etc.).
-   **Short & Permanent Links:** Generates a unique, short URL for your configured PWA, perfect for sharing.
-   **True App Experience:** The generated PWA feels like a native app, not just a bookmark or shortcut.

## How It Works

1.  Enter the URL of the website you want to wrap.
2.  Customize the app details like name and theme colors.
3.  Choose a background color for the automatically generated icon.
4.  Click "Generate Link" to create your unique PWA URL.
5.  Share the link! Anyone who opens it can install the app to their home screen.

## Tech Stack

-   **Frontend:** Vanilla HTML, CSS, and JavaScript.
-   **Backend:** Vercel Serverless Functions (Node.js).
-   **Database:** Vercel KV (Serverless Redis) for storing PWA configurations.