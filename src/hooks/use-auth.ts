import { useAuthStore, User } from "../store/auth-store.ts";

export function useAuth() {
  const { user, setUser, clearUser, isLoading, setIsLoading } = useAuthStore();

  const isAuthenticated = !!user;

  // Stand-in session structure for compatibility
  const session = isAuthenticated 
    ? { 
        id: `session-${user?.id}`, 
        userId: user?.id, 
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
      } 
    : null;

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    clearUser();
    // Refresh the page or trigger path redirection to login
    window.location.hash = "#/login";
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    login,
    logout,
    setIsLoading,
  };
}

export default useAuth;
