const { Schema, model } = require('mongoose');

const propietarioSchema = Schema({
    identificacion:{
        type:String,
        required:true,
        unique:true
    },

    nombre:{
        type:String
    },

    // apartamentos:{ esto se maneja como prestamos y cuotas, aquí será prop - apto
    //     type: String //pendiente modificar, debe ser de tipo array de obj
    // },

    telefonos:{
         celular:{
            type:String
         },
         casa:{
            type:String
         },
         trabajo:{
            type:String
         }
    },
    
    direccion:{
        type:String
    },
    estatus:{
        type:Boolean,
        default:true
    }

});

module.exports = model('Propietario', propietarioSchema)