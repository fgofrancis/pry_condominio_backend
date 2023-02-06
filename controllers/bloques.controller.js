const { response } = require("express");
const Bloque = require("../models/bloque");


const getBloques = async (req, res)=>{

    const query = {estatus:true};
    const bloques = await Bloque.find(query).sort({codigo:1});
    // console.log('Get Bloques....', bloques)

    res.status(200).json({
        ok:true,
        bloques
    })
};

const crearBloque = async (req, res)=>{

    const {estatus, ...data} = req.body;

    const bloque = new Bloque(data);
    await bloque.save();
    
    res.status(200).json({
        ok:true,
        bloque
    })
};

const buscarBloqueById = async(req, res=response)=>{

    const {id} = req.params;
    
    const bloque = await Bloque.findById(id);

    if(!bloque){
        return res.status(400).json({
            ok:false,
            msg:'Este bloque no existe'
        })
    };

    res.status(200).json({
        ok:true,
        bloque
    })

}

const actualizarBloqueById = async(req, res=response)=>{

    const {id} = req.params;
    const {...data} = req.body;

    const bloque = await Bloque.findByIdAndUpdate(id, data, {new:true});

    res.status(200).json({
        ok:true,
        bloque
    })

}
const eliminarBloqueById = async(req, res=response)=>{

    const {id} = req.params;

    const bloque = await Bloque.findByIdAndUpdate(id, {estatus:false}, {new:true});

    res.status(200).json({
        ok:true,
        msg:`Registro id ${id} eliminado exitosamente`,
        bloque
    })

}


module.exports ={
    getBloques,
    crearBloque,
    buscarBloqueById,
    actualizarBloqueById,
    eliminarBloqueById
}

