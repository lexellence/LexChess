This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Setup Instructions
1. Clone then run "npm install" in root and /functions. 
2. Fill in the values in "/.env.template" and rename to "/.env" (verify .env is in .gitignore)
3. Retrieve Firebase AdminSDK credentials file (*.json) from Firebase Realtime Database and place into "/../"
4. Open "/package.json" and edit filename in path GOOGLE_APPLICATION_CREDENTIALS="../../credentialsFile.json" to match file from #3 
(Both the credentials file and the values in .env should be kept out of the repository, for security)

# Available Scripts
### TypeScript auto-compile for firebase functions
\functions> npm run watch

### Start dev-mode, a combination of: front-end react-app dev mode, and	firebase function emulation
\> npm run dev

### In a separate command prompt, get a grok public URL, start public url forwarding to your local development server, so sign-in works during development. Then open the grok-provided public URL in your browser and test there instead of localhost.
\> npm run grok

### After editing, build react and deploy to firebase. Then the site will be live. Access through URL assigned by firebase hosting.
\> npm run deploy

# Development instructions
### Each running in their own command-prompt windows:
\functions> npm run watch
\> npm run dev
\> npm run grok

