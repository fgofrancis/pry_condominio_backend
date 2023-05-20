const mongoose = require('mongoose');
const { response }= require('express');
const { firstDayLastDayMonth } = require('../helpers/range-date');
const Apartamento = require('../models/apartamento');
const bloque = require('../models/bloque');
const Cuota = require("../models/cuota");
const Procesocuota = require('../models/procesocuota');


const FECHABASE = '1972-06-27';
const getCuotas = async(req, res=response)=>{

    const cuotas = await Cuota.find().populate('idapartamento', 'codigo');

/* esto es para trabajar con el total ademas de las cuotas 
    const [cuotas, tolal ] = await Promise.all([
        Cuota.find({idapartamento:idapartamento}).populate('idapartamento'),
        Cuota.aggregate([{$group: {_id:null, total:{$sum:"$saldo"}}}])       

    ])
*/
    res.status(200).json({
        ok:true,
        cuotas,
        
    })
};
const crearCuota = async (req, res=response)=>{

    // const { idapartamento } = req.params;
    const {estatus, ...data } = req.body;

    const cuotaExist = await Cuota.find({
                                        $and:[{idapartamento:data.idapartamento},
                                              {senal:'1'}, {estatus:true}]
                                        });
    if(cuotaExist.length > 0 ){
        return res.status(400).json({
            ok:false,
            msg:'Cuota ya existe para este mes'
        })
    };

    const cuota = new Cuota(data);
    await cuota.save();

    res.status(200).json({
        ok:true,
        cuota
    })
};

const generarCuotas = async (req, res=response)=>{

    // const FECHABASE = '1972-06-27';
    const {fechacuotas } = req.params

    const fechaCompara   = new Date(FECHABASE);
    const fecpagoCompara = new Date(fechacuotas);

    const [startDate,endDate] = firstDayLastDayMonth(fechacuotas);

    try {
         //Verificar si el proceso ya ha sido ejecutado
           const procesoCuota = await Procesocuota.findOne( {fechaproceso:startDate, estatus:true} );

           if (procesoCuota ){
                return res.status(400).json({
                    msg:'Proceso Cuota ya fue Generado para este mes'
                })
            }
  
           //Buscar los apartamentos
           const apartamentoDB = await Apartamento.find({estatus:true}).populate('idbloque');

           if(!apartamentoDB){
               return res.status(400).json({
                   ok:false,
                   msg:'No existen apartamentos'
               })
            }

            // const nuevasCuotas = [];
            const nuevasCuotas = await Promise.all(
              apartamentoDB.map( async(apto)=>{
                const query = fecpagoCompara.toDateString() === fechaCompara.toDateString()
                  ? [ { idapartamento:apto._id}, {estatus:true} ]
                  : [
                      { idapartamento:apto._id},
                      { estatus:true },
                      { fechacuota: {$gte:startDate, $lte:endDate} }
                    ];     

                const cuotaExist = await Cuota.find( {$and:query} );
                if(cuotaExist.length > 0  || !cuotaExist){
                    return null
                };

                let cuotaData ={
                    idapartamento:apto._id,
                    monto: apto.idbloque.cuota,
                    saldo: apto.idbloque.cuota,
                    fechageneracion: new Date(),
                    fechacuota: startDate,
                    senal: '1'
                };

                const cuota = new Cuota(cuotaData);
                await cuota.save()

                //actualiar el saldo del apartamento y fecha ultima cuota
                let saldoMantenimiento = 0;
                saldoMantenimiento = parseFloat(apto.saldomantenimiento) + parseFloat(cuota.monto);
                await Apartamento.findByIdAndUpdate(  {_id:cuota.idapartamento},
                                                      {
                                                       saldomantenimiento:saldoMantenimiento,
                                                       fechaultimacuota:cuota.fechacuota
                                                      },
                                                      {new:true}
                );

                return cuota;
              })
            );

            // Filtrar cuotas nulas
            let cuotas = nuevasCuotas.filter((cuota) => cuota !== null);

            // Buscar cuotas para retornarlas, solo las del proceso
            const nuevasCuotasIds = cuotas.map( c =>c._id);
            cuotas = await Cuota.find({_id:{ $in:nuevasCuotasIds} }).populate('idapartamento', 'codigo saldomantenimiento')
                                                                                                          
            //Insertar proceso del mes
            let dataproc = {
                fechaproceso:startDate
            }
             const procCuota = new Procesocuota(dataproc);
             await procCuota.save()


            res.status(200).json({
                ok:true,
                cuotas
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                ok:false,
                msg:'Error, Hable con el Administrador'
            })   
        }
};
const buscarCuotaById = async(req, res=response)=>{

    const {id} = req.params;
    
    const cuota = await Cuota.findById(id).populate('idapartamento');
                                                      
    if(!cuota){
        return res.status(400).json({
            ok:false,
            msg:'Este cuota no existe'
        })
    };

    res.status(200).json({
        ok:true,
        cuota
    })

};

