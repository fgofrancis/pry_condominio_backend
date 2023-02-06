
const { Categoria, Producto, Venta } = require('../models');
const Role = require('../models/role');
const Usuario = require('../models/usuario');

const isRoleValid = async(role='') =>{
    const existRole = await Role.findOne({role});
    if(!existRole){
      throw new Error(`El Role ${role} no está registrado en la DB`);
    }
  };

  const emailAlreadyDone = async(correo='')=>{
    const emailExiste = await Usuario.findOne({correo});
    if(emailExiste){
        throw new Error(`Este correo: ${correo}, ya está registrado`);
    };
  };

  const existUserById = async(id)=>{
    const existUser = await Usuario.findById(id);
    if(!existUser){
        throw new Error(`Este usuario: ${id}, no existe en la DB`);
    };
  };

  /**
   * Categorías 
   * @param {id de la categoria} id 
   */
  const existCategoriaById = async(id)=>{
    const existCategoria = await Categoria.findById(id);
    if(!existCategoria){
        throw new Error(`Esta categoría: ${id}, no existe en la DB`);
    };
  };

  const existProductoById = async(id)=>{
    const existProducto = await Producto.findById(id);
    if(!existProducto){
        throw new Error(`Este producto: ${id}, no existe en la DB`);
    };
  };

  const existVentaById = async(id)=>{
     const existVenta = await Venta.findById(id); 
     if(!existVenta){
        throw new Error(`Esta venta ${id}, no existe en la BD`); 
     };
  };

  const collectionsPermitidas = (collection = '', collections = [])=>{
      const incluida = collections.includes(collection);

      if(!incluida){
        throw new Error(`La collection ${collection} no es permitida, ${collections}`)
      }
      return true
  }

  /**
   * Validar collections permitidas
   */
  module.exports ={
    isRoleValid,
    emailAlreadyDone,
    existUserById,
    existCategoriaById,
    existProductoById,
    collectionsPermitidas,
    existVentaById
  }