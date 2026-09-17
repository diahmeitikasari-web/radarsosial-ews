import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { dataStorage } from '../services/dataStorage';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  loginWithOAuth: (provider: 'google', targetEmail?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'radar_sosial_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    // Default to Guru BK for immediate rich preview
    const users = dataStorage.getUsers();
    return users.find((u) => u.role === 'guru_bk') || users[0] || null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [currentUser]);

  const refreshUser = () => {
    if (currentUser) {
      const users = dataStorage.getUsers();
      const fresh = users.find((u) => u.id === currentUser.id);
      if (fresh) {
        setCurrentUser({ ...fresh });
      }
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const trimmedEmail = email.toLowerCase().trim();
    const users = dataStorage.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!found) {
      return { success: false, message: 'Alamat surel tidak terdaftar dalam sistem. Hubungi Super-Admin untuk pembuatan akun.' };
    }

    if (found.status === 'inactive') {
      return { success: false, message: 'Akun Anda sedang dinonaktifkan oleh Super-Administrator. Silakan hubungi admin sekolah.' };
    }

    // Determine expected password: check stored password or role-based default
    const expectedPassword = found.password || (
      found.role === 'admin'
        ? 'admin123456'
        : found.role === 'kepala_sekolah'
        ? 'kepsek123456'
        : 'bk123456'
    );

    if (pass !== expectedPassword) {
      return {
        success: false,
        message: 'Kata sandi tidak sesuai. Silakan gunakan tombol "Minta Kata Sandi" jika Anda lupa password.',
      };
    }

    setCurrentUser(found);
    dataStorage.addAuditLog(found.name, found.role, 'Login Berhasil', `Masuk menggunakan kredensial surel ${found.email}`);
    return { success: true, message: 'Autentikasi berhasil.' };
  };

  const loginWithOAuth = async (provider: 'google', targetEmail?: string): Promise<{ success: boolean; message: string }> => {
    const users = dataStorage.getUsers();
    let userToLogin = targetEmail
      ? users.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase())
      : null;

    if (!userToLogin) {
      // Default to Guru BK if not specified
      userToLogin = users.find((u) => u.role === 'guru_bk') || users[0];
    }

    if (userToLogin.status === 'inactive') {
      return { success: false, message: 'Akun Google ini telah dinonaktifkan oleh Super-Admin.' };
    }

    setCurrentUser(userToLogin);
    dataStorage.addAuditLog(
      userToLogin.name,
      userToLogin.role,
      'Login SSO Google OAuth 2.0',
      `Otorisasi identitas via ${provider.toUpperCase()} (${userToLogin.email})`
    );
    return { success: true, message: `Berhasil masuk dengan akun Google: ${userToLogin.email}` };
  };

  const logout = () => {
    if (currentUser) {
      dataStorage.addAuditLog(currentUser.name, currentUser.role, 'Keluar Sistem', 'Pengguna melakukan logout');
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        loginWithOAuth,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
