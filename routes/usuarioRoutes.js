import express  from "express"
import { formularioLogin, formularioRegistro, formularioOlvidePassword, registrar, confirmar} from '../controllers/usuarioController.js'

const router = express.Router();

router.get('/login', formularioLogin)

router.get('/registro', formularioRegistro)
router.post('/registro', registrar)

router.get('/confirmar/:token', confirmar) //Router Dinámico
router.get('/olvide-password', formularioOlvidePassword)


//Ruta de pruenba....
router.get('/nosotros', function(req, res) {
    res.json({msg: 'Información de nosotros'})
})

export default router