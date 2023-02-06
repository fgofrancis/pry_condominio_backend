const { response } = require('express');
const Cliente = require('../models/cliente');


 const getClientes = async(req, res=response)=>{

    const { limite = 5, desde= 0 } = req.params;

    const query = {estado:true};

    const [clienteCount,clienteDB] = await Promise.all([
                                        Cliente.countDocuments(query),
                                        Cliente.find(query)
                                            .skip(Number(desde))
                                            .limit(Number(limite))
                                     ])

    res.json({
        ok:true,
        clienteCount,
        clienteDB
    })
};

const getClientesById = async (req, res=response)=>{
   
    // const query = {estado:true};//Esta validacion la voy hacer en el middleware
    
    const { id } = req.params;
    const clienteDB = await Cliente.findById(id );
    if(!clienteDB){
        return res.status(400).json({
            ok:false,
            msg:`No existe cliente con este Id ${id}`
        })
    };


    res.status(200).json({
        ok:true,
        clienteDB
    })
};

const crearCliente = async(req, res=response)=>{

    // const identificacion = req.body.identificacion;
    // const nombre = req.body.nombre.toUpperCase();
    const {estado,  ...body} = req.body;

    
    const clienteDB = await Cliente.findOne({identificacion:body.identificacion});
    if(clienteDB){
        return res.status(400).json({
            ok:false,
            msg:`Cliente con identificación ${identificacion}, ya existe`
        })
    }

    const data ={
        ...body,
        nombre:body.nombre.toUpperCase()
    } 

    const cliente = new Cliente(data);
    await cliente.save();

    res.status(200).json({
        ok:true,
        cliente
    })
};

const actualizarClienteById= async(req, res=response)=>{

    const { id } = req.params;
    const { estado, ...data} = req.body;
    
    if(data.nombre){
        data.nombre = data.nombre.toUpperCase()
    };

    const clienteActualizado = await Cliente.findByIdAndUpdate(id,data, {new:true});
    res.status(200).json({
        ok:true,
        clienteActualizado
    })
};

const borrarClienteById = async(req, res=response)=>{

    const { id } = req.params;

    const clienteBorrado = await Cliente.findByIdAndUpdate(id, {estado:false}, {new:true});

    res.status(200).json({
        ok:true,
        msg:`Registro id: ${id}, borrado exitosamente`,
        clienteBorrado
    })
}

module.exports ={
    getClientes,
    getClientesById,
    crearCliente,
    actualizarClienteById,
    borrarClienteById
}