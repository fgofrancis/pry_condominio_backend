
const { Schema, model } = require('mongoose');


const formapagoSchema = Schema({
    
    formapago: {
      type:String 
    },
    estatus:{
     type:Boolean,
     default:true
    }  

});

module.exports = model('Formapago', formapagoSchema);