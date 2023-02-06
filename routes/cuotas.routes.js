/**
 * cuotas:         '/api/cuotas'
 */
const { Router} = require('express');
const { crearCuota,
        getCuotas, 
        generarCuotas,
        buscarCuotaById,
        buscarCuotaByIdApartamento,
        deleteCuotaByIdApartamento,
        procUdateCuotaApto,
        buscarProcesoCuotaMax
     } = require('../controllers/cuotas.controller');


const router = Router();

router.get('/', getCuotas);

router.post('/', crearCuota);
router.get('/generarcuotas/:fechacuotas', generarCuotas);
router.get('/procesocuotamax/', buscarProcesoCuotaMax);

/**
 * Para probar los get de abajo debo deshabiliar uno u otro. Denny
 */
router.get('/:id', buscarCuotaById);
router.get('/apto/:idapartamento',buscarCuotaByIdApartamento)

router.delete('/:idapartamento',deleteCuotaByIdApartamento)
router.put('/proceso',procUdateCuotaApto)

module.exports = router;
