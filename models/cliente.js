const { Schema, model } = require('mongoose');

const ClienteSchema = Schema({
    nombre:{
        type:String,
    },

    identificacion:{
        type:String
    },

    correo:{
        type:String
    },

    puntos:{
        type:Number,
        default:0
    },
    estado:{
        type:Boolean,
        required:true,
        default:true
    }
});
ClienteSchema.methods.toJSON = function(){
    const {__v, ...data}=this.toObject();
    return data
}

module.exports = model('Cliente', ClienteSchema )