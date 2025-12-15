import { hash, verify } from "argon2";
import { usersService } from "../users/users.service.js";
import { AuthErrorMessages } from "./auth.errors.js";

class AuthService {
  #usersService;

  constructor(usersService) {
    this.#usersService = usersService;
  }

  async signUp(data) {
    const hashedPassword = await hash(data.password, 10);

    const { userId } = await this.#usersService.createUser({
      ...data,
      password: hashedPassword,
    });

    return { message: "User registered successfully", userId };
  }

  async login(data) {
    const { email, password } = data;

    const user = await this.#usersService.findByEmail(email);

    const isPasswordValid = await verify(user.password, password);

    if (!isPasswordValid) {
      throw new Error(AuthErrorMessages.INVALID_PASSWORD);
    }

    return { message: "Login successful", userId: user.userId };
  }
}

export const authService = new AuthService(usersService);