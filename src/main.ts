import './scss/styles.scss';
import { API_URL } from './utils/constants';
import { ApiService } from './components/base/ApiService';
import { EventEmitter } from './components/base/Events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { IOrder, IProduct, TPayment } from './types';
import { Crate } from './components/models/Basket';
import { Buyer } from './components/models/Buyer';
import { Product } from './components/models/Product';
import { CardBasket } from './components/view/cards/CardBasket';
import { CardCatalog } from './components/view/cards/CardCatalog';
import { CardPreview } from './components/view/cards/CardPreview';
import { ContactsForm } from './components/view/forms/ContactsForm';
import { OrderForm } from './components/view/forms/OrderForm';
import { Basket } from './components/view/Basket';
import { Gallery } from './components/view/Gallery';
import { Header } from './components/view/Header';
import { Modal } from './components/view/Modal';
import { Success } from './components/view/Success';

const events = new EventEmitter();
const apiService = new ApiService(API_URL);
const productsModel = new Product(events);
const cart = new Crate(events);
const buyer = new Buyer(events);

// элементы и темплейты
const basketTemplate = ensureElement<HTMLTemplateElement>("#basket")
const galleryElement = ensureElement<HTMLElement>('.gallery');
const headerElement = ensureElement<HTMLElement>('.header');
const modalElement = ensureElement<HTMLElement>(".modal")
const successTemplate = ensureElement<HTMLTemplateElement>("#success")
const orderFormTemplate = ensureElement<HTMLTemplateElement>("#order")
const contactsFormTemplate = ensureElement<HTMLTemplateElement>("#contacts")

// Представления
const basket = new Basket(cloneTemplate(basketTemplate), events);
const gallery = new Gallery(galleryElement);
const header = new Header(events, headerElement);
const modal = new Modal(modalElement, events);
const success = new Success(cloneTemplate(successTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderFormTemplate), events);
const contactsForm = new ContactsForm(cloneTemplate(contactsFormTemplate), events);

// загрузка товаров с сервера
apiService
  .fetchProducts()
  .then((products) => {
    productsModel.setProducts(products);
  })
  .catch((error) => {
    console.error('Ошибка при получении товаров:', error);
  })

// загрузка галереи
events.on('catalog:changed', () => {
  const products = productsModel.getProducts();
  const cardElements = products.map((product) => {
    const card = new CardCatalog(events);
    return card.render(product);
  });
  gallery.render({ catalog: cardElements });
})

// тыкать на карточку
events.on('product:select', (product: IProduct) => {
  productsModel.setSelected(product);
})

// прорисовка карточек
events.on('catalog:selected', (product: IProduct) => {
  const preview = new CardPreview(events);
  preview.inBasket = cart.hasItem(product.id);
  modal.open(preview.render(product));
})

// добавление в корзину 
events.on('card:toggle', (product: IProduct) => {
  const inBasket = cart.hasItem(product.id);
  if (!inBasket) {
    cart.addItem(product)
  } else {
    cart.removeItem(product.id);
  }
  modal.close();
})

// появление карточки в корзине
events.on('basket:changed', () => {
  header.counter = cart.getCount();
  const renderedCards = cart.getItems().map((product, index) => {
    return new CardBasket(events).render({ ...product, index });
  });
  basket.items = renderedCards;
  basket.total = cart.getTotal();
})

// открыть корзину
events.on('basket:open', () => {
  modal.open(basket.render());
})

// удалить товар из корзины
events.on('card:remove', (product: IProduct) => {
  cart.removeItem(product.id);
})

// кнопка Оформить
events.on('basket:order', () => {
  modal.open(orderForm.render()); 
})

// способ оплаты
events.on('payment:change', (data: { payment: TPayment }) => {
  buyer.setPayment(data.payment);
})

// адрес
events.on('address:change', (data: { address: string }) => {
  buyer.setAddress(data.address);
})

// переход
events.on('order:submit', () => {
  modal.content = contactsForm.render();
})

// email
events.on('contacts:email', (data: { email: string }) => {
  buyer.setEmail(data.email);
})

// телефон
events.on('contacts:phone', (data: { phone: string }) => {
  buyer.setPhone(data.phone);
})

// Валидация
events.on('buyer:changed', (data: { field: string }) => {
  const validation = buyer.validateBuyerNotis();
  const selectedPayment = buyer.getBuyerNotis().payment;

  if (data.field === "payment" || data.field === "address") {
    const isValid = orderForm.checkValidation(validation);
    orderForm.setSubmitEnabled(isValid);
    orderForm.toggleErrorClass(!isValid);
    orderForm.togglePaymentButtonStatus(selectedPayment);
  } else if (data.field === "email" || data.field === "phone") {
    const isValid = contactsForm.checkValidation(validation);
    contactsForm.setSubmitEnabled(isValid);
    contactsForm.toggleErrorClass(!isValid);
  }
})

// завершeние заказа
events.on('contacts:submit', () => {
  const orderData: IOrder = {
    ...buyer.getBuyerNotis(),
    items: cart.getItems().map((product) => product.id),
    total: cart.getTotal(),
  };

  apiService.sendOrder(orderData)
  .then(result => {
      if (result) {
        cart.clear();
        buyer.clearBuyerNotis();
        header.counter = cart.getCount();
        modal.content = success.render();
        orderForm.resetForm();
        contactsForm.resetForm();
        success.total = result.total;
      }
    })
  .catch(error => console.error('Ошибка оформления заказа:', error))
})

// закрыть заказ
events.on('success:close', () => {
  modal.close();
})