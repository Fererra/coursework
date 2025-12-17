import { Router } from "express";
import { signUpDto } from "./dto/sign-up.dto.js";
import { loginDto } from "./dto/login.dto.js";
import { authService } from "./auth.service.js";
import { AuthErrorMessages } from "./auth.errors.js";

const authRouter = Router();

authRouter.post("/signUp", async (req, res) => {
  try {
    const value = await signUpDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const result = await authService.signUp(value);
    return res.status(201).json(result);
  } catch (error) {
    handleError(res, error);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const value = await loginDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const result = await authService.login(value);
    return res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
});

const handleError = (res, error) => {
  const statusMap = {
    [AuthErrorMessages.USER_ALREADY_EXISTS]: 409,
    [AuthErrorMessages.USER_NOT_FOUND]: 404,
    [AuthErrorMessages.INVALID_PASSWORD]: 401,
  };

  if (error.isJoi) return res.status(400).json({ error: error.message });

  const status = statusMap[error.message] || 500;
  return res.status(status).json({ error: error.message });
};

export default authRouter;