const generarCuotas = async (req, res = response) => {
    const { fechacuotas } = req.params;
    const [startDate, endDate] = firstDayLastDayMonth(fechacuotas);
  
    try {
      // Verificar si el proceso ya ha sido ejecutado
      const procesoCuota = await Procesocuota.findOne({ fechaproceso: startDate, estatus: true });
      if (procesoCuota) {
        return res.status(400).json({
          msg: 'El proceso de cuota ya ha sido generado para este mes',
        });
      }
  
      // Obtener todos los apartamentos con su bloque
      const apartamentos = await Apartamento.find({ estatus: true }).populate('idbloque');
  
      // Verificar si hay apartamentos
      if (apartamentos.length === 0) {
        return res.status(400).json({
          ok: false,
          msg: 'No hay apartamentos disponibles',
        });
      }
  
      // Crear todas las nuevas cuotas en paralelo
      const nuevasCuotas = await Promise.all(
        apartamentos.map(async (apartamento) => {
          const query = fechaCompara.toDateString() === fecpagoCompara.toDateString()
            ? [{ idapartamento: apartamento._id }, { estatus: true }]
            : [
                { idapartamento: apartamento._id },
                { estatus: true },
                { fechacuota: { $gte: startDate, $lte: endDate } },
              ];
  
          const cuotaExist = await Cuota.findOne({ $and: query });
  
          if (cuotaExist) {
            return null; // Retornar null para filtrar más adelante
          }
  
          const cuotaData = {
            idapartamento: apartamento._id,
            monto: apartamento.idbloque.cuota,
            saldo: apartamento.idbloque.cuota,
            fechageneracion: new Date(),
            fechacuota: startDate,
            senal: '1',
          };
  
          const cuota = new Cuota(cuotaData);
          await cuota.save();
  
          // Actualizar el saldo del apartamento y la fecha de la última cuota
          const saldoMantenimiento = parseFloat(apartamento.saldomantenimiento) + parseFloat(cuota.monto);
          await Apartamento.findByIdAndUpdate(
            { _id: cuota.idapartamento },
            { saldomantenimiento: saldoMantenimiento, fechaultimacuota: cuota.fechacuota },
            { new: true }
          );
  
          return cuota; // Retornar la nueva cuota
        })
      );
  
      // Filtrar cuotas nulas
      const cuotas = nuevasCuotas.filter((cuota) => cuota !== null);
  
      // Insertar proceso del mes
      const dataproc = {
        fechaproceso: startDate,
      };
  
      const procCuota = new Procesocuota(dataproc);
      await procCuota.save();
  
      res.status(200).json({
        ok: true,
        cuotas,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        ok: false,
        msg: 'Error, hable con el administrador',
      });
    }
  };
  