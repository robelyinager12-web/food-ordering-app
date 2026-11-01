const pool = require('../config/db');

// returns an error object if the user may NOT manage this restaurant
const checkOwner = async (req, restaurantId) => {
  const { rows } = await pool.query('SELECT owner_id FROM restaurants WHERE id = $1', [restaurantId]);
  if (!rows.length) return { status: 404, message: 'Restaurant not found' };
  if (req.user.role !== 'admin' && rows[0].owner_id !== req.user.id) {
    return { status: 403, message: 'Not your restaurant' };
  }
  return null;
};

/* ---------- public (customers) ---------- */

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

/* ---------- owners / admin ---------- */

exports.mine = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM restaurants WHERE owner_id = $1 OR $2::text = 'admin' ORDER BY id`,
      [req.user.id, req.user.role]
    );
    res.json(rows);
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

exports.update = async (req, res, next) => {
  try {
    const problem = await checkOwner(req, req.params.id);
    if (problem) return res.status(problem.status).json({ message: problem.message });

    const { name, description, address, is_open } = req.body;
    const { rows } = await pool.query(
      `UPDATE restaurants SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         address = COALESCE($3, address),
         is_open = COALESCE($4, is_open)
       WHERE id = $5 RETURNING *`,
      [name ?? null, description ?? null, address ?? null, is_open ?? null, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.menuAll = async (req, res, next) => {
  try {
    const problem = await checkOwner(req, req.params.id);
    if (problem) return res.status(problem.status).json({ message: problem.message });

    const { rows } = await pool.query(
      'SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY id',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.addMenuItem = async (req, res, next) => {
  try {
    const problem = await checkOwner(req, req.params.id);
    if (problem) return res.status(problem.status).json({ message: problem.message });

    const { name, description, price, image_url } = req.body;
    if (!name || price == null || Number(price) < 0) {
      return res.status(400).json({ message: 'Name and a valid price are required' });
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

exports.updateMenuItem = async (req, res, next) => {
  try {
    const problem = await checkOwner(req, req.params.id);
    if (problem) return res.status(problem.status).json({ message: problem.message });

    const { name, description, price, image_url, is_available } = req.body;
    const { rows } = await pool.query(
      `UPDATE menu_items SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         image_url = COALESCE($4, image_url),
         is_available = COALESCE($5, is_available)
       WHERE id = $6 AND restaurant_id = $7 RETURNING *`,
      [name ?? null, description ?? null, price ?? null, image_url ?? null, is_available ?? null,
       req.params.itemId, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Menu item not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.deleteMenuItem = async (req, res, next) => {
  try {
    const problem = await checkOwner(req, req.params.id);
    if (problem) return res.status(problem.status).json({ message: problem.message });

    const { rowCount } = await pool.query(
      'DELETE FROM menu_items WHERE id = $1 AND restaurant_id = $2',
      [req.params.itemId, req.params.id]
    );
    if (!rowCount) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    // 23503 = item is referenced by old orders
    if (err.code === '23503') {
      return res.status(409).json({ message: 'This item is in past orders. Mark it unavailable instead.' });
    }
    next(err);
  }
};
