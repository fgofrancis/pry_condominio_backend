const { request, response } = require("express")


const esAdminRole = (req=request, res=response, next )=>{

    if(!req.usuario){
        return res.status(500).json({
            ok:false,
            msg:`Se quiere validar el Role sin validar el Token primero`
        })
    };

    const {role, nombre} = req.usuario;

    if(role !=='ADMIN_ROLE'){
        return res.status(401).json({
            ok:false,
            msg:`El usuario ${nombre} no es un administrador`
        })
    }

    next();
};
 
const tieneRole = (...roles)=>{
    return (req=request, res=response, next )=>{
        
        if(!req.usuario){
            return res.status(500).json({
                ok:false,
                msg:`Se quiere validar el Role sin validar el Token primero`
            })
        };
        
        if(!roles.includes(req.usuario.role) ){
            return res.status(401).json({
                ok:false,
                msg:`El servicio requiere uno de estos roles ${roles}`
            })
        }

        next();
    }
};

module.exports ={
    esAdminRole,
    tieneRole
}