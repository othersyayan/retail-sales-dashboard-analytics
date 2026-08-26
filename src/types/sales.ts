export type Gender = 'Male' | 'Female';

export interface Sale {
  transactionId: number;
  date: string;
  customerId: string;
  gender: Gender;
  age: number;
  productCategory: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
}
