// import React from 'react';
import { useAuth } from './context/AuthContext';

const DebugStorage = () => {
  const { clearStorage } = useAuth();

  return (
    <div>
      <button onClick={clearStorage}>Clear Storage</button>
    </div>
  );
};

export default DebugStorage;