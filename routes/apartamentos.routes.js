/**
 * path: '/api/apartamentos'
 */

const { Router } = require('express');
const {registarApartamento,
       getApartamentos, 
       buscarApartamentoById,
       actualizarApartamentoById,
       eliminarApartamentoById,
       buscarApartamentoByIdPropietario,
       eliminarApartamentoTodos
      } = require('../controllers/apartamentos.controller');
const { validarJWT } = require('../middlewares');


const router = Router();

router.post('/', validarJWT,registarApartamento)

router.get('/',getApartamentos)
router.get('/propietario/:idpropietario',buscarApartamentoByIdPropietario)

router.get('/:id',buscarApartamentoById)
router.put('/:id',actualizarApartamentoById)

// Porque estos dos juntos me dan problema..?
// Es q node.js no sabe distinguir entre un params ('/:id') y una ruta ('/borrartodos')?
// Si es así no la pondré al mismo nivel
router.delete('/:id',eliminarApartamentoById)
// router.delete('/borrartodos',eliminarApartamentoTodos)


module.exports = router