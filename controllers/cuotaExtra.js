// Obtener valores únicos de "idapartamento" en "nuevasCuotas"
const idApartamentos = [...new Set(nuevasCuotas.map(c => c.idapartamento))];

// Realizar consulta a la colección "Apartamentos"
const apartamentos = await Apartamento.find({ _id: { $in: idApartamentos } });

// Crear mapa que asocie cada valor de "idapartamento" con el valor de "codigo" correspondiente
const codigoPorApartamento = new Map(apartamentos.map(a => [a._id.toString(), a.codigo]));

// Recorrer el array "nuevasCuotas" y agregar el valor de "codigo" correspondiente a cada objeto
const nuevasCuotasConCodigo = nuevasCuotas.map(c => ({ ...c, codigo: codigoPorApartamento.get(c.idapartamento.toString()) }));

// el resultado estará en nuevasCuotasConCodigo y contendrá las cuotas del array "nuevasCuotas" con el campo "codigo" agregado desde la colección "Apartamentos"
