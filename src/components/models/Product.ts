import { IProduct } from "../../types";

export class Product {
  private selected: IProduct | null = null;
  private products: IProduct[] = [];

  getProducts(): IProduct[] {
    return this.products;
  }

  getSelected(): IProduct | null {
    return this.selected;
  }

  setSelected(product: IProduct): void {
    this.selected = product;
  }

  setProducts(products: IProduct[]): void {
    this.products = products;
  }

  getProductById(id: string): IProduct | undefined {
    return this.products.find((product) => product.id === id);
  }
}