import './scss/styles.scss';
import { Basket } from "./components/models/Basket";
import { Product } from "./components/models/Product";
import { Buyer } from "./components/models/Buyer";
import { ApiService } from "./components/base/ApiService";
import { IProduct } from "./types";
import { apiProducts } from "./utils/data";
import { Api } from "./components/base/Api";
import { API_URL } from "./utils/constants";

//каталог товаров
const catalogModel = new Product();

catalogModel.setProducts(apiProducts.items);

// Вывод товара в консоль
const allProducts = catalogModel.getProducts();
console.log("Массив товаров из каталога:", allProducts);

// Поиск товара по id
let foundProduct: IProduct | undefined;
const firstProductId = apiProducts.items[0]?.id;
if (firstProductId) {
  foundProduct = catalogModel.getProductById(firstProductId);
  console.log("Товар с ID", firstProductId, ':', foundProduct);
}

if (foundProduct) {
  catalogModel.setSelected(foundProduct);
  console.log('Выбранный товар:', catalogModel.getSelected());
}

//информация о покупателе
const buyerModel = new Buyer();

// Сохраняем данные о покупателе
buyerModel.setBuyerNotis({
  payment: 'card', 
  address: "Spb Vosstania 1",
  phone: "+71234567890",
  email: "test@test.ru",
});

// Выводим данные покупателя
console.log("Информация о покупателе:", buyerModel.getBuyerNotis());

//корзина
const cartModel = new Basket();

// Добавляем товары в корзину
const product1 = apiProducts.items[0]; // добавляем первый товар
const product2 = apiProducts.items[1]; // добавляем второй товар

if (product1 && product2) {
  cartModel.addItem(product1);
  cartModel.addItem(product2);
}

//содержимое корзины
console.log("Содержимое корзины:", cartModel.getItems());

//количество товаров в корзине
console.log("Общее количество товаров:", cartModel.getCount());

//общая сумма товара в корзине
console.log("Общая сумма корзины:", cartModel.getTotal());

// проверка наличия товара в корзине по его id
console.log(`Есть ли товар с id "${product1?.id}" в корзине?`, cartModel.hasItem(product1?.id || ''));

// Удаление товара
if (product1) {
  cartModel.removeItem(product1.id);
  console.log(`Удален товар с ID "${product1.id}"`)
}

console.log("Товары в корзине после удаления:", cartModel.getItems());

// Очистка корзины
cartModel.clear();
console.log("После очистки корзины товаров:", cartModel.getCount());

// Валидация данных
const validation = buyerModel.validateBuyerNotis();
console.log('Валидация данных:', validation);

// Очистка данных покупателя
buyerModel.clearBuyerNotis();
console.log("После очистки данных:", buyerModel.getBuyerNotis());

//Работа с сервером 
const api = new Api(API_URL);            
const apiService = new ApiService(api);  

// Получение каталога товаров с сервера
apiService.fetchProducts()
  .then((_productsFromServer) => {
    // Выводим в консоль, чтобы проверить работу сервиса и модели
    console.log("Каталог товаров, полученный с сервера:", catalogModel.getProducts());
  })
  .catch((error) => {
    console.error("Ошибка при получении каталога с сервера:", error);
  });