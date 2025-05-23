import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Инициализация состояния из localStorage
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  });

  // Синхронизация с localStorage при изменении user
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Общая функция для создания mock-пользователя
  // const createMockUser = (credentials) => ({
  //   id: Date.now(),
  //   username: credentials.username,
  //   email: credentials.email,
  //   first_name: 'Ivan',
  //   last_name: 'Ivanov',
  //   created_at: new Date().toISOString(),
  // });

  const login = async (credentials) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      // const API_URL = 'http://localhost:8000';
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const result = await response.json();
      if (result.success) setUser(result.data);
      return result;
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const register = async (credentials) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      // const API_URL = 'http://localhost:8000';
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const result = await response.json();
      if (result.success) setUser(result.data);
      return result;
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout,
      register // Добавляем метод регистрации
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);