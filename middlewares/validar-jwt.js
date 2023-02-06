const { request, response } = require("express")
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const validarJWT = async(req = request, res=response, next)=>{

    const token =req.header('x-token');
    
    if(!token){
        return res.status(401).json({
            ok:false,
            msg:'No hay token'
        })
    };
 
    try {

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        // Buscar usuario autenticado
        const usuario = await Usuario.findById( uid );
        
        if (!usuario){
            return res.status(401).json({
                ok:false,
                msg:`Usuario No existe en DB - fué borrado físicamente`
            })
        };

        if (!usuario.estado){
            return res.status(401).json({
                ok:false,
                msg:`Usuario logeado está inavilitado - estado false `
            })
        };

        // Tomo el uid del usuario logeado
        // req.usuario = usuario;
        req.uid = uid;
  
        next();

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            ok:false,
            msg:'Token no válido'
        })
    }


}

module.exports ={
    validarJWT
}