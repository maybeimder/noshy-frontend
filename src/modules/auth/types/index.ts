export type User = {
      id: string;
      name: string;
      email: string;
      /** Optional until the backend ships it (backend/recommendation.md §1). */
      avatarUrl?: string | null;
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
