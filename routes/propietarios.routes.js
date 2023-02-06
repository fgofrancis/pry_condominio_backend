const { Router} = require('express');
const { getPropietario, crearPropietario, buscarPropietarioById, actualizarPropietarioById, eliminarPropietarioById
      } = require('../controllers/propietarios.controller');

const router = Router();

router.get('/',getPropietario);
router.get('/:id', buscarPropietarioById);
router.post('/',crearPropietario);

router.put('/:id',actualizarPropietarioById);

router.delete('/:id', eliminarPropietarioById);
module.exports = router;