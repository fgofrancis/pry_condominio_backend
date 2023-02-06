
const { Schema, model } = require('mongoose');

const CategoriaSchema = Schema({
    nombre:{
        type:String,
        required:[true, 'El nombre es obligatorio'],
        unique:true
    },
    estado:{
        type:Boolean,
        required:true,
        default:true
    },
    usuario:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'Usuario'
    }
});
CategoriaSchema.methods.toJSON = function(){
    const {__v,estado, ...data} = this.toObject();
    return data
}

module.exports = model('Categoria', CategoriaSchema);

 