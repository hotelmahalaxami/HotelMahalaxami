import React from 'react';
import { AuthProvider } from '../features/auth/AuthContext';
import AppRouter from './Router';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
