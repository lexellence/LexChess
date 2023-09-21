import React from 'react'
import ReactDOM from 'react-dom/client'

// import App from './App.tsx'
import { App } from "./App";
import { Firebase, FirebaseContext } from './Firebase';
import { AuthUserProvider } from './Session';
import { FirebaseListenerProvider } from './FirebaseListener';
import { APIProvider } from './API';
import { GameHistoryPageProvider } from './GameHistoryPage';

const firebase = new Firebase();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FirebaseContext.Provider value={firebase}>
      <AuthUserProvider>
        <FirebaseListenerProvider>
          <APIProvider>
            <GameHistoryPageProvider>
              <App />
            </GameHistoryPageProvider>
          </APIProvider>
        </FirebaseListenerProvider>
      </AuthUserProvider>
    </FirebaseContext.Provider>
  </React.StrictMode>,
)
