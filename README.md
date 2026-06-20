# React + TypeScript + Vite

## Local API fallback

The app posts to `/api/integrationassistant`. During local development, Vite
tries the local FastAPI backend first:

```env
INTEGRATION_API_LOCAL_URL=http://127.0.0.1:8000
```

To fall back to an Apps Script deployment when the local backend is offline,
create a local-only `.env.local` file and add the full script URL:

```env
INTEGRATION_API_LOCAL_URL=http://127.0.0.1:8000
INTEGRATION_API_FALLBACK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Do not use a `VITE_` prefix for the Apps Script URL. `.env.local` is ignored by
git, and variables without `VITE_` are only used by the Vite dev server.

## GitHub Pages deployment

GitHub Pages serves the production build from:

```txt
https://cbwheels18.github.io/integrationassistant/
```

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds `dist` and
deploys it to Pages automatically when `main` is pushed.

Before the first deploy, open the GitHub repo and set:

1. `Settings -> Pages -> Build and deployment -> Source -> GitHub Actions`
2. `Settings -> Secrets and variables -> Actions -> New repository secret`
3. Name: `VITE_INTEGRATION_API_ENDPOINT`
4. Value: your Apps Script URL with the integration route, for example:

```env
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?route=/api/integrationassistant
```

This URL is included in the browser build so the static GitHub Pages app can
submit the form. Do not put private credentials in `VITE_` variables.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
