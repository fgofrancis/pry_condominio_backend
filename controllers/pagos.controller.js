const { response } = require("express");
const { firstDayLastDayMonth } = require("../helpers/range-date");
const Apartamento = require("../models/apartamento");
const Cuota = require("../models/cuota");
const Formapago = require('../models/formapago');
const Pago  = require('../models/pago');
const Pagodetalle = require("../models/pagodetalle");

const deudaEnCuota = async(req, res)=>{

    const {idapartamento } = req.params;
    
    const cuotas = await Cuota.find({
                        $and:[{idapartamento:idapartamento},
                            {senal:'1'}, {estatus:true}]
                    });

    let totalDeuda = 0;
    cuotas.forEach( (cuota)=>{
        totalDeuda += cuota.saldo 
    })
   
    res.status(200).json({
        ok:true,
        totalDeuda,
        cuotas
    })
};

const pagoCuota = async(req, res)=>{

    const {idapartamento, monto, fecha, idformapago, comentario } = req.body
 
    // return

    let pago = monto;
    let arrPagodetalle =[];

    //Actualizar Balance del apartamento
    const apartamentoDB = await Apartamento.findById(idapartamento);

    let balance = 0;
    let saldoantedelpago = 0;
    let saldodespuesdelpago = 0;

    saldoantedelpago = parseFloat(apartamentoDB.saldomantenimiento);
    if ( parseFloat(monto) <= parseFloat(apartamentoDB.saldomantenimiento)   ){
        balance = parseFloat(apartamentoDB.saldomantenimiento) - parseFloat(monto);
        saldodespuesdelpago = balance;
        await Apartamento.findByIdAndUpdate({_id:idapartamento},{saldomantenimiento: balance}, {new:true} )
    };

    //REGISTRAR PAGO
    let pagoData ={
        idapartamento:idapartamento,
        fechageneracion:fecha,
        monto:monto,
        idformapago:idformapago,
        comentario:comentario,
        saldoantedelpago,
        saldodespuesdelpago
    };
    
    const pagoRegistrado = new Pago(pagoData);
    await pagoRegistrado.save();

    //Aplicar pago a cuotas
    let cuotas = await Cuota.find({
                        $and:[{idapartamento:idapartamento},
                            {senal:'1'}, {estatus:true}]
                    });
    
    if(cuotas){

        let result=0 ,montoAplicado = 0;
        
        // forEach nunca para, el every lo recorre todo y luego para, el some para al instante
            cuotas.every( async(cuota)=>{
                result = cuota.saldo - pago;

                if(pago == 0){
                    // console.log('pago == 0', pago);
                    return false;
                 }

                if (result < 0){
                    montoAplicado = cuota.saldo;
                    cuota.saldo = 0;
                    pago = Math.abs(result);
                    cuota.senal = 0;
                    // return;
                };
        
                if (result == 0){
                    montoAplicado = cuota.saldo;
                    cuota.saldo = 0;
                    pago = result;
                    cuota.senal = 0;
                    // return;
                };
        
                if (result > 0){
                    montoAplicado = pago;
                    cuota.saldo = result;
                    pago = 0;
                    // return;
                };
        
                //Para evitar actualizar el id de la cuota
                const {_id, ...data} = cuota;
    
                //Crear detalle del pago
                let pagoDetalleData = {
                    idcuota: cuota._id,
                    idpago:pagoRegistrado._id,
                    fechageneracion:fecha,
                    monto:montoAplicado
                };
    
                const pagoDetalle = new Pagodetalle(pagoDetalleData);
                await pagoDetalle.save();
        
                 // Aplicar pago a cuota de último
                 await Cuota.findByIdAndUpdate(cuota._id, data, {new:true});

             })

    }
 
    // PAGO POR ADELANTADO
    let newCuota = [];

    if(pago > 0 ){
       newCuota =  aplicarPagoAdelantado(idapartamento,pagoRegistrado._id, pago,fecha)
    }

    res.status(200).json({
        ok:true,
        monto,
        cuotas,
        newCuota,
        // resto
        resto:pago
    })
}

