
import { select } from './../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.unitPrice = menuProduct.unitPrice;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.getElements(element);
    thisCartProduct.initAmount();
    thisCartProduct.initActions();
  }
  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    thisCartProduct.dom.input = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.input);
    thisCartProduct.dom.actionButtons = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.actionButtons);
  }

  initAmount() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.unitPrice * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }

  remove() {
    const thisCartProduct = this;
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      }
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.actionButtons.addEventListener('click', function (event) {
      event.preventDefault();
      if (event.target.getAttribute('href') === select.cartProduct.removeAtt || event.target.getAttribute('id') === select.cartProduct.removeButtonId) {
        thisCartProduct.remove();
      }
    });
  }

  getData() {
    const thisCartProduct = this;
    thisCartProduct.products = {};
    thisCartProduct.products.id = thisCartProduct.id;
    thisCartProduct.products.name = thisCartProduct.name;
    thisCartProduct.products.amount = thisCartProduct.amount;
    thisCartProduct.products.unitPrice = thisCartProduct.unitPrice;
    thisCartProduct.products.price = thisCartProduct.price;
    thisCartProduct.products.params = thisCartProduct.params;
    return thisCartProduct.products;
  }
}

export default CartProduct;
