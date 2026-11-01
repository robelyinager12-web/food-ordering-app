const router = require('express').Router();
const ctrl = require('../controllers/restaurant.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

const owner = [auth, role('restaurant', 'admin')];

// public
router.get('/', ctrl.list);

// owner (keep /mine ABOVE /:id)
router.get('/mine', ...owner, ctrl.mine);
router.post('/', ...owner, ctrl.create);

router.get('/:id', ctrl.getWithMenu);
router.patch('/:id', ...owner, ctrl.update);

router.get('/:id/menu/all', ...owner, ctrl.menuAll);
router.post('/:id/menu', ...owner, ctrl.addMenuItem);
router.patch('/:id/menu/:itemId', ...owner, ctrl.updateMenuItem);
router.delete('/:id/menu/:itemId', ...owner, ctrl.deleteMenuItem);

module.exports = router;
