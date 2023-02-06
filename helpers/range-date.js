
// Probar esta function cuando le envie el ultimo dia del mes.
const firstDayLastDayMonth = (fecha)=>{
    const firstDay = 1;
    const lastDay = new Date( new Date(fecha).getFullYear(), 
                    new Date(fecha).getMonth() + 1, 0).getDate();
    
    const fechaIni = new Date(new Date(fecha).getFullYear(),
                              new Date(fecha).getMonth(), 1);

    const fechaFin = new Date(new Date(fecha).getFullYear(),
                              new Date(fecha).getMonth(), lastDay)

    return [fechaIni, fechaFin]
  };

module.exports ={
    firstDayLastDayMonth
  }
