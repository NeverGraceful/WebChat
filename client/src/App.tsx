import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {AuthentLayout} from './components/AuthentLayout';
import {LoginPage} from './components/LoginPage';
import {SignupPage} from './components/SignupPage';

function App() {
  return (
    <BrowserRouter>
      <AuthentLayout>
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </AuthentLayout>
    </BrowserRouter>
  );
}

export default App;
