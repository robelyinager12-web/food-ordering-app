INSERT INTO restaurants (name, description, address) VALUES
  ('Habesha Kitchen', 'Traditional Ethiopian dishes', 'Bole Road'),
  ('Burger Spot', 'Fresh burgers and fries', 'Piazza');

INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
  (1, 'Doro Wat', 'Spicy chicken stew with injera', 250),
  (1, 'Shiro', 'Chickpea stew with injera', 120),
  (1, 'Kitfo', 'Minced beef with spiced butter', 300),
  (2, 'Classic Burger', 'Beef patty, cheese, lettuce', 180),
  (2, 'French Fries', 'Crispy and salted', 70);
