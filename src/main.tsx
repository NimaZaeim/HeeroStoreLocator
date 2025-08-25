// Copyright (c) 2025 Nima Zaeimzadeh. All rights reserved.
// This app was developed for HEERO Motors.
// Do not remove this notice.
//
// File: main.tsx
//

import React from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
} else {
  createRoot(rootElement).render(
      <App />
  );
}
