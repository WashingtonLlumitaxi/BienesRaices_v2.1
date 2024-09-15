import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt'
import Usuario from "../models/Usuario.js";
import { generarId } from '../helpers/token.js';
import { emailRegistro, olvidePassword } from '../helpers/emails.js';
import { where } from 'sequelize';
import { render } from 'pug';


const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: "Iniciar Sesión",
        csrfToken: req.csrfToken() //Generation token 

        
    });
}

//Autenticar login
const auntenticar = async (req, res) => {
    //Validación 
    await check('email').isEmail().withMessage("El Email es obligatorio").run(req)
    await check('password').notEmpty().withMessage("El password es obligatorio").run(req)

    let resultado = validationResult(req)
    //Verificación que el resultado este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render("auth/login", {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const {email, password} = req.body

    //Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ where: { email }})
    if(!usuario) {
            // Errores
            return res.render("auth/login", {
                pagina: 'Iniciar Sesión',
                csrfToken: req.csrfToken(),
                errores: [{msg: 'El usuario no existe'}]
            })
    }

    //Comprobar si el usuario esta confirmado
    if(!usuario.confirmado) {
        return res.render("auth/login", {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'La cuenta no ha sido Confirmada'}]
        })
    }

    //Revisar el password
}

const formularioRegistro = (req, res) => {
    //CSRF
    //console.log(req.csrfToken())

    res.render('auth/registro', {
        pagina: "Crear Cuenta",
        //CSRF 
        csrfToken: req.csrfToken()
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
            csrfToken: req.csrfToken(),
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
    const existeUsuario = await Usuario.findOne({ where: { email } })
    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Usuario Existente',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario ya se encuentra registrado' }],
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
const confirmar = async (req, res) => {
    //console.log('Comprobando....')
    //Router Dinámico se lee con pararms y no con body
    const { token } = req.params
    //console.log( token )

    //Verificar si el token es valido
    const usuario = await Usuario.findOne({ where: { token } })

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    //Confirmar cuenta
    //Modificamos en memoria antes de almacenar en la base de datos
    usuario.token = null; //elimino el token
    usuario.confirmado = true;

    //hacerlo Persistente y almacenar
    await usuario.save();

    return res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmo correctamente !!'
    })



}
const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: "Recupera tu acceso a Bienes Raices",
        csrfToken: req.csrfToken(),
    });
}

//Resetear Password
const resetPassword = async (req, res) => {
        //Validación
        await check('email').isEmail().withMessage('Esto no parece un email').run(req)

        let resultado = validationResult(req) //resultado de la validación
    
        //Verificar que el resultado este vacio 
        if (!resultado.isEmpty()) {

            return res.render('auth/olvide-password', {
                pagina: 'Crear Cuenta',
                csrfToken: req.csrfToken(),
                errores: resultado.array(),
            })
        }

        //Buscar Usuario
        const { email } = req.body //lectura del formulario 
        const usuario = await Usuario.findOne({ where : { email }})

        if (!usuario) {
            return res.render('auth/olvide-password', {
                pagina: 'Recupera tu acceso a Bienes Raices',
                csrfToken: req.csrfToken(),
                errores: [{ msg: 'El Email no Pertenece a ningun usuario'}]
            })
        }

        //Generar un token y enviar el email 
        usuario.token = generarId();
        await usuario.save();

        //Enviar el email
        olvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        //Renderizar el mensaje
        //Mostrar mensaje de confirmación 
        res.render('templates/mensaje', {
        pagina: 'Reestablecer tu Pasword',
        mensaje: 'Hemos Enviado un Email con instrucciones'
    })

}

const comprobarToken = async (req, res) => {

    const { token } = req.params;
    const usuario = await Usuario.findOne({ where: { token }})
    //Si no lo encuentra
    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablecer tu Password',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        })
    }

    //Mostrar formulario para modificar el password
    res.render('auth/reset-password', {
        pagina: 'Reestablece tu password',
        csrfToken: req.csrfToken()
    })

}

const nuevoPassword = async (req, res) => {
    //console.log('Guardando Password')
    //Validar el password
    await check('password').isLength({ min: 4 }).withMessage('El password debe ser de al menos 4 caracteres').run(req)
    let resultado = validationResult(req) //resultado de la validación
    
    //Verificar que el resultado este vacio 
    if (!resultado.isEmpty()) {
        return res.render('auth/reset-password', {
            pagina: 'Reestablece tu password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    const { token } = req.params
    const { password } = req.body

    // Indentificar quien hace el cambio
    const usuario = await Usuario.findOne( {where : {token}})

    //Hashear el password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null 

    await usuario.save()

    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Reestablecido',
        mensaje: 'El password se guardo correctamente'
    })

}

export {
    formularioLogin,
    auntenticar,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}