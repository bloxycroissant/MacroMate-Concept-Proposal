import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import SessionProvider from './components/SessionProvider.jsx';
import AppRouteBoundary from './components/AppRouteBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRouteBoundary>
      <SessionProvider>
        <App/>
      </SessionProvider>
    </AppRouteBoundary>
  </StrictMode>
);
