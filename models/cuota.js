const {Schema, model }= require('mongoose');

const cuotaSchema = Schema({

    idapartamento:{
        type:Schema.Types.ObjectId,
        ref:'Apartamento',
        required:true
    },

    fechageneracion:{
        type:Date,
        default: Date.now()
    },
    fechacuota:{
        type:Date,
        default: Date.now()
    },
    monto:{
        type:Number,
        default:0
    },
    saldo:{
        type:Number,
        default:0
    },
    estatus:{
        type:Boolean,
        default:true
    },
    senal:{
        type:String,
        default:1
    },
    //Pendiente cambiar este campo a number 
    motivo:{
        type:String,
        default: 1
    }
});

module.exports = model('Cuota', cuotaSchema);