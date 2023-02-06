const { Router } = require('express');
const { check } = require('express-validator');
const { uploadFile, actualizarImagen, mostrarImagen, actualizarImagenCloudinary } = require('../controllers/uploads.controller');
const { validarCampos,validarArchivo } = require('../middlewares');
const {  collectionsPermitidas } = require('../helpers');


const router = Router();

router.post('/',
    [
        validarArchivo
    ], uploadFile);
router.put('/:collection/:id',
    [
        check('id', 'El id debe ser un id de mongo').isMongoId(),
        check('collection').custom( c=>collectionsPermitidas( c, ['usuarios','productos']) ),
        validarArchivo,
        validarCampos
    ], 
    // actualizarImagen,
    actualizarImagenCloudinary);

router.get('/:collection/:id',
        [
            check('id', 'El id debe ser un id de mongo').isMongoId(),
            check('collection').custom( c=>collectionsPermitidas( c, ['usuarios','productos']) ),
            validarCampos
    ], mostrarImagen);

module.exports=router;