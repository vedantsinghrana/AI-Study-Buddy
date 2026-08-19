import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";
import { signupSchema, loginSchema } from "../utils/validation.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

function sanitizeUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = signupSchema.parse(req.body);

    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    user.refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await user.save();

    res.status(201).json({ user: sanitizeUser(user), accessToken, refreshToken });
  } catch (err) {
    if (err.name === "ZodError") {
      return next(new AppError(400, err.issues[0].message));
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "Invalid email or password");
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    user.refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await user.save();

    res.json({ user: sanitizeUser(user), accessToken, refreshToken });
  } catch (err) {
    if (err.name === "ZodError") {
      return next(new AppError(400, err.issues[0].message));
    }
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError(400, "refreshToken is required");
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    const accessToken = signAccessToken(user._id.toString());
    const newRefreshToken = signRefreshToken(user._id.toString());
    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);
    await user.save();

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.userId, { refreshTokenHash: null });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}
