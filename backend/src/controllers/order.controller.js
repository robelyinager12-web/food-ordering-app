const pool = require('../config/db');

const STATUSES = ['accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled'];

exports.create = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;
    if (!restaurantId || !Array.isArray(items) || !items.length || !deliveryAddress) {
      return res.status(400).json({ message: 'restaurantId, items and deliveryAddress are required' });
    }

    const ids = items.map((i) => i.menuItemId);
    const menu = await client.query(
      'SELECT id, price FROM menu_items WHERE id = ANY($1) AND restaurant_id = $2 AND is_available = TRUE',
      [ids, restaurantId]
    );
    const priceMap = new Map(menu.rows.map((m) => [m.id, Number(m.price)]));

    let total = 0;
    for (const item of items) {
      const price = priceMap.get(item.menuItemId);
      const qty = Number(item.quantity);
      if (price === undefined || !Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: 'Invalid item in order' });
      }
      total += price * qty;
    }

    await client.query('BEGIN');
    const order = await client.query(
      `INSERT INTO orders (user_id, restaurant_id, total, delivery_address, payment_method)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, restaurantId, total.toFixed(2), deliveryAddress, paymentMethod || 'cash']
    );
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES ($1,$2,$3,$4)',
        [order.rows[0].id, item.menuItemId, item.quantity, priceMap.get(item.menuItemId)]
      );
    }
    await client.query('COMMIT');

    res.status(201).json(order.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
};

exports.myOrders = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, r.name AS restaurant_name
       FROM orders o JOIN restaurants r ON r.id = o.restaurant_id
       WHERE o.user_id = $1 ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const o = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    const order = o.rows[0];
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not your order' });
    }

    const items = await pool.query(
      `SELECT oi.quantity, oi.unit_price, m.name
       FROM order_items oi JOIN menu_items m ON m.id = oi.menu_item_id
       WHERE oi.order_id = $1`,
      [order.id]
    );
    res.json({ ...order, items: items.rows });
  } catch (err) {
    next(err);
  }
};

exports.restaurantOrders = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.* FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       WHERE ($1 = 'admin' OR r.owner_id = $2)
       ORDER BY o.created_at DESC`,
      [req.user.role, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const { rows } = await pool.query(
      `UPDATE orders o SET status = $1
       FROM restaurants r
       WHERE o.id = $2 AND r.id = o.restaurant_id
         AND ($3 = 'admin' OR r.owner_id = $4)
       RETURNING o.*`,
      [status, req.params.id, req.user.role, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Order not found or not yours' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
