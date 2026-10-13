export type Cook = {
      id: string;
      name: string;
      isMe?: boolean;
      hasNewStory?: boolean;
};

export type Recipe = {
      id: string;
      title: string;
      cuisine: string;
      tags: string[];
      duration: string;
      imageUrl: string;
};
