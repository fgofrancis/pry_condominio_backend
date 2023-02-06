
const {Schema, model }= require('mongoose');

const pagodetalleSchema = Schema({

    idpago:{
        type:Schema.Types.ObjectId,
        ref:'Pago',
        required:true
    },

    idcuota:{
        type:Schema.Types.ObjectId,
        ref:'Cuota',
        required:true
    },

    fechageneracion:{
        type:Date,
        default: Date.now()
    },
    monto:{
        type:Number,
        default:0
    },
    
    estatus:{
        type:Boolean,
        default:true
    }

});

module.exports = model('Pagodetalle', pagodetalleSchema);
