const { Router, response } = require('express');
const { check } = require('express-validator');
const {registrarVenta,
      findSalesById, 
      listSales,
      detailSale
      } = require('../controllers/ventas.controllers');
const { existVentaById } = require('../helpers');
const { validarCampos, validarJWT } = require('../middlewares');

const router = Router();

router.post('/registrar',
         [
        //      validarJWT
         ],registrarVenta);
router.get('/detalles',
        [
            validarJWT   
        ],detailSale);
router.get('/:id',
        [
            validarJWT,
            check('id', 'Este id no es un id valido').isMongoId(),
            check('id').custom(existVentaById),
            validarCampos   
        ],findSalesById);
router.get('/',
        [
         validarJWT
        ],listSales);





module.exports = router;