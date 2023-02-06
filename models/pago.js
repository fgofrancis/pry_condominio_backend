const {Schema, model }= require('mongoose');

const pagoSchema = Schema({

    idapartamento:{
        type:Schema.Types.ObjectId,
        ref:'Apartamento',
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
    // formapago:{
    //     type:String,
    //     emun: ['Deposito','Transferencia', 'Efectivo', 'Cheque','Nota de Crédito'],
    //     default:'Tranferencia'
    // },
    idformapago:{
        type:Schema.Types.ObjectId,
        ref:'Formapago',
        required:true
    },
    estatus:{
        type:Boolean,
        default:true
    },
    comentario:{
        type:String,
        default:''
    },
    saldoantedelpago:{
        type:Number,
        default:0
    },
    saldodespuesdelpago:{
        type:Number,
        default:0
    }

});

module.exports = model('Pago', pagoSchema);



  