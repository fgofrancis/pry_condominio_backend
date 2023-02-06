
const Categoria = require('./categoria');
const Producto = require('./producto');
const Role = require('./role');
const Server = require('./server');
const Usuario = require('./usuario');

const Venta = require('./venta');
const Ventadetalle = require('./ventadetalle');
const Bloque = require('./bloque')
const Propietario = require('./propietario')
const Apartamento = require('./apartamento')
const Cuota = require('./cuota')

module.exports = {
    Categoria,
    Producto,
    Role,
    Server,
    Usuario,

    Venta,Ventadetalle,Bloque,
    Propietario, Apartamento,
    Cuota
}