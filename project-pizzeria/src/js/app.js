import { settings, select, classNames, templates } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function () {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    const idFormHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;
    for (const page of thisApp.pages) {
      if (page.id == idFormHash) {
        pageMatchingHash == page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (const link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clikcedElement = this;
        event.preventDefault();
        const id = clikcedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);

        // change URL hash
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;
    for (const singlPage of thisApp.pages) {
      singlPage.classList.toggle(classNames.pages.active, singlPage.id == pageId);
    }
    for (const singlnavLink of thisApp.navLinks) {
      singlnavLink.classList.toggle(
        classNames.nav.active,
        singlnavLink.getAttribute('href') == '#' + pageId
      );
    }
  },

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

  initBooking: function () {
    const bookingWrapper = document.querySelector(select.containerOf.booking);
    this.Booking = new Booking(bookingWrapper);
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
    thisApp.initPages();
    thisApp.initBooking();
    // thisApp.initMenu();
  },
};

app.init();
