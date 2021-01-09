import { settings, select, templates } from './../settings.js';
import utils from './../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.cartToggleTrigger();
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    console.log(element, 'element');
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }

  cartToggleTrigger() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle('active');
    });
  }

  addCartObjects(menuProduct) {
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    thisCart.generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(thisCart.generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, thisCart.generatedDOM));
    thisCart.update();
  }

  update() {
    const thisCart = this;
    thisCart.deliveryFee = 0;
    let totalNumber = 0;
    let subtotalPrice = 0;
    for (const singleProduct of thisCart.products) {
      totalNumber = singleProduct.amount;
      subtotalPrice += singleProduct.price;
    }
    if (totalNumber > 0) thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalPrice = subtotalPrice + thisCart.deliveryFee;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    for (let singleTotalPrice of thisCart.dom.totalPrice) {
      singleTotalPrice.innerHTML = subtotalPrice + thisCart.deliveryFee;
    }
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = totalNumber;
  }

  initActions() {
    const thisCart = this;
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
    thisCart.payload = {};
    thisCart.payload.adress = thisCart.dom.address.value;
    thisCart.payload.phone = thisCart.dom.phone.value;
    thisCart.payload.totalPrice = thisCart.totalPrice;
    thisCart.payload.subtotalPrice = parseInt(thisCart.dom.subtotalPrice.innerHTML);
    thisCart.payload.totalNumber = parseInt(thisCart.dom.totalNumber.innerHTML);
    thisCart.payload.deliveryFee = thisCart.deliveryFee;
    thisCart.payload.products = [];
    for (let prod of thisCart.products) {
      thisCart.payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(thisCart.payload),
    };
    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log(parsedResponse);
      });
  }

  remove(arg) {
    const thisCart = this;
    const arrayIndex = thisCart.products.indexOf(arg);
    arg.dom.wrapper.remove();
    if (arrayIndex >= 0) {
      thisCart.products.splice(arrayIndex, 1);
    }
    thisCart.update();
  }

}

export default Cart;
