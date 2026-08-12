import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

interface UserRoleContextType {
  role: UserRole;
  userName: string;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  isManager: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

const USER_ROLE_KEY = 'hubtask_user_role';

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(USER_ROLE_KEY);
    return (saved as UserRole) || 'manager';
  });

  // Current logged in user name
  const userName = 'Jonathan Müller';

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(USER_ROLE_KEY, newRole);
  };

  const toggleRole = () => {
    const nextRole = role === 'manager' ? 'member' : 'manager';
    setRole(nextRole);
  };

  return (
    <UserRoleContext.Provider
      value={{
        role,
        userName,
        setRole,
        toggleRole,
        isManager: role === 'manager',
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};
