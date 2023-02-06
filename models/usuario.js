const { Schema, model } = require('mongoose');

const usuarioSchema = Schema({
    nombre:{
        type:String,
        required:[true, 'El nombre es obligatorio'],
      },

    correo:{
        type:String,
        required:[true, 'El corre es obligatorio'],
        unique:true
    },

    password:{
        type:String,
        required:[true, 'El contraseña es obligatoria'],
    },

    img:{
        type:String,
    },

    role:{
        type:String,
        required:true,
        emun: ['ADMIN_ROLE', 'USER_ROLE'],
        default:'USER_ROLE'
    },

    estado:{
        type:Boolean,
        default:true
    },

    google:{
        type:Boolean,
        default:false
    }
});

usuarioSchema.methods.toJSON = function(){
    const {__v, password, _id, ...user} = this.toObject();
    user.uid = _id;
    return user
}

module.exports = model( 'Usuario',usuarioSchema); 
