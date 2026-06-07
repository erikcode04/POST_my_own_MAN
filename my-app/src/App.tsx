import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProjectTab from './components/project_tab';
import LoginModal from './components/login_modal';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  return (
    <>
      <ProjectTab />
      {!user && <LoginModal />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
