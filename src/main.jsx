import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import "./style/globals.css";

import '@suiet/wallet-kit/style.css';

import { WalletProvider } from "@suiet/wallet-kit";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>,
)
