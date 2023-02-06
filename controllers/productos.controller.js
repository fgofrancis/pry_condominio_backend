const {request , response}= require('express');
const {Producto} = require('../models');

 const getProductos = async( req=request, res=response )=>{

    const {limite = 5, desde = 0} = req.query;
     const query = {estado:true};

    // const total = await Producto.countDocuments()
    // const productos = await Producto.find()

    const [Total, productos] = await Promise.all([
         Producto.countDocuments(query),
         Producto.find(query)
                    .populate('usuario', 'nombre')
                    .populate('categoria', 'nombre')
                    .skip(Number(desde))
                    .limit(Number(limite))
    ])

    res.status(200).json({
        ok:true,
        Total,
        productos
    })
};

const getProductoById = async(req=request , res=response)=>{

    const {id } = req.params;
    const producto = await Producto.findById(id) 
                                .populate('usuario', 'nombre')
                                .populate('categoria', 'nombre')
    res.status(200).json({
        ok:true,
        producto
    })
};
 
const postProducto = async(req=request, res=response)=>{

    //Saco el estado y el usuario. el estado lo envio default = true, y el usuario
    //lo envio mas abajo, ya que lo agrego a la request en el validarJWT
    const {estado, usuario, ...body} = req.body;
    
    const productoDB = await Producto.findOne({nombre:body.nombre});
    if( productoDB){
        return res.status(400).json({
            ok:false,
            msg:`El producto ${productoDB.nombre}, ya existe`
        })
    };

  
    //Generar data a gravar
    const data ={
        ...body,
        nombre:body.nombre.toUpperCase(),
        usuario:req.uid
    }

    const producto = new Producto(data);
    await producto.save();

    res.status(200).json({
        ok:true,
        producto
    })
};

const putProductoById = async(req, res=response)=>{

    const {id } = req.params;
    const {usuario, estado, ...data} = req.body;

    if (data.nombre){
        data.nombre = data.nombre.toUpperCase();
    };
    data.usuario = req.usuario_id;
    
    const productoActualizado = await Producto.findByIdAndUpdate(id, data,{new:true});
    res.status(200).json({
        ok:true,
        productoActualizado
    })
};

const delProductoById = async(req, res)=>{
    const { id } = req.params;

    const productoBorrado = await Producto.findByIdAndUpdate(id, {estado:false}, {new:true});

    res.status(200).json({
        ok:true,
        msg:'Producto Borrado'
    })
};

module.exports = {
    getProductos,
    getProductoById,
    postProducto,
    putProductoById,
    delProductoById
}