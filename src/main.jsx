import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import 'highlight.js/styles/atom-one-dark.css';
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { UserProvider } from './context/UserContext'
import { AppProvider } from './context/AppContext'
import { LanguageProvider } from './context/LanguageContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <LanguageProvider>
          <UserProvider>
            <AppProvider>
              <App />
            </AppProvider>
          </UserProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
