const pool = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, description, address, is_open FROM restaurants ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getWithMenu = async (req, res, next) => {
  try {
    const r = await pool.query('SELECT * FROM restaurants WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ message: 'Restaurant not found' });

    const menu = await pool.query(
      'SELECT id, name, description, price, image_url FROM menu_items WHERE restaurant_id = $1 AND is_available = TRUE ORDER BY name',
      [req.params.id]
    );
    res.json({ ...r.rows[0], menu: menu.rows });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, address } = req.body;
    if (!name) return res.status(400).json({ message: 'Restaurant name is required' });

    const { rows } = await pool.query(
      'INSERT INTO restaurants (owner_id, name, description, address) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.id, name, description || null, address || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.addMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, image_url } = req.body;
    if (!name || price == null) return res.status(400).json({ message: 'Name and price are required' });

    // only the owner (or an admin) can edit this restaurant's menu
    const r = await pool.query('SELECT owner_id FROM restaurants WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ message: 'Restaurant not found' });
    if (req.user.role !== 'admin' && r.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not your restaurant' });
    }

    const { rows } = await pool.query(
      `INSERT INTO menu_items (restaurant_id, name, description, price, image_url)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.id, name, description || null, price, image_url || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};
