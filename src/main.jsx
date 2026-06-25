// src/main.jsx
import './reset.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'; // Thêm dòng này
import { store } from './store/index.js'; // Thêm dòng này
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Bao bọc toàn bộ App bằng Redux Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);