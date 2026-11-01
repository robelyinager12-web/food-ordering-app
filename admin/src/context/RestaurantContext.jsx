import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import client from '../api/client.js';

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const { data } = await client.get('/restaurants/mine');
      setRestaurant(data[0] || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <RestaurantContext.Provider value={{ restaurant, loading, reload }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export const useRestaurant = () => useContext(RestaurantContext);
