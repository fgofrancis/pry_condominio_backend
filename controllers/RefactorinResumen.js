
const CuotaSchema = new mongoose.Schema({
  // Definición de campos
});

// CuotaSchema.pre('save', async function(next) {
CuotaSchema.pre('save', async(next)=> {
  try {
    // Buscar el apartamento correspondiente a la cuota
    const apartamento = await Apartamento.findById(this.idapartamento);

    // Calcular la nueva sumatoria de los saldos de las cuotas
    const cuotas = await Cuota.find({ idapartamento: this.idapartamento, estatus:true });
    const nuevoSaldo = cuotas.reduce((acc, cuota) => acc + cuota.saldo, 0);

    // Actualizar el campo "saldo" del apartamento
    apartamento.saldo = nuevoSaldo;
    await apartamento.save();

    next();
  } catch (err) {
    next(err);
  }
});

const Cuota = mongoose.model('Cuota', CuotaSchema)
/*
Buscar saldos en apartamentos y la sumatoria de los saldos en cuotas
*/
db.apartamentos.aggregate([
  {
    $lookup: {
      from: "cuotas",
      localField: "_id",
      foreignField: "idapartamento",
      as: "cuotas"
    }
  },
  {
    $project: {
      _id: 0,
      idapartamento: "$_id",
      saldoapto:"$saldomantenimiento",
      codigo:"$codigo",
      saldomantenimiento: {
        $sum: "$cuotas.saldo"
      }
    }
  }
])

// Consulta para obtener el saldo de mantenimiento y la suma de los saldos de las cuotas por apartamento
db.apartamento.aggregate([
  {
    $lookup: {
      from: "cuotas",
      localField: "_id",
      foreignField: "idapartamento",
      as: "cuotas"
    }
  },
  {
    $project: {
      _id: 0,
      idapartamento: "$_id",
      saldomantenimiento: {
        $sum: "$cuotas.saldo"
      }
    }
  }
])

// Consulta para obtener los apartamentos cuyo saldomantenimiento sea diferente a la sumatoria de los saldos de las cuotas
db.apartamento.find({
  $expr: {
    $ne: ["$saldomantenimiento", {
      $sum: "$cuotas.saldo"
    }]
  }
}).populate("cuotas", "saldo")
