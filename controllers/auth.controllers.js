const {response } = require('express');

const Usuario = require('../models/usuario');
const passcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/generar-jwt');
const { googleVerify } = require('../helpers/google-verify');


const login =  async(req, res=response )=>{
    const {correo, password} = req.body;

    try {
        //Verificar si el email existe
        const usuario = await Usuario.findOne({correo});

        if (!usuario){
            return res.status(400).json({
                ok:false,
                msg:`Usuario / Password no son correctos - correo`
            })
        };

        //Verificar si el usuario está activo
        if(!usuario.estado){
            return res.status(400).json({
                ok:false,
                msg:`Usuario / Password no son correctos - estado:false`
            })
        };

        //Verificar si la contraseña es correcta
        const validarPassword = passcrypt.compareSync(password, usuario.password);
        if(!validarPassword){
            return res.status(400).json({
                ok:false,
                msg:`Usuario / Password no son correctos - password`
            })
        };

        //Generar el JWT
        const token = await generarJWT(usuario.id);

        res.json({
            usuario,
            token
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok:false,
            msg:'Hable con el Administrador - login'
        })
    }
}

const googleSignIn = async(req, res=response)=>{

    const { id_token } = req.body;

    try {
        const { nombre, img, correo } = await googleVerify(id_token);
        // const googleuser = await googleVerify(id_token);
        // console.log(googleuser);

        let usuario = await Usuario.findOne( {correo} )

        if(!usuario){
            //Tengo q crear el usuario
            const data = {
                nombre,
                correo,
                password: ':p',
                img,
                google:true
            };

            usuario = new Usuario(data);
            await usuario.save();
        }

        // Si el usuario en DB
        if(!usuario.estado){
            return res.status(401).json({
                ok:false,
                msg:'Hable con el Administrador, usuario bloqueado, Google-Sign In'
            })
        }

        //  Generar el JWT
         const token = await generarJWT(usuario.id);

        res.json({
            ok:true,
            usuario,
            token
        })

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok:false,
            msg:'Error en Google Sign In - Hablar con el Administrador'
        })
    }

}

//En el backend-cond no exitia este method
const renewToken = async(req, res= response )=>{

    // console.log('estoy aqui en renewToken')
    // const { uid, email, companiaID } = req;
    const { uid } = req;
    
    // Generar el TOKEN - JWT
    // const token = await generarJWT(uid, email, companiaID);
    const token = await generarJWT(uid);

    //Obtener el usuarioDB por UID
    const usuarioDB = await Usuario.findById(uid);

    if(!usuarioDB){
        return res.json({
            ok: false,
            msg:'Usuario no existe por ese UID'
        });
    }

    res.json({
        ok:true,
        token,
        usuarioDB
    });
}
module.exports ={
    login,
    googleSignIn,
    renewToken
}