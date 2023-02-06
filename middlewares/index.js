
const  validarCampos = require('../middlewares/validar-campos');
const  validarJWT    = require('../middlewares/validar-jwt');
const  validaRoles   = require('../middlewares/validar-role');
const  validaArchivo = require('../middlewares/validar-archivo');


module.exports={
    ...validarCampos,
    ...validarJWT,
    ...validaRoles,
    ...validaArchivo
}