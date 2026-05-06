export type TransactionType = "income" | "expense";
export type OwnerId = "casal" | string;

export type Transaction = {
  _id?: string;
  desc: string;
  amount: number;
  type: TransactionType;
  category: string;
  owner: OwnerId;
  date: string;
  paid: boolean;
  cardId?: string;
  cardName?: string;
  notesCount?: number;
};

export type Goal = {
  _id?: string;
  name: string;
  target: number;
  saved: number;
  icon?: string;
  color?: string;
};

export type Recurring = {
  _id?: string;
  desc: string;
  amount: number;
  type: TransactionType;
  category: string;
  day: number;
  active?: boolean;
};

export type Card = {
  _id?: string;
  name: string;
  limit: number;
  dueDay: number;
};

export type ShoppingItem = {
  _id?: string;
  name: string;
  qty: number;
  unit?: string;
  estimate?: number;
  done?: boolean;
};

export type Household = {
  id: string;
  ownerUid: string;
  memberUids: string[];
};

export type CategoryRule = {
  _id?: string;
  term: string;
  category: string;
  active?: boolean;
  createdAtMs?: number;
};

export type ImportedTransactionRow = Transaction & {
  id: string;
};

export type TransactionDraft = Partial<Transaction> & {
  desc?: string;
  amount?: number | string;
  type?: TransactionType | string;
  category?: string;
  owner?: OwnerId;
  date?: string;
  paid?: boolean;
};

export type GoalDraft = Partial<Goal> & {
  name?: string;
  target?: number | string;
  saved?: number | string;
};

export type RecurringDraft = Partial<Recurring> & {
  desc?: string;
  amount?: number | string;
  type?: TransactionType | string;
  day?: number | string;
};

export type CardDraft = Partial<Card> & {
  name?: string;
  limit?: number | string;
  dueDay?: number | string;
};

export type ShoppingItemDraft = Partial<ShoppingItem> & {
  name?: string;
  qty?: number | string;
};
