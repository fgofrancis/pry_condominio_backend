
const { Router } = require('express');
const { getBloques, 
        crearBloque,
        buscarBloqueById,
        actualizarBloqueById,
        eliminarBloqueById
     } = require('../controllers/bloques.controller');


const router = Router();

router.get('/',getBloques);

router.get('/:id',buscarBloqueById);

router.post('/',crearBloque);

router.put('/:id',actualizarBloqueById);
router.delete('/:id',eliminarBloqueById);
module.exports = router;