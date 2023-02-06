const {request,  response} = require('express');
const { Usuario, Categoria, Producto, Bloque,
        Propietario,Apartamento, Cuota 
      } = require('../models');

const { ObjectId } = require('mongoose').Types;

const collectionPermitidas = [
    'categorias',
    'productos',
    'roles',
    'usuarios',
    'bloques',
    'propietarios',
    'apartamentos',
    'cuotas'
];

const buscarUsuario = async(termino = '', res=response)=>{

    const esMongoID = ObjectId.isValid(termino);//TRUE
   
    if(esMongoID){
        const usuario = await Usuario.findById(termino);
        return res.json({
            results:(usuario)?[usuario]:[]
        })
    };

    const regex = new RegExp(termino, 'i');//incensible a mayuscula o minuscula
    // const usuarios = await Usuario.find( {nombre:regex} ); //Amplificando la busqueda mas abajo

    // const usuarios = await Usuario.find({
    //     $or:[ {nombre:regex}, {correo:regex} ],
    //     $and:[ {estado:true} ]
    // });
    
    const [total, usuarios] = await Promise.all([
        Usuario.count({
            $or:[ {nombre:regex}, {correo:regex} ],
            $and:[ {estado:true} ]
        }),
        Usuario.find({
            $or:[ {nombre:regex}, {correo:regex} ],
            $and:[ {estado:true} ]
        })
        
    ])

      res.json({
        total,
        usuarios
    })

}
const buscarCategoria = async(termino = '', res=response)=>{

    const esMongoID = ObjectId.isValid(termino);//TRUE
   
    if(esMongoID){
        const categoria = await Categoria.findById(termino);
        return res.json({
            results:(categoria)?[categoria]:[]
        })
    };

    const regex = new RegExp(termino, 'i');//incensible a mayúscula o minúscula

    const [total, categorias] = await Promise.all([
        Categoria.count({
            $or:[ {nombre:regex} ],
            $and:[ {estado:true} ]
        }),
        Categoria.find({
            $or:[ {nombre:regex} ],
            $and:[ {estado:true} ]
        })
    ])

      res.json({
        total,
        categorias
    })

}
const buscarProducto = async(termino = '', res=response)=>{

    const esMongoID = ObjectId.isValid(termino);//TRUE
   
    if(esMongoID){
        const producto = await Producto.findById(termino).populate('categoria', 'nombre');
        return res.json({
            results:(producto)?[producto]:[]
        })
    };

    const regex = new RegExp(termino, 'i');//incensible a mayuscula o minuscula

    const [total, producto] = await Promise.all([
        Producto.count({
            $or:[ {nombre:regex} ],
            $and:[ {estado:true} ]
        }),
        Producto.find({
            $or:[ {nombre:regex} ],
            $and:[ {estado:true} ]
        }).populate('categoria', 'nombre')
    ])

      res.json({
        total,
        producto
    })

}
const buscarBloque = async(termino = '', res=response)=>{

    const esMongoID = ObjectId.isValid(termino);//TRUE
    if(esMongoID){
        const bloque = await Bloque.findById(termino);
        return res.json({
            results:(bloque)?[bloque]:[]
        })
    };

    const regex = new RegExp(termino, 'i');//incensible a mayuscula o minuscula

    const [total, bloque] = await Promise.all([
        Bloque.count({
            $or:[ {codigo:regex} ],
            $and:[ {estatus:true} ]
        }),
        Bloque.find({
            $or:[ {codigo:regex} ],
            $and:[ {estatus:true} ]
        })
    ])

      res.json({
        total,
        bloque
    })

}
const buscarPropietario = async(termino = '', res=response)=>{

    const esMongoID = ObjectId.isValid(termino);//TRUE
   
    if(esMongoID){
        const propietario = await Propietario.findById(termino);
        return res.json({
            results:(propietario)?[propietario]:[]
        })
    };

    const regex = new RegExp(termino, 'i');//incensible a mayuscula o minuscula

    const [total, propietario] = await Promise.all([
        Propietario.count({
            $or:[ {nombre:regex} ],
            $and:[ {estatus:true} ]
        }),
        Propietario.find({
            $or:[ {nombre:regex} ],
            $and:[ {estatus:true} ]
        })
    ])

      res.json({
        total,
        propietario
    })

}
const buscarApartamento = async(termino = '', res=response)=>{

    const esMongoID = ObjectId.isValid(termino);//TRUE
   
    if(esMongoID){
        const apartamento = await Apartamento.findById(termino);
        return res.json({
            results:(apartamento)?[apartamento]:[]
        })
    };

    const regex = new RegExp(termino, 'i');//incensible a mayuscula o minuscula

    const [total, apartamento] = await Promise.all([
        Apartamento.count({
            $or:[ {codigo:regex} ],
            $and:[ {estatus:true} ]
        }),
        Apartamento.find({
            $or:[ {codigo:regex} ],
            $and:[ {estatus:true} ]
        }).populate('idbloque')
          .populate('idpropietario')
    ])

    res.json({
        total,
        apartamento
    })

}
const buscarCuota = async(termino = '', res=response)=>{

    const esMongoID = ObjectId.isValid(termino);//TRUE
   
    if(esMongoID){
        console.log('Backend, buscarCuota', termino);
        const cuota = await Cuota.find({idapartamento:termino}).populate('idapartamento');
         return res.json({
            cuota
            
        })
        // return res.json({
        //     results:(cuota)?[cuota]:[],
            
        // })
    };

    const cuota = await Cuota.find().populate('idapartamento');
    res.json({
       cuota
       
   }) 
// console.log('buscarCuota');

    // const regex = new RegExp(termino, 'i');//incensible a mayuscula o minuscula

    // const [total, cuota] = await Promise.all([
    //     Cuota.count({
    //         $or:[ {idapartamento:regex} ],
    //         $and:[ {estatus:true} ]
    //     }),
    //     Cuota.find({
    //         $or:[ {idapartamento:regex} ],
    //         $and:[ {estatus:true} ]
    //     })
    // ])

    // res.json({
    //     total,
    //     cuota
    // })

}
const buscar = (req=request, res=response)=>{

    const {collection, termino } = req.params;

    if( !collectionPermitidas.includes(collection) ){
        return res.status(400).json({
            ok:false,
            msg:`Las colleciones permitidas son..: ${collectionPermitidas}`
        })
    };

switch (collection) {
    case 'categorias':
            buscarCategoria(termino, res)
            break

        case 'productos':
            buscarProducto(termino, res)
            break

        case 'roles':
            break

        case 'usuarios':
            buscarUsuario(termino, res)
            break

        case 'bloques':
            buscarBloque(termino, res)
            break

        case 'propietarios':
            buscarPropietario(termino, res)
            break

        case 'apartamentos':
            buscarApartamento(termino, res)
            break

        case 'cuotas':
            buscarCuota(termino, res)
            break
        
        default:
            res.status(500).json({
                msg:'Se le olvidó hacer esta búsqueda'
            })
    }
}

module.exports = {
    buscar
}