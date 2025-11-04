export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface IProduct {
    id: string;
    title: string;
    image: string;
    category: string;
    price: number | null;
    description: string;
}

export type TPayment = 'cash' | 'card';

export interface IBuyer {
    payment: TPayment;
    address: string;
    email: string;
    phone: string;
}

export interface IOrderResponse {
    id: string;
    total: number;
}

export interface IOrderRequest {
    payment: TPayment;
    email: string;
    phone: string;
    address: string;
}

export type IOrder = Omit<IBuyer, "payment"> & {
  payment: TPayment;
  items: string[];
  total: number;
}

export interface IValidationErrors {
  payment?: string;
  email?: string;
  phone?: string;
  address?: string;
}