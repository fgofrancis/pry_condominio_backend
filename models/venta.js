const { Schema, model } = require('mongoose');

const VentaSchema = Schema({

    idcliente:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'Cliente'
    },
    idusuario:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'Usuario'
    },
    monto:{
        type:Number,
        default:0
    },
    fecha:{
        type:Date,
        default:Date.now()
    },
    estado:{
        type:Boolean,
        default:true
    }

});
VentaSchema.methods.toJSON = function (){
    const { __v, ...data} = this.toObject()
    return data
}

module.exports = model('Venta',VentaSchema);