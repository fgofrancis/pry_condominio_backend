const {request, response } = require('express');
const Usuario = require('../models/usuario');
const passcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers');

const usuariosGet = async(req = request, res=response )=>{

    const {limite = 5, desde = 0 } = req.query;
    const query = {estado:true};

    // const usuarios = await Usuario.find(query)
    //                     .skip(desde)
    //                     .limit(Number(limite));

    // const total = await Usuario.countDocuments(query);

    //Mejor disparo las 2 promesas simultaneamente
    const resp = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    //Desestructurando un array
    const [total, usuarios]= resp;
    res.json({
        // resp
        total,
        usuarios
        
    }); 
}
 
const usuarioPost = async(req, res=response )=>{
    const {nombre,correo, password, role } = req.body;

    try {
       
        const usuario = new Usuario({nombre,correo, password, role});

        //Encriptar contraseña, contraseña de una sola via, solo se matchea no se reescribe
        const salt = passcrypt.genSaltSync();//este metodo genera el numero de vuelta del pass, default(10)
        usuario.password = passcrypt.hashSync(password, salt);

        await usuario.save()

        //Generar el Token - JWT
        const token = await generarJWT(usuario.id)

        res.status(200).json({
            ok:true,
            usuario,
            token
        }); 

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'Error creando usuario, Hablar con la administración'
        })
    }
}

const usuarioPut =  async(req, res=response )=>{
    const {id }= req.params;
    const {_id, password, google,correo, ...resto } = req.body;

    if (password){
        const salt = passcrypt.genSaltSync();
        resto.password = passcrypt.hashSync(password, salt);
    };

    const usuario = await Usuario.findByIdAndUpdate(id, resto, {new:true} );
    res.status(201).json({
        ok:true,
        usuario
    }); 
}

const usuarioDelete =  async(req, res=response )=>{
    const {id }= req.params;
    const userAuth = req.usuario;
  
    //Borrar fisicamente sería
    //const usuario = await Usuario.findByIdAndDelete(id);

    const usuario = await Usuario.findByIdAndUpdate(id, {estado:false}, {new:true} );
    res.status(201).json({
        ok:true,
        usuario,
        userAuth:userAuth,
    }); 
}

const usuarioPatch = (req, res=response )=>{
    res.json({
        ok:true,
        msg:'patch Api - Controlador'
    }); 
}

module.exports ={
    usuariosGet,
    usuarioPut,
    usuarioPost,
    usuarioDelete,
    usuarioPatch  
}