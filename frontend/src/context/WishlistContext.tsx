import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  savedIds: Set<number>;
  toggleWishlist: (id: number) => Promise<void>;
  isWishlisted: (id: number) => boolean;
  savedCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      api.getWishlist()
        .then((items) => {
          setSavedIds(new Set(items.map((i) => i.id)));
        })
        .catch(() => {});
    } else {
      setSavedIds(new Set());
    }
  }, [isAuthenticated]);

  const toggleWishlist = async (id: number) => {
    try {
      const res = await api.toggleWishlist(id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (res.is_saved) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    } catch (e) {
      // Local optimistic fallback
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }
  };

  const isWishlisted = (id: number) => savedIds.has(id);

  return (
    <WishlistContext.Provider
      value={{
        savedIds,
        toggleWishlist,
        isWishlisted,
        savedCount: savedIds.size,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
