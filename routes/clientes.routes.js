const { Router } = require('express');
const { getClientes,
        getClientesById, 
        crearCliente,
        actualizarClienteById,
        borrarClienteById
      } = require('../controllers/clientes.controller');

const router = Router();

router.get('/',getClientes);

router.get('/:id', getClientesById);

router.post('/', crearCliente);

router.put('/:id',actualizarClienteById);

router.delete('/:id',borrarClienteById);

module.exports = router;