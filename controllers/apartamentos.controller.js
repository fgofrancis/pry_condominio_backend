const {response} = require('express');
const Apartamento = require('../models/apartamento');

const registarApartamento = async (req, res)=>{

    const {estatus, usuario, ...body } = req.body;
    const codigoB = body.codigo.toUpperCase();

    const apartamentoDB = await Apartamento.findOne({codigo:codigoB});

    if( apartamentoDB){
        return res.status(400).json({
            ok:false,
            msg:`El apartamento ${apartamentoDB.codigo}, ya existe`
        })
    };

    //Generar data a gravar
    const data ={
        ...body,
        codigo:codigoB,
        usuario:req.uid
    }

    const apartamento = new Apartamento(data);
    await apartamento.save();

    res.status(200).json({
        ok:true,
        apartamento
    })
};

const getApartamentos = async (req, res=response)=>{

    const { limite = 0, desde = 0 }= req.query;
    const query = {estatus:true};

    try {
        const [ total, apartamentos] = await Promise.all([
            Apartamento.countDocuments(query),
            Apartamento.find(query).populate('idbloque')
                                    .populate('idpropietario').sort({codigo:1})
                                    .skip(Number(desde))
                                    .limit(Number(limite))
        ])
      
    
        res.status(200).json({
            total,
            apartamentos
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok:false,
            msg:'Error, Hable con el Administrador'
        })
    }

};

const buscarApartamentoById = async(req, res=response)=>{

    const {id} = req.params;
    
    const apartamento = await Apartamento.findById(id).populate('idbloque')
                                                      .populate('idpropietario');

    if(!apartamento){
        return res.status(400).json({
            ok:false,
            msg:'Este apartamento no existe'
        })
    };

    res.status(200).json({
        ok:true,
        apartamento
    })

};

const actualizarApartamentoById = async(req, res=response)=>{

    const {id} = req.params;
    const {estatus, usuario, ...body } = req.body;
    const codigoUpdate = body.codigo.toUpperCase();

    
    const aptoCodigoDB = await Apartamento.findById(id);
 
    //Si cambia el codigo debo hacer esto
    if (aptoCodigoDB.codigo !== codigoUpdate){
        const aptoCodigo = await Apartamento.findOne({codigo:codigoUpdate});
        if(aptoCodigo){
            return res.status(400).json({
                ok:false,
                msg:`Codigo Apartamento ${aptoCodigo.codigo} ya Existe existe`
            })
        }
    };

    //Generar data a gravar
    const data ={
        ...body,
        codigo:codigoUpdate,
        usuario:req.uid
    }
    
    const apartamento = await Apartamento.findByIdAndUpdate(id, data, {new:true});

    res.status(200).json({
        ok:true,
        apartamento
    })

};

const eliminarApartamentoById = async(req, res=response)=>{

    const {id} = req.params;

    const apartamento = await Apartamento.findByIdAndUpdate(id, {estatus:false}, {new:true});

    res.status(200).json({
        ok:true,
        msg:`Registro id ${id} eliminado exitosamente`,
        apartamento
    })

}
 const buscarApartamentoByIdPropietario = async(req, res=response)=>{

    const {idpropietario} = req.params;

    const apartamentos = await Apartamento.find({idpropietario:idpropietario, estatus:true} )
                                            .populate('idbloque')
                                            .populate('idpropietario')

    res.status(200).json({
        ok:true,
        apartamentos
    })
 }

 const eliminarApartamentoTodos = async(req, res=response)=>{

    console.log('borar All...');

    const apartamento = await Apartamento.deleteMany();

    res.status(200).json({
        ok:true,
        msg:`Todos los apartamentos eliminado exitosamente`,
        apartamento
    })

}

module.exports = {
    getApartamentos,
    registarApartamento,
    buscarApartamentoById,
    actualizarApartamentoById,
    eliminarApartamentoById,
    buscarApartamentoByIdPropietario,
    eliminarApartamentoTodos
}