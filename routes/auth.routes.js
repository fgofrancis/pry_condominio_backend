
const { Router } = require('express');
const { check } = require('express-validator');

const { login, googleSignIn, renewToken } = require('../controllers/auth.controllers');
const { validarJWT } = require('../middlewares');
const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();

router.post('/login',
    [
        check('correo', 'El correo es obligatorio').not().isEmpty(),
        check('correo', 'El correo es obligatorio').isEmail(),
        check('password', 'La contraseña es obligatoria').not().isEmpty(),
        validarCampos
    ],login);

router.post('/google',
    [
        check('id_token', 'El id_token es necesario').not().isEmpty(),
        validarCampos
    ],googleSignIn);

router.get('/renew/token',
validarJWT,
renewToken)

module.exports = router;