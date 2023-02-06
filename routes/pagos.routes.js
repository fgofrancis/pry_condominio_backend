
const {Router} = require('express');
const { pagoCuota, 
        deudaEnCuota, 
        recibos,
        buscarReciboById,
        buscarDetalleReciboByIdPago,
        buscarReciboByIdApartamento,
        buscarFormapago,
        crearFormapago
      } = require('../controllers/pagos.controller');

const router = Router();

router.post('/pago', pagoCuota)
router.get('/deuda/:idapartamento', deudaEnCuota);

router.get('/recibos',recibos);
router.get('/recibos/:id',buscarReciboById);
router.get('/recibos/apto/:idapartamento/:fecpago',buscarReciboByIdApartamento);
router.get('/recibos/detalles/:idpago',buscarDetalleReciboByIdPago);
router.get('/formapago',buscarFormapago);

router.post('/formapago',crearFormapago)


module.exports = router;