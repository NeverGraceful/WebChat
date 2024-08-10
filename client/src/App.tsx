// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
// import { AuthLayout } from './components/AuthLayout';
// import { LoginPage } from './components/LoginPage';
// import { SignupPage } from './components/SignupPage';
// import { AuthProvider } from './components/context/AuthContext';
// import { RootLayout } from './components/RootLayout';
// import { HomePage } from './components/HomePage';
// import { Channel } from './components/Channel'

// function App() {
//   return (
//     <BrowserRouter>
//       <ContextWrapper>
//         <Routes>
//           <Route path="/" element={<RootLayout />}>
//             <Route index element={<HomePage />} />
//             <Route path="channel/new" element={<Channel />} />
//           </Route>
//           <Route element={<AuthLayoutWrapper />}> {/* Use the wrapper component */}
//             <Route path="/login" element={<LoginPage />} />
//             <Route path="/signup" element={<SignupPage />} />
//           </Route>
//           <Route path="/" element={<Navigate replace to="/login" />} />
//         </Routes>
//       </ContextWrapper>
//     </BrowserRouter>
//   );
// }

// const AuthLayoutWrapper: React.FC = () => {
//   return (
//     <AuthLayout>
//       <Outlet />
//     </AuthLayout>
//   );
// };

// function ContextWrapper({children}) {
//   return (
//     <AuthProvider>
//       {children}
//     </AuthProvider>
//   );
// }

// export default App;
