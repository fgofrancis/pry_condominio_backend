const generarCuotas = async (req, res) => {
    const { fechacuotas } = req.params;
    const fechaCompara = new Date(FECHABASE);
    const fecpagoCompara = new Date(fechacuotas);
    const [startDate, endDate] = firstDayLastDayMonth(fechacuotas);
  
    try {
      const queryProc = { fechaproceso: startDate, estatus: true };
      const procesocuotaExist = await Procesocuota.find(queryProc);
  
      if (procesocuotaExist.length > 0) {
        return res.status(400).json({
          msg: 'Proceso Cuota ya fue Generado para este mes'
        });
      }
  
      const apartamentoDB = await Apartamento.find({ estatus: true }).populate('idbloque');
  
      if (!apartamentoDB) {
        return res.status(400).json({
          ok: false,
          msg: 'No existen apartamentos'
        });
      }
  
      await Promise.all(
        apartamentoDB.map(async (apto) => {
          const query =
            fecpagoCompara.toDateString() === fechaCompara.toDateString()
              ? [{ idapartamento: apto._id }, { estatus: true }]
              : [
                  { idapartamento: apto._id },
                  { estatus: true },
                  { fechacuota: { $gte: startDate, $lte: endDate } }
                ];
  
          const cuotaExist = await Cuota.find({ $and: query }).lean();
  
          if (cuotaExist.length) {
            return;
          }
  
          const cuotaData = {
            idapartamento: apto._id,
            monto: apto.idbloque.cu
  