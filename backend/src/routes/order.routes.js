const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.use(auth);

router.post('/', role('customer'), ctrl.create);
router.get('/mine', ctrl.myOrders);
router.get('/restaurant', role('restaurant', 'admin'), ctrl.incomingOrders);
router.get('/:id', ctrl.getOne);
router.patch('/:id/status', role('restaurant', 'admin'), ctrl.updateStatus);

module.exports = router;
