const router = require('express').Router();
const controller = require('./controller');
const { auth } = require('../auth');

router
  .route('/')
  .post(controller.create)
  .get(auth, controller.all);

router
  .route('/reporte')
  .post(auth, controller.buscarByDocenteEncuestaPadres)

router.param('id', controller.id);

router
  .route('/:id')
  .get(auth, controller.read)
  .put(auth, controller.update)
  .delete(auth, controller.delete);

module.exports = router;
