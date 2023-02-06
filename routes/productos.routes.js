const {Router, response} = require('express');
const { check } = require('express-validator');

const { validarJWT, validarCampos, esAdminRole } = require('../middlewares');

const { getProductos,
        getProductoById, 
        postProducto,
        putProductoById,
        delProductoById
    } = require('../controllers/productos.controller');
const { existProductoById } = require('../helpers/db-validators');


const router = Router();

router.get('/',
    [
     validarJWT
    ],getProductos);

router.get('/:id',
    [
        validarJWT,
        check('id', 'El id debe ser un id válido').isMongoId(),
        check('id').custom(existProductoById),
        validarCampos
    ],getProductoById);

router.post('/',
    [
        validarJWT,
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('categoria', 'La categoría es obligatoria, debe ser idMongo').isMongoId(),
        validarCampos
    ], postProducto);

router.put('/:id',
    [
        validarJWT,
        check('id', 'El id debe ser un id válido').isMongoId(),
        check('id').custom(existProductoById),
        validarCampos
    ],putProductoById);

router.delete('/:id',
    [
        validarJWT,
        esAdminRole,
        check('id', 'El id debe ser un id válido').isMongoId(),
        check('id').custom(existProductoById),
        validarCampos
    ],delProductoById);

module.exports = router;