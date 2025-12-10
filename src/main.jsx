import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
// Lazy load syntax highlighter CSS - only needed for code display
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css';
document.head.appendChild(link);
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
