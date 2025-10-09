export type ShoppingList = {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  shareCode?: string;

  // persisted meta on the list (matches your card UI)
  category?: string;
  notes?: string;
  imageUrl?: string;
};

export type ShoppingItem = {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  purchased: boolean;
  category?: string;
  notes?: string;
  images?: string[];
  createdAt: number; // used for "Date Added"
};

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  surname: string;
  phone: string;
};
