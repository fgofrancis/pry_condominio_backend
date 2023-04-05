
const resumenCuotas = async(req, res = response) => {

    const apartamentos = await Apartamento.find({estatus:true}).sort({codigo:1});
    const apartamentoIds = apartamentos.map(a => a._id);
  
    const cuotas = await Cuota.aggregate([
      {
        $match: {
          idapartamento: { $in: apartamentoIds },
          estatus: true
        }
      },
      {
        $group: {
          _id: {
            idapartamento: "$idapartamento",
            mes: { $month: "$fechacuota" }
          },
          saldo: { $sum: "$saldo" }
        }
      },
      {
        $group: {
          _id: "$_id.idapartamento",
          saldosPorMes: {
            $push: {
              mes: "$_id.mes",
              saldo: "$saldo"
            }
          },
          total: { $sum: "$saldo" }
        }
      },
      {
        $lookup: {
          from: "apartamentos",
          localField: "_id",
          foreignField: "_id",
          as: "apartamento"
        }
      },
      {
        $project: {
          codigo: { $arrayElemAt: [ "$apartamento.codigo", 0 ] },
          saldosPorMes: 1,
          total: 1
        }
      }
    ]);
  
    res.status(200).json({
      ok:true,
      saldosPorApartamento: cuotas
    });
  };
  

  // Transformar saldosPorMes para usar nombres de mes en lugar de números
cuotas.forEach((c) => {
  const saldosPorMes = {};
  c.saldosPorMes.forEach((s) => {
    const mes = new Date(Date.UTC(2022, s.mes - 1, 1)).toLocaleString('default', { month: 'short' });
    saldosPorMes[mes] = s.saldo;
  });
  c.saldosPorMes = saldosPorMes;
});
