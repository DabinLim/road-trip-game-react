import React, { createContext } from 'react';
import Canvas from './Canvas';

export default function App() {
  const modalDispatch = createContext(null);
  return (
    <Canvas />
  );
}
