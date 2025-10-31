import { IBuyer, TPayment } from '../../types';

export class Buyer {
  private _payment: TPayment | null = null;
  private _address: string = '';
  private _email: string = '';
  private _phone: string = '';
  
  setBuyerNotis(data: IBuyer): void {
    this._payment = data.payment;
    this._address = data.address;
    this._email = data.email;
    this._phone = data.phone;
  }

  set payment(value: TPayment) {
    this._payment = value;
  }

  set address(value: string) {
    this._address = value;
  }

  set email(value: string) {
    this._email = value;
  }

  set phone(value: string) {
    this._phone = value;
  }

  getBuyerNotis(): IBuyer {
    return {
      payment: this._payment as TPayment,
      address: this._address,
      email: this._email,
      phone: this._phone,
    };
  }

  clearBuyerNotis(): void {
    this._payment = null;
    this._address = '';
    this._email = '';
    this._phone = '';
  }

  validateBuyerNotis(): Record<string, string> {
        const errors: Record<string, string> = {};

        if (!this._payment) errors.payment = 'Не выбран способ оплаты';
        if (!this._email) errors.email = 'Укажите электронную почту';
        if (!this._phone) errors.phone = 'Введите номер телефона';
        if (!this._address) errors.address = 'Необходим адрес доставки';
        return errors;
    }
}