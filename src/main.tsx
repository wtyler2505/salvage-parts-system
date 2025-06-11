import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'golden-layout/dist/css/goldenlayout-base.css';
import 'golden-layout/dist/css/goldenlayout-light-theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
