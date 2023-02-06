const { Schema, model } = require('mongoose'); // Denny what mean it mensaje?

const procesocuotaSchema = Schema({

    fechaproceso:{
        type:Date
    },
    estatus:{
       type: Boolean,
       default:true
    }
})

module.exports = model('Procesocuota', procesocuotaSchema);