import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AccountGate from './components/AccountGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AccountGate>{(account) => <App key={account} />}</AccountGate>
  </StrictMode>,
)
