const mongoose = require('mongoose');

const dbConnection = async()=>{

    try {

        await mongoose.connect(process.env.DB_CNN,{
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            // userCreateIndex:true,
            // useFindAndModify:false
        });

        console.log('DB Online..');
        
    } catch (error) {
        console.log(error)
        throw new('Error al inicial la base de datos');
    }

}

module.exports ={
    dbConnection
}