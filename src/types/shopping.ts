export type ID = string | number;

export type ShoppingList = {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  shareCode?: string;
};

export type ShoppingItem = {
  id: string;
  listId: string; // FK -> ShoppingList.id
  name: string;
  quantity: number;
  purchased: boolean;
  category?: string;
  notes?: string;
  images?: string[];
  createdAt: number;
};
