import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Canvas from './pages/Canvas';
import Ranking from './pages/Ranking';

const router = createBrowserRouter([{
  path: '/',
  element: (
      <Canvas />
  ),
},
{
  path: '/ranking',
  element: (
      <Ranking />
  ),
},
]);

export default function Routes() {
  return (
    <RouterProvider router={router} />
  );
}
