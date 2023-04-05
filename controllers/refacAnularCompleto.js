const resumenCuotas = async(req, res = response) => {

  const apartamentos = await Apartamento.find({estatus:true}).sort({codigo:1});

  const saldosPorApartamento = [];

  for (const apartamento of apartamentos) {
    const cuotas = await Cuota.find({ idapartamento: apartamento._id, estatus:true });

    const saldosPorMes = {};
    let total = 0;
    for (const cuota of cuotas) {
      const mes = new Date(cuota.fechacuota).toLocaleString('default', { month: 'short' });
      const mes_limpio = mes.replace('.','');

      if (!saldosPorMes[mes_limpio]) {
        saldosPorMes[mes_limpio] = cuota.saldo;
      } else {
        saldosPorMes[mes_limpio] += cuota.saldo;
      }

      total += cuota.saldo;
    }

    console.log('saldosPorMes..:', saldosPorMes);
    const saldoPorApartamento = {
      codigo: apartamento.codigo,
      saldosPorMes: saldosPorMes,
      total: total
    };

    saldosPorApartamento.push(saldoPorApartamento);
  }

  res.status(200).json({
    ok:true,
    saldosPorApartamento
  })

};


//Mira veo que en la collection apartamento solo tengo 72 apartamento pero el 
//reporte me genera mas de 72 lineas y esto no está bien.
// ** Solucion
/**
 Para solucionar esto, puedes intentar hacer una consulta para obtener solo las 
 cuotas de los apartamentos que están en la colección de apartamentos. 
 Podrías hacerlo de la siguiente manera:
 */
 // Primero, obtén todos los apartamentos de la colección de Apartamentos:
 const apartamentos = await Apartamento.find();

 /**
  Luego, obtén solo las cuotas de los apartamentos que están en la colección 
  de Apartamentos:
 */
  const cuotas = await Cuota.find({ idapartamento: { $in: apartamentos.map(apto => apto._id) }});






