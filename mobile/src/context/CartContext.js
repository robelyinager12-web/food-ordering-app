import React, { createContext, useContext, useMemo, useState } from 'react';
import { Alert } from 'react-native';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null); // { id, name }
  const [items, setItems] = useState([]);

  const makeLine = (item) => ({
    menuItemId: item.id,
    name: item.name,
    price: Number(item.price),
    quantity: 1,
  });

  const addItem = (rest, item) => {
    // a cart can only hold food from one restaurant
    if (restaurant && restaurant.id !== rest.id && items.length) {
      Alert.alert(
        'Start a new cart?',
        `Your cart has items from ${restaurant.name}. Clear it and order from ${rest.name} instead?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, start new',
            onPress: () => {
              setRestaurant({ id: rest.id, name: rest.name });
              setItems([makeLine(item)]);
            },
          },
        ]
      );
      return;
    }

    setRestaurant({ id: rest.id, name: rest.name });
    setItems((prev) => {
      const found = prev.find((i) => i.menuItemId === item.id);
      if (found) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, makeLine(item)];
    });
  };

  const changeQty = (menuItemId, delta) => {
    setItems((prev) => {
      const next = prev
        .map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0);
      if (!next.length) setRestaurant(null);
      return next;
    });
  };

  const clear = () => {
    setItems([]);
    setRestaurant(null);
  };

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ restaurant, items, total, count, addItem, changeQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
