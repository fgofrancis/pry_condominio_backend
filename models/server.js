
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path'); // Esto lo agregué yo.

const { dbConnection } = require('../database/config');

class Server{

    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        this.paths ={
            apartamentos:   '/api/apartamentos',
            auth:           '/api/auth',
            bloques:        '/api/bloques',
            buscar:         '/api/buscar',
            categorias:     '/api/categorias', 
            clientes:       '/api/clientes',
            cuotas:         '/api/cuotas',
            pagos:          '/api/pagos',
            productos:      '/api/productos',
            propietarios:   '/api/propietarios',
            uploads:        '/api/uploads',
            usuarios:       '/api/usuarios',
            ventas:         '/api/ventas' ,
        }

        /* Lo refactoricé por lo de arriba */
        // this.usuariosPath = '/api/usuarios';
        // this.authPath = '/api/auth';
        // this.categoriasPath = '/api/categorias';

        // Conectar a base de datos
        this.conectarDB();

        //Middlewares
        this.middleware();

        //Rutas de mi aplicacion
        this.routes();

    }

    async conectarDB(){
        await dbConnection();
    }   

    middleware(){

        // CORS
        // this.app.use(cors() );
        this.app.use(cors({
            origin: 'https://enchanting-sawine-5a2e5f.netlify.app',
            optionsSuccessStatus: 200, // Algunos navegadores antiguos (como IE11) pueden requerir esto para permitir el acceso a los encabezados personalizados
          }));
          


        //Lectura y parseo del body
        this.app.use( express.json() );

        //directorio público
        this.app.use(express.static('public') );

        //FileUpload - Carga de archivos
        this.app.use( fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/',
            createParentPath:true
        }));
        
    }
 
    routes(){

        this.app.use(this.paths.auth,           require('../routes/auth.routes') );
        this.app.use(this.paths.buscar,         require('../routes/buscar.routes') );
        this.app.use(this.paths.usuarios,       require('../routes/user.routes') );
        this.app.use(this.paths.uploads,        require('../routes/uploads.routes') );
        this.app.use(this.paths.categorias,     require('../routes/categorias.routes') );
        this.app.use(this.paths.productos,      require('../routes/productos.routes') );
        this.app.use(this.paths.clientes,       require('../routes/clientes.routes' ) );
        this.app.use(this.paths.ventas,         require('../routes/ventas.routes' ) );
        this.app.use(this.paths.bloques,        require('../routes/bloques.routes' ) );
        this.app.use(this.paths.propietarios,   require('../routes/propietarios.routes' ) );
        this.app.use(this.paths.apartamentos,   require('../routes/apartamentos.routes' ) );
        this.app.use(this.paths.cuotas,         require('../routes/cuotas.routes' ) );
        this.app.use(this.paths.pagos,          require('../routes/pagos.routes' ) );

        // Lo ultimo
        this.app.get('*', (req, res)=>{
            res.sendFile(path.resolve( __dirname, 'public/index.html'))
        });

        /* Lo refactorice por lo de arriba */
        // this.app.use(this.authPath, require('../routes/auth.routes') );
        // this.app.use(this.usuariosPath, require('../routes/user.routes') );
        // this.app.use(this.categoriasPath, require('../routes/categorias.routes') );
    };

    listen(){
        this.app.listen(this.port, ()=>{
            console.log( `Estamos corriendo en el puerto: ${this.port}`);
        } );
    };
}

module.exports = Server