const buscarCuotaByIdApartamento = async(req, res=response)=>{

    const {idapartamento} = req.params;
    const query = {idapartamento:idapartamento, senal:'1',estatus:true};
    
    const cuotas = await Cuota.find(query).populate('idapartamento')
                              .sort({fechacuota:1});

    res.status(200).json({
        ok:true,
        cuotas
    })
 }

 /**
  * Esto es para usarlo en la pruebas de generar cuotas y pagar cuotas
  * @param {} req 
  * @param {*} res 
  */
 const deleteCuotaByIdApartamento = async(req, res=response)=>{

    const {idapartamento} = req.params;
    const query = {idapartamento:idapartamento };
    const cuotas = await Cuota.deleteMany(query)

    res.status(200).json({
        ok:true,
        cuotas
    })
 }

 // Proceso que actualiza cuotas( apto -> cuota)
 const procUdateCuotaApto = async(req, res)=>{
 
    console.log('procUdateCuotaApto...')    
     const Apto = await Apartamento.find();  
     
     Apto.forEach( async(apto)=>{
        //  const cuota = await Cuota.find( {idapartamento:apto._id});
         const cuota = await Cuota.findOneAndUpdate( {idapartamento:apto._id}, 
                                               { monto:apto.saldomantenimiento, 
                                                 saldo:apto.saldomantenimiento}
                                             );
     });

    res.status(200).json({
        ok:true,
        Apto

    }) 
 };

 const buscarProcesoCuotaMax = async(req, res=response) =>{

    try {
        //Denny it get me an array with only row, I will like catch in an object 
        const procesocuotamax = await Procesocuota.findOne({estatus:true}).sort({fechaproceso:-1}).limit(1);

        const [startDate,endDate] = firstDayLastDayMonth(procesocuotamax.fechaproceso);

     
        res.status(200).json({
            ok:true,
            endDate
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok:false,
            msg:'Error, Hable con el administrador'
        })
    }

 }

//  const resumenCuotas = async(req, res=response)=>{

//     try {
        
//         const saldoTotal = await Cuota.aggregate([
//             {
//               $match: {
//                 senal: '1',
//                 estatus: true
//               }
//             },
//             {
//               $group: {
//                 _id: '$idapartamento',
//                 total: { $sum: '$saldo' }
//               }
//             }
//           ]);
//           res.status(200).json({
//             ok:true,
//             saldoTotal
//           })
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             ok:false,
//             mgs:'Error hable con el Administrador'
//         })
//     }
//  };

// const resumenCuotas = async(req, res = response) => {

//     const apartamentos = await Apartamento.find({estatus:true}).sort({codigo:1});
//     // const apartamentos = await Apartamento.find({codigo:'A-102'});
//     // const apartamentos = await Apartamento.find({codigo: {$in:['A-102', 'B-104', 'D-105']} });
//     const saldosPorApartamento = [];
  
//     for (const apartamento of apartamentos) {
//       const cuotas = await Cuota.find({ idapartamento: apartamento._id, estatus:true, senal:'1' });
  
//       const saldosPorMes = {};
//       let total = 0;
//       for (const cuota of cuotas) {
//         const mes = new Date(cuota.fechacuota).toLocaleString('default', { month: 'short' });
//         const mes_limpio = mes.replace('.','');

