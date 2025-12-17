import { Router } from "express";
import { idSchema } from "../../common/validation/id.schema.js";
import { usersService } from "./users.service.js";
import { updateUserDto } from "./dto/update-user.dto.js";
import { AuthErrorMessages } from "../auth/auth.errors.js";
import { paginationSchema } from "../../common/validation/pagination.schema.js";

const usersRouter = Router();

usersRouter.get("/:id", async (req, res) => {
  try {
    const userId = await idSchema("userId").validateAsync(req.params.id);

    const userData = await usersService.getUserData(userId);
    return res.json(userData);
  } catch (error) {
    handleError(res, error);
  }
});

usersRouter.get("/:id/bookings", async (req, res) => {
  try {
    const userId = await idSchema("userId").validateAsync(req.params.id);
    const { page, pageSize } = await paginationSchema.validateAsync(req.query);

    const bookings = await usersService.getUserBookings(userId, page, pageSize);
    return res.json(bookings);
  } catch (error) {
    handleError(res, error);
  }
});

usersRouter.patch("/:id", async (req, res) => {
  try {
    const userId = await idSchema("userId").validateAsync(req.params.id);
    const updateData = await updateUserDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const updatedUser = await usersService.updateUserData(userId, updateData);
    return res.json(updatedUser);
  } catch (error) {
    handleError(res, error);
  }
});

usersRouter.delete("/:id", async (req, res) => {
  try {
    const userId = await idSchema("userId").validateAsync(req.params.id);

    const message = await usersService.deleteUser(userId);
    return res.json(message);
  } catch (error) {
    handleError(res, error);
  }
});

const handleError = (res, error) => {
  const statusMap = {
    [AuthErrorMessages.USER_NOT_FOUND]: 404,
    [AuthErrorMessages.ADMIN_DELETION_ERROR]: 403,
    [AuthErrorMessages.USER_HAS_BOOKINGS]: 403,
  };

  if (error.isJoi) return res.status(400).json({ error: error.message });

  const status = statusMap[error.message] || 500;
  return res.status(status).json({ error: error.message });
};

export default usersRouter;