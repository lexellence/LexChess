This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

1. Clone then run "/npm install". 
2. Run "/functions/npm install"
2. Fill in the values in "/.env.template" and rename to "/.env" (verify .env is in .gitignore)
3. Retrieve Firebase AdminSDK credentials file (*.json) from Firebase Realtime Database and place into "/../"
4. Open "/package.json" and edit filename in path GOOGLE_APPLICATION_CREDENTIALS="../../credentialsFile.json" to match file from #3 
(Both the credentials file and the values in .env should be kept out of the repository, for security)

## Available Scripts

# Start dev-mode, a combination of:
# 	front-end react-app dev mode, and 
# 	firebase function emulation
npm run dev

# In a separate command prompt, get a grok public URL, start public url forwarding to your local development server, so sign-in works during development.
# Afterwards, open the public URL in your browser.
npm run grok

# After editing, build react and deploy to firebase.
# Afterwards, the site will be live. Access through URL assigned by firebase hosting.
npm run deploy

## Optional start-up script
# Personally, I keep a notes file and my VS Code workspace file in "/../".
# I create a batch file "/../chess.bat" with the following script to start my development environment:
@echo off
start ./changes-notes.txt
start ./chess.code-workspace
start cmd /k "TITLE dev & cd repo & npm run dev"
start cmd /k "TITLE grok & cd repo & npm run grok"
start cmd /k "TITLE git & cd repo"




