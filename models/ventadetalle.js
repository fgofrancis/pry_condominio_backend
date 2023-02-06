const { Schema, model } = require('mongoose');

const VentadetalleSechema = Schema({

    idproducto:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'Producto'
    },

    cantidad:{
        type:Number,
        default:0
    },
    
    idventa:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'Venta'
    }

});
VentadetalleSechema.methods.toJSON = function (){
    const {__v, ...data} = this.toObject();
    return data
}
module.exports = model('Ventadetalle', VentadetalleSechema);
