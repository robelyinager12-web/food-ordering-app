const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// public (Chapa and the browser call these)
router.get('/return', ctrl.returnPage);
router.get('/chapa/callback', ctrl.callback);
router.post('/chapa/webhook', ctrl.webhook);

// logged-in customers
router.post('/chapa/init', auth, role('customer'), ctrl.initChapa);
router.post('/chapa/verify', auth, role('customer'), ctrl.verifyChapa);

module.exports = router;
