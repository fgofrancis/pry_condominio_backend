
const jwt = require('jsonwebtoken'); 

// Al JWT solo lo estamos formando con el uid, podriamos usar mas datos.
const generarJWT = ( uid='' )=>{

    return new Promise((resolve, reject)=>{

        const payload = { uid };
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY,{
            expiresIn:'12h'
        }, ( err, token )=>{
            if( err){
                console.log(err);
                reject('No se pudo generar el token')
            }else{
                resolve( token );
            }
        })
    })
}

module.exports ={
    generarJWT
}