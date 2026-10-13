export type User = {
      id: string;
      name: string;
      email: string;
};

export type AuthResponse = {
      user: User;
      token: string;
};

export type LoginInput = {
      email: string;
      password: string;
};

export type RegisterInput = LoginInput & {
      name: string;
};
