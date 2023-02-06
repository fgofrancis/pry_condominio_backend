
const { Router} = require('express');
const { check } = require('express-validator');

const { validarJWT, validarCampos, esAdminRole } = require('../middlewares');

const {
     getCategorias,
     postCategoria, 
     putCategoriaById,
     delCategoriaById,
     getCategoriasById
    } = require('../controllers/categorias.constroller');
const { existCategoriaById } = require('../helpers/db-validators');


const router = Router();

// Obtener todas las categorías - público
router.get('/',
    [
        validarJWT
    ],getCategorias);

// Obtener una categogía por id - público
router.get('/:id',
    [
        validarJWT,
        check('id', 'El id no es un Id Válido').isMongoId(),
        check('id').custom(existCategoriaById),
        validarCampos
    ],getCategoriasById);
 
// Crear una categoría privado - cualquier persona con un token válido
router.post('/',
    [
        validarJWT,
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        validarCampos
    ],postCategoria);

// Actualizar - privado - cualquier con token válido
router.put('/:id',
    [
        validarJWT,
        check('id', 'El id no es un Id Válido').isMongoId(),
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('id').custom(existCategoriaById),
        validarCampos
    ],putCategoriaById);

// Borrar una categiría - Admin
router.delete('/:id',
    [
        validarJWT,
        esAdminRole,
        check('id', 'El id no es un Id Válido').isMongoId(),
        check('id').custom(existCategoriaById),
        validarCampos
    ],delCategoriaById);
 
module.exports = router;

