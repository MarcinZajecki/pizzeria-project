import { settings, select, classNames, templates } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parseResponse) {
        thisApp.data.products = parseResponse;
        thisApp.initMenu();
      });
  },

  initCart: function () {
    const thisApp = this;
    const cartWrapper = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartWrapper);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.addCartObjects(event.detail.product.prepareCartProduct());
    });
  },

  initMenu: function () {
    const thisApp = this;
    for (const productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initData();
    thisApp.initCart();
    // thisApp.initMenu();
  },
};

app.init();

