const router = require('express').Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', require('./auth.routes'));
router.use('/restaurants', require('./restaurant.routes'));
router.use('/orders', require('./order.routes'));
router.use('/payments', require('./payment.routes'));

module.exports = router;
