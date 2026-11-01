const crypto = require('crypto');
const pool = require('../config/db');
const { chapaSecretKey, publicUrl } = require('../config/env');

const CHAPA = 'https://api.chapa.co/v1';

const chapaFetch = async (path, options = {}) => {
  if (!chapaSecretKey) {
    const err = new Error('Online payment is not configured on the server');
    err.status = 500;
    throw err;
  }
  const res = await fetch(`${CHAPA}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${chapaSecretKey}`,
      'Content-Type': 'application/json',
    },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, body };
};

// Asks Chapa whether this payment really succeeded, then marks the order paid.
// Never trusts the app, the callback, or the webhook body on its own.
const verifyAndMark = async (txRef) => {
  const { rows } = await pool.query(
    'SELECT id, total, payment_status FROM orders WHERE tx_ref = $1',
    [txRef]
  );
  const order = rows[0];
  if (!order) return { found: false, paid: false };
  if (order.payment_status === 'paid') return { found: true, paid: true };

  const { ok, body } = await chapaFetch(`/transaction/verify/${encodeURIComponent(txRef)}`);
  const tx = body.data;

  const paid =
    ok &&
    body.status === 'success' &&
    tx &&
    tx.status === 'success' &&
    String(tx.currency).toUpperCase() === 'ETB' &&
    Number(tx.amount) >= Number(order.total);

  if (paid) {
    await pool.query(
      `UPDATE orders SET payment_status = 'paid', paid_at = NOW()
       WHERE id = $1 AND payment_status <> 'paid'`,
      [order.id]
    );
  }
  return { found: true, paid: Boolean(paid) };
};

// POST /api/payments/chapa/init  { orderId }
exports.initChapa = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const { rows } = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
       FROM orders o JOIN users u ON u.id = o.user_id
       WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, req.user.id]
    );
    const order = rows[0];

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.payment_method !== 'online') {
      return res.status(400).json({ message: 'This order is cash on delivery' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'This order was cancelled' });
    }

    // if an earlier attempt was actually paid, do not charge twice
    if (order.tx_ref) {
      const prior = await verifyAndMark(order.tx_ref);
      if (prior.paid) return res.json({ paid: true });
    }

    const txRef = `FO-${order.id}-${crypto.randomBytes(6).toString('hex')}`;
    await pool.query('UPDATE orders SET tx_ref = $1 WHERE id = $2', [txRef, order.id]);

    const [first, ...rest] = (order.user_name || 'Customer').trim().split(/\s+/);

    const payload = {
      amount: String(order.total),
      currency: 'ETB',
      email: order.user_email,
      first_name: first,
      last_name: rest.join(' ') || first,
      tx_ref: txRef,
      return_url: `${publicUrl}/api/payments/return`,
      customization: { title: 'Food Order', description: `Order ${order.id}` },
    };
    if (/^(09|07)\d{8}$/.test(order.user_phone || '')) payload.phone_number = order.user_phone;
    // the callback is server-to-server, so it only works with a public https address
    if (publicUrl.startsWith('https://')) payload.callback_url = `${publicUrl}/api/payments/chapa/callback`;

    const { ok, body } = await chapaFetch('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!ok || !body.data?.checkout_url) {
      const message = typeof body.message === 'string' ? body.message : JSON.stringify(body.message);
      return res.status(502).json({ message: `Payment provider error: ${message}` });
    }

    res.json({ paid: false, checkoutUrl: body.data.checkout_url });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/chapa/verify  { orderId }
exports.verifyChapa = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT tx_ref FROM orders WHERE id = $1 AND user_id = $2',
      [req.body.orderId, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Order not found' });
    if (!rows[0].tx_ref) return res.json({ paid: false });

    const result = await verifyAndMark(rows[0].tx_ref);
    res.json({ paid: result.paid });
  } catch (err) {
    next(err);
  }
};

// Chapa calls this after a payment (needs a public https URL). Always re-verifies.
exports.callback = async (req, res) => {
  try {
    const ref = req.query.trx_ref || req.query.tx_ref;
    if (ref) await verifyAndMark(String(ref));
  } catch (err) {
    console.error('Callback error:', err.message);
  }
  res.sendStatus(200);
};

// Webhook: used only as a signal to re-verify with Chapa, so a fake one cannot mark anything paid.
exports.webhook = async (req, res) => {
  try {
    const ref = req.body?.tx_ref || req.body?.trx_ref;
    if (ref) await verifyAndMark(String(ref));
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
  res.sendStatus(200);
};

// Page shown in the phone's browser after paying
exports.returnPage = (req, res) => {
  res.send(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Payment</title></head>
<body style="font-family:sans-serif;text-align:center;padding:48px 24px">
<h2>Thank you!</h2><p>You can close this window and return to the app.</p></body></html>`);
};
