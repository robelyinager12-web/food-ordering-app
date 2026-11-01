const router = require('express').Router();
const ctrl = require('../controllers/restaurant.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', ctrl.list);
router.get('/:id', ctrl.getWithMenu);
router.post('/', auth, role('restaurant', 'admin'), ctrl.create);
router.post('/:id/menu', auth, role('restaurant', 'admin'), ctrl.addMenuItem);

module.exports = router;
