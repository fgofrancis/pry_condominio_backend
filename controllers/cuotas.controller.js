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
    // console.log('fechacuota..: ', fechacuotas)

    const fechaCompara   = new Date(FECHABASE);
    const fecpagoCompara = new Date(fechacuotas);

    const [startDate,endDate] = firstDayLastDayMonth(fechacuotas);

    try {
         //Buscar si el proceso ya ha sido ejecutado
           const queryProc = {fechaproceso:startDate, estatus:true};
           const procesocuotaExist = await Procesocuota.find(queryProc);



           if (procesocuotaExist.length > 0 ){
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

            apartamentoDB.forEach( async(apto)=>{

                let query = '';
                if (fecpagoCompara.toDateString() === fechaCompara.toDateString()){
                    query = [{idapartamento:apto._id}, {estatus:true}]
                }else{
                    query = [{idapartamento:apto._id}, {estatus:true},
                    {fechacuota: {$gte:startDate, $lte:endDate}}]
                }    

                const cuotaExist = await Cuota.find( {$and:query} );
                // db.posts.find({created_on: {$gte: start, $lt: end}}); It is between

                if(cuotaExist.length > 0  || !cuotaExist){
                    // console.log('Ya hay cuotas, no insert')
                    return;
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
                saldoMantenimiento = parseInt(apto.saldomantenimiento) + parseInt(cuota.monto);
                await Apartamento.findByIdAndUpdate({_id:cuota.idapartamento},
                                                    {saldomantenimiento:saldoMantenimiento,
                                                     fechaultimacuota:cuota.fechacuota}, {new:true});
            });

            // buscar cuotas para retornarlas
            const cuotas = await Cuota.find().populate('idapartamento');

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
    const query = {idapartamento:idapartamento, senal:'1'};
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
        const procesocuotamax = await Procesocuota.find({estatus:true}).sort({fechaproceso:-1}).limit(1);

        res.status(200).json({
            ok:true,
            procesocuotamax
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok:false,
            msg:'Error, Hable con el administrador'
        })
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
    buscarProcesoCuotaMax
}