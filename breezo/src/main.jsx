import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'
import {  DataContextProvider } from './solana/providers/DataContext.jsx'
import AppWalletProvider from './solana/providers/AppWalletProvider.jsx'
import { Buffer } from "buffer";
window.Buffer = Buffer;
window.global = window;
ReactDOM.createRoot(document.getElementById('root')).render(
 <AppWalletProvider>
    <BrowserRouter>
      <DataContextProvider>
        <App />
      </DataContextProvider>
    </BrowserRouter>
  </AppWalletProvider>
)
