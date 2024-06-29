import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthentLayout } from './components/AuthLayout';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { AuthProvider } from './components/context/AuthContext';
import { RootLayout } from './components/RootLayout';
import { HomePage } from './components/HomePage';

function App() {
  return (
    <BrowserRouter>
      <ContextWrapper>
        <AuthentLayout>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<HomePage />} />
              {/* <Route path="channel/new" element={<NewChannel />} /> */}
            </Route>
            <Route path="/" element={<Navigate replace to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </AuthentLayout>
      </ContextWrapper>
    </BrowserRouter>
  );
}

function ContextWrapper({children}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

export default App;
