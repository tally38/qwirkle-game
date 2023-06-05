import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
} from "react-router-dom";
import './index.css';
import Lobby from './Lobby';
import AiApp from './AiApp';
import reportWebVitals from './reportWebVitals';

const AppWrapper = () => {
  return (
    <>
      <h1>Qwirkle</h1>
      <span><Link to='/' >Play With Others</Link></span>
      <span>  |  </span>
      <span><Link to='/ai' >Play Against (a bad) AI</Link></span>
      <Outlet />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppWrapper />,
    children: [
      {
        path: "/",
        element: <Lobby />,
      },
      {
        path: "/ai",
        element: <AiApp />,
      },
    ]
  },
  {
    path: "/ai",
    element: <AiApp />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();