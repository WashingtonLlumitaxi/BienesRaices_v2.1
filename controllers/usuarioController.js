import { check, validationResult } from 'express-validator'
import Usuario from "../models/Usuario.js";

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
    await check('password').isLength({min:4}).withMessage('El password debe ser de al menos 4 caracteres').run(req)
    await check('repetir_password').equals('password').withMessage('Los password no son iguales').run(req)
    

    let resultado = validationResult(req)

    res.json(resultado.array())
    const usuario = await Usuario.create(req.body)
    res.json(usuario);
}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: "Recupera tu acceso a Bienes Raices"
    });
}

export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrar
}