const aplicarPagoAdelantado = async(idapartamento,idpago, pago, fecha)=>{

    const apartamentoDB = await Apartamento.findById({_id:idapartamento})
                                            .populate('idbloque');

    let saldoCuota = 0;
    let senalCuota = 0;
    let newCuota = [];
    let unitMonth = 0;
    let montoAplicado = 0;
    let fechaUltCuota = apartamentoDB.fechaultimacuota;
    let newFechacuota = new Date(); // Por que dice que este valor no se lee nunca, Denny?

    const date = new Date(fechaUltCuota); //debe ser en base a la fecha del recibo, revisar esto****

    const [ day, month, year] = [date.getDate(),
                                 date.getMonth(), 
                                 date.getFullYear()];
    unitMonth =  month;   
    while (pago > 0) {
        unitMonth ++;
        this.newFechacuota = new Date(year,unitMonth, '01' ); 
        let newFechageneracion = new Date(fecha ); 

        let result = apartamentoDB.idbloque.cuota - pago

        if (result < 0 ){
            montoAplicado = apartamentoDB.idbloque.cuota
            saldoCuota = 0;
            pago = Math.abs(result);
            senalCuota = 0;
          };

        if (result == 0 ){
            montoAplicado = apartamentoDB.idbloque.cuota
            saldoCuota = 0;
            pago = result;
            senalCuota = 0;
        };

        if (result > 0 ){
            montoAplicado = pago;
            saldoCuota = result;
            pago = 0;
            senalCuota = 1;
        };

        let dataCuota = {
            idapartamento: apartamentoDB._id,
            monto:apartamentoDB.idbloque.cuota,
            saldo: saldoCuota,
            motivo: 2,
            senal: senalCuota,
            fechageneracion:newFechageneracion,
            fechacuota: this.newFechacuota //agregar *** debe ser la fecha ultima cuota + 1 mes.
        };

        //Crear cuota pago adelantado
        newCuota = new Cuota(dataCuota);
        await newCuota.save();

        //Crear detalle del pago
        let pagoDetalleData = {
            idcuota: newCuota._id,
            idpago:idpago,
            monto:montoAplicado,
            fechageneracion: newFechageneracion //agregar ** debe ser la fecha de pago del recibo
        };
        
        const pagoDetalle = new Pagodetalle(pagoDetalleData);
        await pagoDetalle.save();
    } 
    
    //Actualizar Balance del apartamento
    await Apartamento.findByIdAndUpdate({_id:idapartamento},
                                        {saldomantenimiento:saldoCuota, fechaultimacuota:this.newFechacuota}, {new:true});

    //Actualizar saldo despues del pago del pago realizado
    await Pago.findByIdAndUpdate({_id:idpago},
                                 {saldodespuesdelpago:saldoCuota}, {new:true});
}

const recibos = async (req, res=response)=>{

    const [total, pagos] =  await Promise.all([
        Pago.countDocuments(),
        Pago.find().populate('idapartamento')
                   .populate('idformapago') 
    ]) 

    res.status(200).json({
        ok:true,
       total,
       pagos
    })
   
}
const buscarReciboById = async (req, res=response)=>{

     const {id } = req.params;
    const pagoDB = await Pago.findById(id)
                                .populate('idapartamento')
                                .populate('idformapago')

    res.status(200).json({
        ok:true,
       pagoDB
    })
   
}
const buscarReciboByIdApartamento = async (req, res=response)=>{

    const FECHABASE = '1972-06-27';
    const {idapartamento, fecpago } = req.params;

    const fechaCompara   = new Date(FECHABASE);
    const fecpagoCompara = new Date(fecpago);
    let query = '';

    if (fecpagoCompara.toDateString() === fechaCompara.toDateString()){
         query = [{idapartamento:idapartamento}, {estatus:true}]
    }else{
         // Preparando query
        const [startDate,endDate] = firstDayLastDayMonth(fecpago)
        query = [{idapartamento:idapartamento}, {estatus:true},
                 {fechageneracion: {$gte:startDate, $lte:endDate}}]
    }

    const [count, pagos ] = await Promise.all([
                                    Pago.countDocuments({$and:query}),
                                    Pago.find({$and:query})
                                        .populate('idformapago' )
                                        .populate('idapartamento', 'codigo' ).sort({fechageneracion:1})

    ])

    res.status(200).json({
        ok:true,
        count,
        pagos
    })
   
};

const buscarDetalleReciboByIdPago = async (req, res=response)=>{

    const {idpago } = req.params;
    const query = {idpago:idpago, estatus:true};

    const [count, detallepago ] = await Promise.all([
                                    Pagodetalle.countDocuments(query),
                                    Pagodetalle.find(query)
                                        .populate('idpago', 'monto' )
                                        .populate('idcuota', 'fechacuota monto').sort({idcuota:1})
    ])

    res.status(200).json({
        ok:true,
        count,
        detallepago
    })
   
};
const anularPagoByIdPago = async (req, res=response)=>{
    console.log('anularPagoByIdPago');

    const { idpago } = req.params
    const pagoDB = await Pago.findById({_id:idpago}, {estatus:true});

    const today = new Date();
    if(pagoDB.fecpago !== today){
        return res.status(400).json({
            msg:'El Pago no puede ser Anulado, fue realizado en otra fecha'
        })
    };

    const pagodetalle = await Pagodetalle.updateMany({idpago:pagoDB._id, estatus:true}, {estatus:false})
    console.log('IdDocumento Actualizado: ',pagodetalle.upsertedId);

    pagodetalle.forEach(async(pdetalle)=>{
        const cuotaDB = await Cuota.findById(pdetalle.idcuota);
        if(cuotaDB.motivo === 1){
            await Cuota.findByIdAndUpdate({_id:pdetalle.idcuota}, {saldo:saldo + pdetalle.monto, senal:1})

        }else{
            //tratar cuota de abono
        }

        let newSaldoCuota = pdetalle
       
    })
    await Apartamento.findByIdAndUpdate({_id:pagoDB.idapartamento}, {saldomantenimiento:saldomantenimiento + pagoDB.monto});
    
}

const buscarFormapago = async(req, res=response)=>{

    const query = {estatus:true};
    const formapagoDB = await Formapago.find(query)
 
    res.status(200).json({
        ok:true,
        formapagoDB
    })

};

const crearFormapago = async(req, res=response)=>{

    const { estatus, ...data}= req.body;
    
    const formapago = new Formapago(data);
    await formapago.save();

    res.status(200).json({
        ok:true,
        formapago
    });
}

module.exports ={
    pagoCuota,
    deudaEnCuota,
    recibos,
    buscarReciboById,
    buscarReciboByIdApartamento,
    buscarDetalleReciboByIdPago,
    buscarFormapago,
    crearFormapago
}