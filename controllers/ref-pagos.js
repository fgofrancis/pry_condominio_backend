const resumenPagos = async(req, res = response) => {

    const apartamentos = await Apartamento.find({estatus:true});
    const apartamentoIds = apartamentos.map(a => a._id);
  
    let matchStage = {}; // Inicializar la etapa de $match como un objeto vacío
  
    if (req.query.anio) { // Verificar si el parámetro de anio está definido
      const anio = parseInt(req.query.anio); // Convertir a entero
      matchStage = { $match: { $expr: { $eq: [{ $year:'$fechageneracion' }, anio] } } };
    }
  
    const pagos = await Pago.aggregate([
      { $match: { idapartamento: { $in: apartamentoIds }, estatus: true } },
      matchStage, // Agregar la etapa de $match condicionalmente
      { $group: { _id: { idapartamento: "$idapartamento", mes: { $month: "$fechageneracion" } }, monto: { $sum: "$monto" } } },
      { $group: { _id: "$_id.idapartamento", pagosPorMes: { $push: { mes: "$_id.mes", monto: "$monto" } }, total: { $sum: "$monto" } } },
      { $lookup: { from: "apartamentos", localField: "_id", foreignField: "_id", as: "apartamento" } },
      { $project: { codigo: { $arrayElemAt: [ "$apartamento.codigo", 0 ] }, pagosPorMes: 1, total: 1 } }
    ]);
  
    // Transformar saldosPorMes para usar nombres de mes en lugar de números
    pagos.forEach((c) => {
      const pagosPorMes = {};
      c.pagosPorMes.forEach((s) => {
        const mes = new Date(Date.UTC((2022), s.mes , 1)).toLocaleString('default', { month: 'short' });
        const mes_limpio = mes.replace('.','');
        pagosPorMes[mes_limpio] = s.monto;
      });
      c.pagosPorMes = pagosPorMes;
    });
  
    // Ordenar por codigo de apartamento
    pagos.sort( (a,b)=>{
      if( a.codigo < b.codigo ){
          return -1;
      }
      if( a.codigo > b.codigo ){
          return 1;
      }
      return 0;
    }); 
  
    res.status(200).json({
      ok:true,
      pagosPorApartamento: pagos
    });
  };
  