const { response } = require("express");
const Propietario = require("../models/propietario");


const getPropietario =  async (req, res=response)=>{
   
    const { limite = 0, desde = 0 }= req.query;
  
    const query = {estatus:true};
    
    // const propietario = await Propietario.find({query}, 'camp1 camp2 camp3 campn');
    const [total, propietarios]= await Promise.all([
        Propietario.countDocuments(query),
        Propietario.find(query).sort({nombre:1})
        .skip(Number( desde ))
        .limit(Number( limite ))
  ])

    res.status(200).json({
        total,
        propietarios
    })
};
 
const crearPropietario =async (req, res)=>{

    const {estatus, ...data} = req.body; //TODO usar bien

    const propietario = new Propietario(data);
    await propietario.save();

    res.status(200).json({
        ok:true,
        propietario
    })
};

const buscarPropietarioById = async(req, res=response)=>{

    const {id} = req.params;
    
    const propietario = await Propietario.findById(id);

    if(!propietario){
        return res.status(400).json({
            ok:false,
            msg:'Este propietario no existe'
        })
    };

    res.status(200).json({
        ok:true,
        propietario
    })

};

const actualizarPropietarioById = async(req, res=response)=>{

    const {id} = req.params;
    const {...data} = req.body;

    const propietario = await Propietario.findByIdAndUpdate(id, data, {new:true});

    res.status(200).json({
        ok:true,
        propietario
    })

};

const eliminarPropietarioById = async(req, res=response)=>{

    const {id} = req.params;

    const propietario = await Propietario.findByIdAndUpdate(id, {estatus:false}, {new:true});

    res.status(200).json({
        ok:true,
        msg:`Registro id ${id} eliminado exitosamente`,
        propietario
    })

}


module.exports ={
    getPropietario,
    crearPropietario,
    buscarPropietarioById,
    actualizarPropietarioById,
    eliminarPropietarioById
}