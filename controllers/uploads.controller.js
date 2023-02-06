const {request,response} = require('express');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);

const { subirArchivo } = require('../helpers');
const { Usuario, Producto } = require('../models')


const uploadFile = async(req=request, res=response)=>{
  
   //aquí
  
    try {
        // txt, md
        // const nombre = await subirArchivo(req.files, ['txt', 'md'], 'textos');
       
        //imagenes
        const nombre = await subirArchivo(req.files, undefined, 'imgs');
        res.json( {nombre} )
      
    } catch (msg) {
        res.status(400).json({ msg })
      
    }

};

const actualizarImagen = async(req, res=response)=>{

  const {collection, id } = req.params;
  let modelo;

  switch ( collection ) {
    case 'usuarios':
        modelo = await Usuario.findById(id);
        if(!modelo){
            return res.status(400).json({
              msg:`No existe usuario con el id ${id}`
            })
        }
      break;

      case 'productos':
        modelo = await Producto.findById(id);
        if(!modelo){
            return res.status(400).json({
              msg:`No existe producto con el id ${id}`
            })
        }
      break;
  
    default:
      return res.status(500).json({msg: 'Se olvidó validar esto'})
  }

  //Limpiar imagenes previas
  if(modelo.img){
    //Hay q borrar la imagen del servidor
    const pathImage= path.join(__dirname, '../uploads', collection, modelo.img);
    if(fs.existsSync(pathImage)){
        fs.unlinkSync(pathImage) //Borrando file
    }
  }

  const nombre = await subirArchivo(req.files, undefined, collection);
  modelo.img = nombre;

  await modelo.save();

  res.json({ modelo})

} 
const actualizarImagenCloudinary = async(req, res=response)=>{

  const {collection, id } = req.params;
  let modelo;

  switch ( collection ) {
    case 'usuarios':
        modelo = await Usuario.findById(id);
        if(!modelo){
            return res.status(400).json({
              msg:`No existe usuario con el id ${id}`
            })
        }
      break;

      case 'productos':
        modelo = await Producto.findById(id);
        if(!modelo){
            return res.status(400).json({
              msg:`No existe producto con el id ${id}`
            })
        }
      break;
  
    default:
      return res.status(500).json({msg: 'Se olvidó validar esto'})
  }

  //Limpiar imagenes previas
  if(modelo.img){
    const nombreArr = modelo.img.split('/');
    const nombre = nombreArr[nombreArr.length - 1];
    const [ public_id ] = nombre.split('.');
    cloudinary.uploader.destroy( public_id ); //borrando de cloudinary
  }

  //Grabando imagen en cloudinary
  const { tempFilePath } = req.files.archivo;
  const { secure_url } = await cloudinary.uploader.upload(tempFilePath); 
  modelo.img = secure_url;

  await modelo.save();
  res.json(modelo)

} 

const mostrarImagen = async(req, res=response)=>{
  const {collection, id } = req.params;
  let modelo;

  switch ( collection ) {
    case 'usuarios':
        modelo = await Usuario.findById(id);
        if(!modelo){
            return res.status(400).json({
              msg:`No existe usuario con el id ${id}`
            })
        }
      break;

      case 'productos':
        modelo = await Producto.findById(id);
        if(!modelo){
            return res.status(400).json({
              msg:`No existe producto con el id ${id}`
            })
        }
      break;
  
    default:
      return res.status(500).json({msg: 'Se olvidó validar esto'})
  }

  //Mostrar imagenes
  if(modelo.img){
    const pathImage= path.join(__dirname, '../uploads', collection, modelo.img);
    if(fs.existsSync(pathImage)){
        return res.sendFile(pathImage)
    }
  }

  const pathMostrarImage= path.join(__dirname, '../assets/no-image.jpg');
  res.sendFile(pathMostrarImage)
 
}

module.exports ={
    uploadFile,
    mostrarImagen,
    actualizarImagen,
    actualizarImagenCloudinary
}