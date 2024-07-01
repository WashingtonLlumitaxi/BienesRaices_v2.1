import { check, validationResult } from 'express-validator'
import Usuario from "../models/Usuario.js";
import { where } from 'sequelize';
import { generarId } from '../helpers/token.js';
import { emailRegistro } from '../helpers/emails.js';


const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: "Iniciar Sesión"
    });
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: "Crear Cuenta"
    });
}

const registrar = async (req, res) => {
    //Validación
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacios').run(req)
    await check('email').isEmail().withMessage('Esto no parece un email').run(req)
    await check('password').isLength({ min: 4 }).withMessage('El password debe ser de al menos 4 caracteres').run(req)
    let password1 = req.body.password
    //console.log(password1)
    await check('repetir_password').equals(password1).withMessage('Los password no son iguales').run(req)


    let resultado = validationResult(req) //resultado de la validación

    //Verificar que el resultado este vacio 
    if (!resultado.isEmpty()) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //Extracción de datos
    const { nombre, email, password } = req.body

    //Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({ where : { email }})
    if(existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Usuario Existente',
            errores: [{ msg: 'El usuario ya se encuentra registrado'}],
            usuario: {
                nombre: req.body.nombre, //Datos del placeholder
                email: req.body.email
            }
        })
    }

    //const usuario = await Usuario.create(req.body)
    //console.log(existeUsuario)

    //Almacenar un usuario
    //await Usuario.create({ solo crea al user
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    //Enviar email de confirmación
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    //Mostrar mensaje de confirmación 
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos Enviado un Email de Confirmación, presiona en el enlace'
    })

}

//Función que comprueba una cuenta
const confirmar = (req, res) => {
    //console.log('Comprobando....')
    //Router Dinámico se lee con pararms y no con body
    const { token } = req.params
    console.log( token )

}
const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: "Recupera tu acceso a Bienes Raices"
    });
}

export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword
}