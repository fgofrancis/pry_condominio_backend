
const { Router } = require('express');
const { buscar } = require('../controllers/buscar.controller');


const router = Router();

router.get('/:collection/:termino', buscar);
// router.get('/:collection/:termino', buscar);
 

module.exports =router;