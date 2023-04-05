
if (updateDocs.modifiedCount > 0) {
    const pagodetalle = await Pagodetalle.find({ idpago: idpagoDB }).sort({ _id: 1 });
  
    console.log('Pagodetalle..: ', pagodetalle);
  
    let fechaUltimaCuota = null;
    let isAbono = false;
  
    for (const pdetalle of pagodetalle) {
      const cuotaDB = await Cuota.findById(pdetalle.idcuota);
      console.log('cuotaDB.fechacuota...: ', cuotaDB.fechacuota);
  
      if (cuotaDB.motivo === '1' || pdetalle.fechageneracion.toDateString() !== cuotaDB.fechageneracion.toDateString()) {
        await Cuota.findByIdAndUpdate(
          { _id: pdetalle.idcuota },
          { $inc: { saldo: pdetalle.monto }, senal: 1 },
          { session }
        );
  
        fechaUltimaCuota = cuotaDB.fechacuota;
        console.log('Cuota normal..: ', fechaUltimaCuota);
      } else if (cuotaDB.motivo === '2' && pdetalle.fechageneracion.toDateString() === cuotaDB.fechageneracion.toDateString()) {
        await Cuota.findByIdAndUpdate(
          { _id: pdetalle.idcuota },
          { estatus: false },
          { session }
        );
  
        isAbono = true;
        console.log('Cuota Abono..: ', fechaUltimaCuota);
      }
    }
  
    const newSaldo = isAbono ? saldoantedelpago : montoDB;
    console.log('newSaldo..:', newSaldo);
    console.log('Cuota normal..Final..: ', fechaUltimaCuota);
  
    await Apartamento.findByIdAndUpdate(
      { _id: idapartametoDB },
      {
        $inc: { saldomantenimiento: newSaldo },
        fechaultimacuota: fechaUltimaCuota
      },
      { session }
    );
  
    await Pago.findByIdAndUpdate(
      { _id: idpagoDB },
      { estatus: false },
      { session }
    );
  }

  