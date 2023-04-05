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
        buscarProcesoCuotaMax,
        resumenCuotas,
        validarSaldos
     } = require('../controllers/cuotas.controller');


const router = Router();


router.get('/', getCuotas);

router.post('/', crearCuota);
router.get('/generarcuotas/:fechacuotas', generarCuotas);
router.get('/procesocuotamax/', buscarProcesoCuotaMax);

router.get('/resumen/:anio',resumenCuotas);
router.get('/validasaldo',validarSaldos);
router.get('/:id', buscarCuotaById);

router.get('/apto/:idapartamento',buscarCuotaByIdApartamento);

router.delete('/:idapartamento',deleteCuotaByIdApartamento);
router.put('/proceso',procUdateCuotaApto);


module.exports = router;
