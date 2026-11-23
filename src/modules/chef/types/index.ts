import type { RecipeCard } from "@/shared/types/api";

export type ChefBlock =
      | { id: string; type: "text"; text: string }
      | { id: string; type: "recipeCard"; recipe: RecipeCard; actions: ("save" | "addToShoppingList" | "cook")[] }
      | { id: string; type: "quickReplies" | "suggestedPrompts"; options: { id: string; label: string }[] }
      | { id: string; type: "feedbackPrompt"; targetBlockId: string; label: string; allowAnotherIdea: boolean }
      | { id: string; type: "learnedInsight"; insightId: string; text: string }
      | { id: string; type: "adaptationProposal"; proposalId: string; recipeId: string; summary: string; changes: string[] };

export type ChefMessage = { id: string; threadId: string; role: "chef" | "user"; createdAt: string; clientMessageId?: string; blocks: ChefBlock[] };
export type ChefThread = { id: string; context: { type: "main" } | { type: "recipe"; recipeId: string; title: string }; unreadCount: number };

export type ChefInput =
      | { type: "text"; text: string; via: "keyboard" | "voice" }
      | {
              type: "action";
              action:
                    | { type: "quickReply" | "suggestedPrompt"; messageId: string; optionId: string }
                    | { type: "anotherIdea"; messageId: string; blockId: string };
        };

export type ChefStreamEvent =
      | { event: "message.created"; data: { message: ChefMessage } }
      | { event: "block.delta"; data: { messageId: string; blockId: string; type: "text"; delta: string } }
      | { event: "block.completed"; data: { messageId: string; block: ChefBlock } }
      | { event: "message.completed"; data: { messageId: string } }
      | { event: "error"; data: { code: string; message: string } };
