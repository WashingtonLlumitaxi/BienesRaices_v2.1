import express from 'express'
import usuarioRouters from './routes/usuarioRoutes.js'

//Crear la app
const app = express();

//Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')

//Carpeta publica
app.use(express.static('public'))

//Routing
app.use('/auth', usuarioRouters);



//Definición del puerto
const port = 3000;
app.listen(port, () => {
    console.log(`El Servidor esta funcionando en el puerto ${port}`)
})