const { Schema, model} = require('mongoose');

const apartamentoSchema = Schema({
    codigo:{
        type:String,
        required:true,
        unique:true
    },
    planta:{
        type:String
    },
    idbloque:{
        type:Schema.Types.ObjectId,
        ref:'Bloque',
        required:true
    },
    saldomantenimiento:{
        type:Number,
        default:0
    },
    idpropietario:{
        type:Schema.Types.ObjectId,
        ref:'Propietario',
        required:true
    },
    habitado:{
        type:String,
        required:true,
        emun: ['Propietario', 'Inquilino', 'Vacío'],
        default:'Propietario'
    },
    fechaultimacuota:{
        type:Date
    },
    estatus:{
        type:Boolean,
        default:true
    },
    usuario:{
        type:Schema.Types.ObjectId,
        ref:'Usuario',
        required:true
    }


});

module.exports = model('Apartamento', apartamentoSchema);
