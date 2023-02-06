const { response } = require("express");
const {Venta,Ventadetalle, Producto} = require('../models');

const registrarVenta = async(req, res=response)=>{
/**
 * Bebo realizar la prueba en la parte de monto factura con el 
 * detalle de la factura
 */
   const {estado, fecha, ...data} = req.body;
 
    try {
        const venta = new Venta(data);
        await venta.save();

        let idventa = venta._id;
        let montoVenta = 0;
        let stockProducto = 0;

        let detalle = data.detalles;
        detalle.forEach( async (item) =>{

            let objdetalleVenta ={
                idproducto:item.idproducto,
                cantidad:item.cantidad,
                idventa
            };
            const detalles = new Ventadetalle(objdetalleVenta);
            await detalles.save();

            /**
             * Para optimizar el codigo los dos await de mas abajo deben usarse
             * para ejecutarlo en una promesa, ya q uno no depende del otro.
             */
            stockProducto += parseInt(detalles.cantidad)
            await Producto.findByIdAndUpdate({_id:detalles.idproducto}, {stock:stockProducto})

            montoVenta +=parseInt(detalles.cantidad);
            await Venta.findByIdAndUpdate({_id:detalles.idventa}, {monto:montoVenta}, {new:true});
        });

        res.status(200).json({
            msg:'Venta registrada exitosamente!!!'
        })
        
    } catch (error) {
        console.log('ERROR al registrar venta', error)
    }

};

const findSalesById =  async(req, res=response)=>{

    try {
        const {id } = req.params;
        const venta = await Venta.findById(id)
                                .populate('idcliente')
                                .populate('idusuario');
        // if(!venta){
        //     return res.status(400).json({
        //         ok:false,
        //         msg:`No existe venta con este Id ${id}`
        //     })
        // }

        const detalle = await Ventadetalle.find({idventa:id})
                                .populate('idproducto');
        res.json({
            ok:true,
            venta,
            detalle
        });

    } catch (error) {
        console.log(error)
    }
}

const listSales = async (req, res=response)=>{

    try {
        const [cantidad, sales] = await Promise.all([
            Venta.countDocuments(),
            Venta.find().populate('idcliente')
                        .populate('idusuario')
  
    ]);
                                    
    res.status(200).json({
        ok:true,
        cantidad,
        ventas: sales
    });
        
    } catch (error) {
        console.log(error);
        res.status(400).json({
            ok:false,
            msg:'Error al listar las ventas'
        })
    }
};

const detailSale = async(req, res=response)=>{

    try {
        const detailSales = await Ventadetalle.find();
        
        res.status(200).json({
            DetailSales: detailSales
        });

    } catch (error) {
        console.log(error),
        res.status(500).json({
            msg:'Error generando listado'
        })
    }
}
module.exports = {
    registrarVenta,
    findSalesById,
    listSales,
    detailSale
}