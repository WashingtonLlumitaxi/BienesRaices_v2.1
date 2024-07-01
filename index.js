import express from 'express'
import usuarioRouters from './routes/usuarioRoutes.js'
import db from './config/db.js'

//Crear la app
const app = express();

//Habilitar lectura de datos de formularios
app.use(express.urlencoded({extended: true})) 

//Conexión a la base de datos
try {
    await db.authenticate();
    db.asyn
    console.log('Conexión Correcta a la DB')
    
} catch (error) {
    console.log('iniiono')
}

//Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')

//Carpeta publica
app.use(express.static('public'))

//Routing
app.use('/auth', usuarioRouters);



//Definición del puerto
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`El Servidor esta funcionando en el puerto ${port}`)
})