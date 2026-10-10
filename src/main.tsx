import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './estilos.css';

const contenedor = document.getElementById('root');

if (contenedor === null) {
  throw new Error('No se encontró el contenedor raíz.');
}

createRoot(contenedor).render(
  <StrictMode>
    <App />
  </StrictMode>,
);