//         if (!saldosPorMes[mes_limpio]) {
//           saldosPorMes[mes_limpio] = cuota.saldo;
//         } else {
//           saldosPorMes[mes_limpio] += cuota.saldo;
//         }

//         total += cuota.saldo;
//       }
  
//       const saldoPorApartamento = {
//         codigo: apartamento.codigo,
//         saldosPorMes: saldosPorMes,
//         total: total
//       };
  
//       saldosPorApartamento.push(saldoPorApartamento);
//     }
  
//     // return saldosPorApartamento;
//   res.status(200).json({
//     ok:true,
//     saldosPorApartamento
//   })

//   };  
  
const resumenCuotas = async(req, res = response) => {

    const apartamentos = await Apartamento.find({estatus:true});
    const apartamentoIds = apartamentos.map(a => a._id);

    let matchStage = { $match:{ $expr:{ $eq:[1,1]}}}; 

    const { anio } = req.params;
    if( anio !== '1' ){
      // console.log('entró..', anio)
      matchStage = {$match:{ $expr:{ $eq:[{ $year:'$fechacuota'}, parseInt(anio)]} }}
    }
  
    const cuotas = await Cuota.aggregate([
      {
        $match: {
          idapartamento: { $in: apartamentoIds },
          estatus: true
        }
      },
      matchStage,
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
  
    // Transformar saldosPorMes para usar nombres de mes en lugar de números
    cuotas.forEach((c) => {
        const saldosPorMes = {};
        c.saldosPorMes.forEach((s) => {
        //   const mes = new Date(Date.UTC(2022, s.mes - 1, 1)).toLocaleString('default', { month: 'short' });
         const mes = new Date(Date.UTC((2022), s.mes , 1)).toLocaleString('default', { month: 'short' });
         const mes_limpio = mes.replace('.','');
         saldosPorMes[mes_limpio] = s.saldo;
        });
        c.saldosPorMes = saldosPorMes;
      });

    // Ordenar por codigo de apartamento
    cuotas.sort( (a,b)=>{
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
      saldosPorApartamento: cuotas
    });
};
const validarSaldos = async(req, res=response)=>{

    const saldoAtpoCuota = await Apartamento.aggregate([
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
            codigo:"$codigo",
            saldo:"$saldomantenimiento",
            saldoEnCuota: {
              $sum: "$cuotas.saldo"
            }
          }
        }
    ]);
   
    /**
     * Ambas instrucciones son validas, solo que la primera es mas resumida, Denny
     */
    // const saldosDiff = saldoAtpoCuota.filter(item => item.saldo !== item.saldomantenimiento);   
    const saldosDiff = saldoAtpoCuota.filter((item)=>{
       return  item.saldo !== item.saldoEnCuota
    });

    res.status(200).json({
        ok:true,
        saldosDiff
    })
}

