# PWA-Generator: Website to PWA-Generator

## Instantly turn any website into a fully customizable and installable Progressive Web App (PWA) with a shareable link.

PWA-Generator allows users to transform any website URL into a personalized Progressive Web App without writing a single line of code. Configure app name, colors, display mode, and upload a custom icon. The generated PWA becomes live on a unique path of *your* site, ready to be installed directly from the browser, and can be shared via a persistent URL.

This project is designed to be self-contained, handling icon uploads via a Vercel Serverless Function, ensuring no external third-party APIs are required for its core functionality.

## ✨ Features

*   **Website to PWA Conversion:** Wrap any website URL into an installable PWA.
*   **Customizable Metadata:** Define your PWA's name, short name, and description.
*   **Dynamic Theming:** Select custom theme and background colors using an integrated advanced color picker.
*   **Display Mode Options:** Choose between `standalone`, `fullscreen`, or `minimal-ui` for the PWA experience.
*   **Custom App Icon:** Upload your own image file (recommended 512x512) for the PWA icon.
*   **Shareable PWA Links:** Generate a unique URL for your custom-configured PWA. Anyone visiting this URL will get your personalized PWA experience instantly.
*   **Live PWA Wrapper:** Experience the PWA directly within the browser context after generation, making it immediately installable.
*   **Draggable Exit Button:** A convenient, draggable "X" button is provided within the PWA wrapper to easily return to the generator.
*   **Responsive Design:** Optimized for both desktop and mobile devices, including light/dark theme toggling.
*   **No External APIs (Self-contained):** Icon uploads are processed by a Vercel Serverless Function that converts images to Base64 data URIs, removing dependency on external image hosting services.

## 🚀 Getting Started

To get this project up and running locally or deploy it:

### Prerequisites

*   [Node.js](https://nodejs.org/) installed on your machine.
*   [Vercel CLI](https://vercel.com/docs/cli) installed globally (`npm install -g vercel`).

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/endoverdosing/pwa-forge.git
    cd pwa-forge
    ```

2.  **Install dependencies:**
    The `formidable` library is used by the serverless function.
    ```bash
    npm install formidable
    ```

3.  **Run the development server:**
    This command will start the Vercel development server, which automatically handles your frontend and the serverless function in `api/upload.js`.
    ```bash
    vercel dev
    ```
    The application will typically be available at `http://localhost:3000`.

## 📂 Project Structure

```
.
├── api/                  # Vercel Serverless Functions
│   └── upload.js         # Handles image upload and Base64 conversion
├── css/
│   ├── pages.css
│   └── style.css         # Main styles for the application
├── js/
│   ├── pages.js
│   └── script.js         # Core application logic, PWA generation, color picker, etc.
├── index.html            # Main application page
├── manifest.json         # Default PWA manifest (updated dynamically)
├── sw.js                 # Service Worker for basic app shell caching
└── vercel.json           # Vercel deployment configuration
```

## 🌐 Deployment to Vercel

This project is pre-configured for seamless deployment to [Vercel](https://vercel.com/):

1.  **Push to Git:** Push your project to a Git repository (GitHub, GitLab, Bitbucket).
2.  **Import Project:** Go to your [Vercel Dashboard](https://vercel.com/dashboard) and select "Add New Project." Import your Git repository.
3.  **Automatic Deployment:** Vercel will automatically detect the `vercel.json` configuration and the serverless function in the `api/` directory. It will build and deploy your application.
4.  **Live URL:** Once deployed, Vercel will provide you with a live URL where your PWA-Generator is accessible.

## 📝 Usage

1.  **Enter Website URL:** Type or paste the URL of the website you want to wrap into a PWA.
2.  **Configure PWA Settings:** Click "PWA Settings" to expand options for:
    *   **App Name, Short Name, Description:** Essential PWA metadata.
    *   **Theme Color & Background Color:** Use the custom color picker to select your desired colors.
    *   **Display Mode:** Choose how the PWA will look when launched (standalone, fullscreen, minimal-ui).
    *   **App Icon:** Upload a 512x512 PNG or JPEG image for your PWA's icon.
3.  **Forge PWA:** Click the hammer button.
4.  **Get Shareable Link:** After clicking the hammer, a "Share Your PWA" section will appear. Click "Generate Link" to get a unique URL for your configured PWA.
5.  **Install/Experience PWA:**
    *   The page will immediately transform into a live PWA wrapper for the URL you entered.
    *   You can use your browser's "Add to Home Screen" or "Install App" feature to install this custom PWA.
    *   Share the generated link with others so they can directly install your custom PWA.
    *   Click the draggable "X" button to exit the PWA wrapper and return to the generator.

## 🛠️ Technologies Used

*   **Frontend:** HTML, CSS, JavaScript
*   **Backend (Serverless):** Node.js, `formidable` (for file parsing in Vercel Function)
*   **Deployment:** Vercel
*   **Icons:** Font Awesome

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/endoverdosing/pwa-forge/issues).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.