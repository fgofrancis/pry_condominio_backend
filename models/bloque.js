const { Schema, model} = require('mongoose');

const bloqueSchema = Schema({

    codigo:{
        type:String,
        required:true,
    },

    cuota:{
        type:Number,
        required:true,
    },

    tipo:{
        type:String
    },

    ubicacion:{
        type:String
    },

    estatus:{
        type:Boolean,
        default:true
    }

});

module.exports = model('Bloque', bloqueSchema);