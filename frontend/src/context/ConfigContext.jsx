import { createContext, useContext } from 'react';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <ConfigContext.Provider value={{ API_BASE_URL }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};
