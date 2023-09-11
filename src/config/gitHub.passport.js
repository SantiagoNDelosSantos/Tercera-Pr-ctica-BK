// github.passport.js:
import passport from 'passport';
import {
    Strategy as GitHubStrategy
} from 'passport-github2';

// Import UserController:
import SessionController from '../controllers/sessionController.js';

// Import CartController:
import CartController from '../controllers/cartController.js';

// Importación de variables de entorno GitHub:
import {
    envClientID,
    envClientSecret,
    envCallbackURL
} from '../config.js';

// Instancia de SessionController: 
let sessionController = new SessionController();

// Instancia de CartController: 
let cartController = new CartController();

// Función de GitHub passport para expotarla:
export const initializePassportGitHub = (req, res, next) => {

    // Estrategia de registro con GitHub:

    passport.use('github', new GitHubStrategy({
        clientID: envClientID,
        clientSecret: envClientSecret,
        callbackURL: envCallbackURL,
    }, async (accessToken, refreshToken, profile, done) => {

        try {
            const user = profile._json.name;
            if (user) {
                return done(null, user);
            }
        } catch (error) {
            return done(null, false, {
                message: 'Error de registro en la autenticación por GitHub - gitHub.passport.js: ' + error.message
            });
        };

    }));

};

export const createBDUserGH = async (req, res, user) => {

    try {

        // Buscamos al usuario en la base de datos: 
        const existSessionControl = await sessionController.getUserByEmailOrNameOrIdController(req, res, user);

        // Verificamos si el usuario ya esta registrado, en dicho caso devolvemos el resultado:
        if (existSessionControl.statusCode === 200) {
            const exist = existSessionControl.result;
            return exist;
        }

        // Si el usuario no esta registrado en la base de datos (404), entonces se procede a crear un usuario con los datos de GitHub: 
        else if (existSessionControl.statusCode === 404) {

            // Creammos un carrito para el usuario: 
            const resultCartControl = await cartController.createCartController(req, res);

            // Si no hubo error en el cartController continuamos con la creación del usuario:
            if (resultCartControl.statusCode === 200) {

                // Extraemos solo el carrito creado por el cartController: 
                const cart = resultCartControl.result;

                // Creamos el objeto con los datos del usuario y le añadimos el _id de su carrito: 
                const newUser = {
                    first_name: user,
                    last_name: "X",
                    email: "X",
                    age: 0,
                    password: "Sin contraseña.",
                    role: "user",
                    cart: cart._id,
                };

                // Creamos el nuevo usuario:
                const createSessionControl = await sessionController.createUserControler(req, res, newUser);

                // Si no hubo error en el sessionController devolvemos el nuevo usuario:
                if (createSessionControl.statusCode === 200) {
                    const userSemiCompleto = createSessionControl.result;
                    return userSemiCompleto
                }
            }
        };
    } catch (error) {
        req.logger.error(error.message)
        return 'Error de registro en createBDuserGH - github.passport.js: ' + error.message
    };

};