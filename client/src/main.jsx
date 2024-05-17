import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import SSRProvider from 'react-bootstrap/SSRProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <SSRProvider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </SSRProvider>,
)
