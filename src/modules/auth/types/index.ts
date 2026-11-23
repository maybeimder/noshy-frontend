export type OnboardingStatus = "pending" | "inProgress" | "completed";

export type User = {
      id: string;
      name: string;
      lastName?: string | null;
      email: string;
      emailVerified: boolean;
      avatarUrl?: string | null;
      onboardingStatus: OnboardingStatus;
};

export type Tokens = { accessToken: string; refreshToken: string; expiresIn: number };

export type AuthResponse = { user: User; tokens: Tokens };

export type LoginInput = {
      email: string;
      password: string;
};

export type RegisterInput = LoginInput & {
      name: string;
};