const R_generarCuotaExtraordinaria = async(req, res=response)=>{
  console.log('generarCuotaExtraordinaria');
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const monto = 2000;
    const fechacuota = '07-04-2023';
    const idapto = null //'6361478ca9043c9bd54ac138'

    const motivo = idapto? '4': '3' ;
    const query  = idapto? {estatus:true, _id:idapto}:{estatus:true};
    console.log('query..:*** ', query);

    const apartamentoDB = await Apartamento.find(query ).select({_id:1, saldomantenimiento:1});
    // console.log(idapartamento, motivo);

    if (apartamentoDB.length === 0) {
      await session.abortTransaction();

      return res.status(404).json({
        ok: false,
        msg: 'No se encontraron apartamentos',
      });
    }
    
    const nuevasCuotas = [];
    
    for (const apartamento of apartamentoDB){
      console.log('in for cuota', apartamento);

      const dataCuota = {
        idapartamento:apartamento._id,
        fechacuota:fechacuota,
        monto:monto,
        saldo:monto,
        motivo: motivo
      };   

      // console.log('dataCuota', dataCuota);

      const cuota = new Cuota(dataCuota);
      nuevasCuotas.push(cuota);
      console.log('nuevasCuotas', nuevasCuotas);

      await cuota.save({session});

      let saldomantenimiento = parseFloat(apartamento.saldomantenimiento) + parseFloat(cuota.monto)

      await Apartamento.findByIdAndUpdate(
        { _id:apartamento._id },
        { saldomantenimiento:saldomantenimiento },
        { new:true, session }
      );
    };

    // await session.commitTransaction();
    await session.abortTransaction();
    session.endSession();

    // const cuotasNuevas = await Cuota.find( {_id: {$in: nuevasCuotas.map( c=>c._id)} });

    const [cuotasNuevas, total] = await Promise.all([
      Cuota.find({ _id: {$in: nuevasCuotas.map( c=>c._id)} }),
      Cuota.find({ _id: {$in: nuevasCuotas.map( c=>c._id)} }).countDocuments()
    ]);

    res.status(200).json({
      ok:true,
      msg:'Cuota Extraordinaria Generada',
      cuotas:cuotasNuevas,
      cantidad:total,
      motivo
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log(error)
    return res.status(500).json({
          ok:false,
          msg:'Error generando Cuota Extraordinaria'
    });
  } finally{
    session.endSession();
  }
};

//  Sustituyendo findByIdAndUpdate por bulkWrite 
const generarCuotaExtraordinaria = async(req, res=response)=>{

  const session = await mongoose.startSession();
  session.startTransaction();

  const CUOTAEXTRA = 3;
  const NOTADEBITO = 4;

  try {
    
    const {monto, idapto} = req.params;
    // const {monto, idapto, comentario, fechacuota} = req.body; pendiente cambio
    const fechacuota = new Date();
  
    const motivo = idapto? NOTADEBITO: CUOTAEXTRA ;
    const query  = idapto? {estatus:true, _id:idapto}:{estatus:true};

    const apartamentoDB = await Apartamento.find(query ).select({_id:1, saldomantenimiento:1});

    if (apartamentoDB.length === 0) {
      await session.abortTransaction();

      return res.status(404).json({
        ok: false,
        msg: 'No se encontraron apartamentos',
      });
    };

    const bulkOps = [];
    const nuevasCuotas = [];
    
    for (const apartamento of apartamentoDB){
    
      const dataCuota = {
        idapartamento:apartamento._id,
        fechacuota:fechacuota,
        monto:monto,
        saldo:monto,
        motivo: motivo
      };   
    

      const cuota = new Cuota(dataCuota);
    
      bulkOps.push({
        updateOne: {
          filter: { _id: apartamento._id },
          update: { $inc: { saldomantenimiento: cuota.monto } }
        }
      });

      nuevasCuotas.push(cuota);

      await cuota.save({session});
    };
    
    await Apartamento.bulkWrite(bulkOps, { session });

    // Buscar solo las nuevas cuotas insertadas
    // const cuotasNuevas = await Cuota.find({ _id: {$in: nuevasCuotas.map(c=>c._id) }})
        
    const [cuotasNuevas, total] = await Promise.all([
      Cuota.find({ 
        _id:{$in: nuevasCuotas.map(c=>c._id)},
        // estatus:true,
        // saldo: {$gt:0},
        // motivo:{ $in: [3, 4] } 
      })
        .populate('idapartamento','codigo').sort({idapartamento:1})
        .session(session),

      Cuota.find({ _id:{$in: nuevasCuotas.map(c=>c._id)} })
        .countDocuments()
        .session(session)
    ]);
    
    await session.commitTransaction();
    // await session.abortTransaction();
    session.endSession();

    res.status(200).json({
      ok:true,
      msg:'Cuota Extraordinaria Generada',
      cuotas:cuotasNuevas,
      cantidad:total,
      motivo
    });

  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      ok:false,
      msg:'Error generando Cuota Extraordinaria'
    })
  } finally{
    session.endSession();
  }

}

module.exports ={
    crearCuota,
    getCuotas,
    generarCuotas,
    buscarCuotaById,
    buscarCuotaByIdApartamento,
    deleteCuotaByIdApartamento,
    procUdateCuotaApto,
    buscarProcesoCuotaMax,
    resumenCuotas,
    validarSaldos,
    generarCuotaExtraordinaria
}