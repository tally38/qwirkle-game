import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import './index.css';
import Lobby from './Lobby/Lobby';
import AiApp from './AiApp';
import reportWebVitals from './reportWebVitals';
import theme from './theme';
import { Container } from '@mui/material';
import QwirkleAppBar from './AppBar';


const AppWrapper = () => {
  return (
    <Container disableGutters sx={{minWidth: "340px"}} maxWidth="xl">
      <QwirkleAppBar />
      <Outlet />
    </Container>
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
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <RouterProvider router={router} />
  </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();