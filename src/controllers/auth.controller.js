import {
  registerUser,
  loginUser,
  createPasswordResetRequest,
  updatePasswordWithToken
} from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente",
      data: user
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const user = await loginUser(req.body);

    res.json({
      ok: true,
      message: "Inicio de sesión exitoso",
      data: user
    });
  } catch (error) {
    next(error);
  }
}

export async function requestPasswordReset(req, res, next) {
  try {
    const result = await createPasswordResetRequest(req.body);

    res.json({
      ok: true,
      message: "Si el correo existe, enviaremos un enlace de recuperación.",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    await updatePasswordWithToken(req.body);

    res.json({
      ok: true,
      message: "Contraseña actualizada correctamente"
    });
  } catch (error) {
    next(error);
  }
}