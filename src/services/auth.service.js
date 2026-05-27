import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/prisma.js";

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    department: user.department || ""
  };
}

function normalizeRole(role) {
  return role === "seller" ? "SELLER" : "BUYER";
}

function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function registerUser(payload) {
  const name = payload?.name?.trim();
  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password || "";
  const role = normalizeRole(payload?.role);

  if (!name || !email || !password) {
    throw createHttpError("Nombre, email y contraseña son obligatorios", 400);
  }

  if (password.length < 6) {
    throw createHttpError("La contraseña debe tener al menos 6 caracteres", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createHttpError("Ya existe una cuenta con este correo", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role
    }
  });

  return sanitizeUser(user);
}

export async function loginUser(payload) {
  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password || "";

  if (!email || !password) {
    throw createHttpError("Email y contraseña son obligatorios", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createHttpError("Credenciales inválidas", 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw createHttpError("Credenciales inválidas", 401);
  }

  return sanitizeUser(user);
}

export async function createPasswordResetRequest(payload) {
  const email = payload?.email?.trim().toLowerCase();

  if (!email) {
    throw createHttpError("El email es obligatorio", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return { token: null };
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: token,
      resetPasswordExpiresAt: expiresAt
    }
  });

  return { token };
}

export async function updatePasswordWithToken(payload) {
  const token = payload?.token?.trim();
  const password = payload?.password || "";

  if (!token || !password) {
    throw createHttpError("Token y nueva contraseña son obligatorios", 400);
  }

  if (password.length < 6) {
    throw createHttpError("La contraseña debe tener al menos 6 caracteres", 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpiresAt: {
        gt: new Date()
      }
    }
  });

  if (!user) {
    throw createHttpError("Token inválido o expirado", 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null
    }
  });
}

/* =========================
   PROFILE
========================= */

export async function updateUserProfile(payload) {
  const email = payload?.email?.trim().toLowerCase();
  const name = payload?.name?.trim();
  const phone = payload?.phone?.trim() || null;

  if (!email) {
    throw createHttpError("El email es obligatorio", 400);
  }

  if (!name) {
    throw createHttpError("El nombre es obligatorio", 400);
  }

  const user = await prisma.user.update({
    where: { email },
    data: {
      name,
      phone
    }
  });

  return sanitizeUser(user);
}

export async function updateUserAddress(payload) {
  const email = payload?.email?.trim().toLowerCase();
  const address = payload?.address?.trim() || null;
  const city = payload?.city?.trim() || null;
  const department = payload?.department?.trim() || null;

  if (!email) {
    throw createHttpError("El email es obligatorio", 400);
  }

  if (!address) {
    throw createHttpError("La dirección es obligatoria", 400);
  }

  const user = await prisma.user.update({
    where: { email },
    data: {
      address,
      city,
      department
    }
  });

  return sanitizeUser(user);
}

export async function changeUserPassword(payload) {
  const email = payload?.email?.trim().toLowerCase();
  const currentPassword = payload?.currentPassword || "";
  const newPassword = payload?.newPassword || "";

  if (!email || !currentPassword || !newPassword) {
    throw createHttpError(
      "Email, contraseña actual y nueva contraseña son obligatorios",
      400
    );
  }

  if (newPassword.length < 6) {
    throw createHttpError(
      "La nueva contraseña debe tener al menos 6 caracteres",
      400
    );
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createHttpError("Usuario no encontrado", 404);
  }

  const isValidPassword = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!isValidPassword) {
    throw createHttpError("La contraseña actual no es correcta", 401);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash
    }
  });
}