// Puedo quitarle el año
db.cuotaSchema.aggregate([
    {
      $match:{
        estatus:true,
        senal : '1'
      },  
        
      $group: {
        _id: { 
          month: { $month: "$fechacuota" },
          year: { $year: "$fechacuota" }
        },
        totalMonto: { $sum: "$saldo" }
      }
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1
      }
    }
  ])
  