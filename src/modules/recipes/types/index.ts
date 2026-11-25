import type { Compatibility, Labeled, Macros, Quantity, QuantityInput, RecipeCard } from "@/shared/types/api";

export type Difficulty = "easy" | "medium" | "hard";
export type Heat = "low" | "medium" | "high";

export type RecipeIngredient = {
      ingredientId: string;
      label: string;
      icon: string;
      quantity: Quantity;
      inPantry: boolean;
      inShoppingList?: boolean;
      isBasic?: boolean;
      prep?: string | null;
};

export type StepIngredient = { ingredientId: string | null; label: string; prep: string | null; quantity: Quantity; inPantry: boolean };
/** `ingredients`: what the step uses for the first time; missing on older servers. */
export type RecipeStep = { title: string; text: string; timerSeconds: number | null; heatLevel: number; ingredients?: StepIngredient[] };

export type RecipeDetail = RecipeCard & {
      author: { type: "noshy" | "user" | "chef"; id: string | null; displayName: string };
      rating: { avg: number; count: number } | null;
      servings: { value: number; min: number; max: number };
      difficulty: Labeled<Difficulty> | null;
      stepsCount: number;
      /** Missing on servers older than the `steps` change: the steps then only show in cooking mode. */
      steps?: RecipeStep[];
      adaptation: {
            id: string;
            reasons: Labeled[];
            substitutions: { from: { ingredientId: string; label: string }; to: { ingredientId: string; label: string }; reason: string }[];
      } | null;
      ingredients: RecipeIngredient[];
      compatibility: Compatibility;
      viewer: { isSaved: boolean; isLiked: boolean };
      chefThreadId: string | null;
      chefConsultable: boolean;
      shareUrl: string;
};

export type MyRecipeStatus = "draft" | "inReview" | "published" | "rejected";
export type MyRecipeRow = { id: string; title: string; status: MyRecipeStatus; coverImageUrl: string | null; updatedAt: string; /** Only when rejected. */ rejectionReason?: string | null };
export type MyRecipe = MyRecipeRow & {
      totalTimeMinutes: number | null;
      servings: number | null;
      difficulty: Labeled<Difficulty> | null;
      nutritionPerServing: Macros | null;
      nutritionStatus: "calculated" | "partial" | "empty";
};

export type ChefConsultable = { enabled: boolean; useMyStyle: boolean; suggestSubstitutes: boolean };

export type MyRecipePatch = Partial<{
      title: string;
      coverMediaId: string;
      totalTimeMinutes: number;
      servings: number;
      difficulty: Difficulty;
      ingredients: { ingredientId: string; quantity: QuantityInput; prep?: string }[];
      steps: { text: string; timerSeconds?: number; heat?: Heat; ingredientIds?: string[] }[];
      chefConsultable: ChefConsultable;
}>;

export type Author = { id: string; displayName: string; initial: string; avatarUrl: string | null };

export type FeedItem = {
      recipe: Pick<RecipeCard, "id" | "title" | "cuisine" | "imageUrl" | "totalTimeMinutes" | "nutritionPerServing"> & { difficulty: Labeled | null };
      author: Author;
      chefConsultable: boolean;
      stats: { likes: number; comments: number };
      viewer: { liked: boolean; saved: boolean };
      compatibility: Compatibility;
};
export type Creator = { id: string; firstName: string; avatarUrl: string | null; hasNewContent: boolean; following: boolean };
export type CreatorProfile = Author & { memberSince: string; stats: { recipes: number; followers: number }; following: boolean; isMe: boolean };
/** A recipe as whoever opens a shared link sees it, without an account. */
export type SharedRecipe = {
      id: string;
      title: string;
      imageUrl: string | null;
      imageIsReference: boolean;
      author: string;
      cuisine: Labeled | null;
      totalTimeMinutes: { min: number; max: number };
      servings: number;
      nutritionPerServing: Macros | null;
      nutritionEstimated: boolean;
      ingredients: { label: string; icon: string; quantity: string }[];
      steps: { title: string; text: string }[];
};
export type Comment = { id: string; author: Author; text: string; createdAt: string };
export type CookedRecipe = { recipe: { id: string; title: string; imageUrl: string | null }; /** The user's own photo of it; `imageUrl` already shows it. */ photoUrl?: string | null; timesCooked: number; lastCookedAt: string };

/** Only on Explore: how much of the library this user can see and whether the backend is bringing more. */
export type LibraryMeta = { total?: number; library?: { count: number; status: "ready" | "filling" | "paused" } };
