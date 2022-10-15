import React, { createContext } from 'react';
import Routes from './Routes';

export default function App() {
  const modalDispatch = createContext(null);
  return (
    <Routes />
  );
}
