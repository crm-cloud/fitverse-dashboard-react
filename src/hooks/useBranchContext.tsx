
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { useBranches } from './useBranches';

interface BranchContextType {
  currentBranchId: string | null;
  setCurrentBranchId: (branchId: string | null) => void;
  canAccessBranch: (branchId: string) => boolean;
  getAccessibleBranches: () => string[];
}

const BranchContext = createContext<BranchContextType | null>(null);

export const useBranchContext = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranchContext must be used within BranchContextProvider');
  }
  return context;
};

export const BranchContextProvider = ({ children }: { children: ReactNode }) => {
  const { authState } = useAuth();
  const { selectedBranch } = useBranches();
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);

  useEffect(() => {
    if (authState.user) {
      // Set current branch based on user's primary branch or selected branch
      const branchId = authState.user.branchId || selectedBranch?.id || null;
      setCurrentBranchId(branchId);
    } else {
      setCurrentBranchId(null);
    }
  }, [authState.user, selectedBranch]);

  const canAccessBranch = (branchId: string): boolean => {
    if (!authState.user) return false;
    
    // Super Admin can access all branches
    if (authState.user.role === 'super-admin') return true;
    
    // Admin can access all branches
    if (authState.user.role === 'admin') return true;
    
    // Team and Member can only access their assigned branch
    return authState.user.branchId === branchId;
  };

  const getAccessibleBranches = (): string[] => {
    if (!authState.user) return [];
    
    if (authState.user.role === 'super-admin' || authState.user.role === 'admin') {
      return ['all']; // Indicates access to all branches
    }
    
    return authState.user.branchId ? [authState.user.branchId] : [];
  };

  return (
    <BranchContext.Provider value={{
      currentBranchId,
      setCurrentBranchId,
      canAccessBranch,
      getAccessibleBranches
    }}>
      {children}
    </BranchContext.Provider>
  );
};
