import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { startCloudSync } from './services/cloudSyncBootstrap';

// Start best-effort Supabase synchronization. Local/offline tracking remains available.
startCloudSync();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);