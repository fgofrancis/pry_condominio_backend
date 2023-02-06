const {request, response} = require('express');
const { Categoria } = require('../models');

const getCategorias = async (req=request, res=response)=>{

    const { limite= 5, desde = 0 }= req.query;
    const  query = {estado:true};
 
    // const total = await Categoria.countDocuments();
    // const categorias = await Categoria.find(query)
    //                             .skip(Number(desde))
    //                             .limit(Number(limite))

   //Mejor disparo las dos promesas juntas 
   const [total, categorias]= await Promise.all([
          Categoria.countDocuments(query),
          Categoria.find(query)
          .populate('usuario','nombre')
          .skip(Number(desde))
          .limit(Number(limite))
    ])

    res.json({
     ok:false,
     total,
     categorias
    })
};

const getCategoriasById = async(req, res=response)=>{
    
    const id = req.params.id;
    const categoria = await Categoria.findById(id)
                                        .populate('usuario', 'nombre');

    res.status(200).json({
        ok:true,
        categoria
    })
    
};

const postCategoria = async(req, res=response)=>{

    const nombre = req.body.nombre.toUpperCase();

    const categoriaDB = await Categoria.findOne({nombre});
    if( categoriaDB){
        return res.status(400).json({
            ok:false,
            msg:`La categoría ${categoriaDB.nombre}, ya existe`
        })
    };

    //Generar la data a guardar
    const data = {
        nombre,
        usuario:req.usuario._id
    }

    const categoria = new Categoria(data);
    await categoria.save();

    
    res.status(201).json({
     ok:true,
     categoria
    })
};

const putCategoriaById = async(req, res)=>{
    const { id } = req.params;
    const {estado, usuario, ...data} = req.body;

    data.nombre = data.nombre.toUpperCase();
    data.usuario = data.usuario._id; // Registrando el user q hiso el update.

    const categoria = await Categoria.findByIdAndUpdate(id, data, {new:true})

    res.json({
     ok:true,
     categoria
    })
};

const delCategoriaById = async(req, res)=>{
    const {id} = req.params;

    await Categoria.findByIdAndUpdate(id, {estado:false}, {new:true});

    res.status(200).json({
     ok:true,
     msg:'Categoría Borrada'
    })
};

module.exports = {
    getCategorias,
    postCategoria,
    putCategoriaById,
    delCategoriaById,
    getCategoriasById
}