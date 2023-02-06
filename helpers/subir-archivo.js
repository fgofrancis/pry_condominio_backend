
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const subirArchivo = (files, extensionesValidas = ['png', 'jpg','jpeg', 'gif'], carpeta ='')=>{

    return new Promise( (resolve, reject) =>{

        const {archivo} = files;
        const nombreCortado = archivo.name.split('.');
        const extension = nombreCortado[nombreCortado.length - 1]; 
        
        // Validar extensiones
        if(!extensionesValidas.includes(extension.toLowerCase() )){
            return reject(`La extension ${extension} no es permitida, ${extensionesValidas}`) 
        }
     
         const nombreTemp = uuidv4() + '.' + extension;
     
         uploadPath = path.join(__dirname, '../uploads/',carpeta, nombreTemp);
       
         archivo.mv(uploadPath, function(err) {
           if (err) {
             return reject (err);
           }
       
           resolve(nombreTemp); 
        //    res.json({msg: 'File uploaded to ' + uploadPath});
         });
    });
    
}

module.exports ={
    subirArchivo
}