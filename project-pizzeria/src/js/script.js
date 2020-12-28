/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        amountWrapper: '.amount',
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkDecreaseHrefAtt: '#less',
        iconDecreaseId: 'decreaseAmount',
        linkIncrease: 'a[href="#more"]',
        linkIncreaseHrefAtt: '#more',
        iconIncreaseId: 'increaseAmount',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
      removeAtt: '#remove',
      removeButtonId: 'removeCartButton',
      actionButtons: '.cart__action-buttons',
      input: '.amount',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      thisProduct.prepareCartProductParams();
      thisProduct.prepareCartProduct();
    }

    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data);
      const menuContainer = document.querySelector(select.containerOf.menu);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;
      thisProduct.dom = {};
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      thisProduct.imageWrapper = select.menuProduct.imageWrapper;
    }

    initAccordion() {
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      /* START: add event listener to clickable trigger on event click */
      thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProdPos = document.querySelectorAll('article.active');
        for (let singlActiveProdPos of activeProdPos) {
          /* if there is active product and it's not thisProduct.element, remove class active from it */
          if (singlActiveProdPos !== thisProduct.element) singlActiveProdPos.classList.remove('active');
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
      });
    }

    initOrderForm() {
      const thisProduct = this;
      thisProduct.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (const singleInput of thisProduct.dom.formInputs) {
        singleInput.addEventListener('change', function (event) {
          thisProduct.processOrder();
          console.log(event);
        });
      }
      thisProduct.dom.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.prepareCartProduct();
        thisProduct.addToCart();
      });
    }

    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      let price = thisProduct.data.price;
      const params = thisProduct.data.params;
      for (const singlParamId in params) {
        const param = params[singlParamId];
        const paramOptions = param.options;
        for (const singlParamOption in paramOptions) {
          const option = paramOptions[singlParamOption];
          // Menu images - visibility
          const menuImages = thisProduct.element.querySelector(`${thisProduct.imageWrapper} img.${singlParamId}-${singlParamOption}`);
          if (formData[singlParamId] && formData[singlParamId].includes(singlParamOption)) {
            if (menuImages) {
              menuImages.classList.add(classNames.menuProduct.imageVisible);
            }
            if (!option['default'] || option.default === false) {
              price = (price + option.price);
            }
          }
          else {
            if (option['default'] && option.default === true) {
              price = (price - option.price);
            }
            if (menuImages) {
              menuImages.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      thisProduct.priceSingle = price;
      thisProduct.dom.priceElem.innerHTML = price * thisProduct.amountWidget.value;
    }

    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      let paramObject = {};
      const params = thisProduct.data.params;
      for (const singlParamId in params) {
        const param = params[singlParamId];
        const paramOptions = param.options;
        for (const singlParamOption in paramOptions) {
          const option = paramOptions[singlParamOption];
          if (formData[singlParamId] && formData[singlParamId].includes(singlParamOption)) {
            paramObject[singlParamId] = {
              label: param.label,
              options: {
                singlParamOption: option.label,
              },
            };
          }
        }
      }
      return paramObject;
    }

    prepareCartProduct() {
      const thisProduct = this;
      thisProduct.productSummary = {};
      thisProduct.productSummary.name = thisProduct.data.name;
      thisProduct.productSummary.id = thisProduct.id;
      thisProduct.productSummary.amount = thisProduct.amountWidget.value;
      thisProduct.productSummary.unitPrice = thisProduct.priceSingle;
      thisProduct.productSummary.price = parseInt(thisProduct.dom.priceElem.innerHTML);
      thisProduct.productSummary.params = thisProduct.prepareCartProductParams();
      return thisProduct.productSummary;
    }

    addToCart() {
      const thisProduct = this;
      app.cart.addCartObjects(thisProduct.prepareCartProduct());
    }

  }

  class AmountWidget {
    constructor(elem) {
      const thisWidget = this;
      thisWidget.getElements(elem);
      thisWidget.initActions();
      thisWidget.setValue(settings.amountWidget.defaultValue);
    }

    getElements(elem) {
      const thisWidget = this;
      thisWidget.dom = {};
      thisWidget.dom.elem = elem;
      thisWidget.dom.input = thisWidget.dom.elem.querySelector('input');
      thisWidget.dom.btnLess = thisWidget.dom.elem.querySelector('a[href*="#less"]');
      thisWidget.dom.btnMore = thisWidget.dom.elem.querySelector('a[href*="#more"]');
      thisWidget.dom.amountWrapper = thisWidget.dom.elem.querySelector('div.amount');
    }

    announce() {
      const thisWidget = this;
      const evt = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.dom.elem.dispatchEvent(evt);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);
      const maxValue = settings.amountWidget.defaultMax;
      const minValue = settings.amountWidget.defaultMin;
      if (thisWidget.value !== newValue && !isNaN(newValue) && newValue >= minValue && newValue <= maxValue) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.dom.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;
      thisWidget.dom.input.addEventListener('change', function (event) {
        thisWidget.setValue(thisWidget.value);
        console.log(event);
      });
      thisWidget.dom.elem.addEventListener('click', function (event) {
        event.preventDefault();
        if (event.target.getAttribute('href') == select.widgets.amount.linkDecreaseHrefAtt || event.target.getAttribute('id') == select.widgets.amount.iconDecreaseId) {
          thisWidget.setValue(thisWidget.value - 1);
        }
        else if (event.target.getAttribute('href') == select.widgets.amount.linkIncreaseHrefAtt || event.target.getAttribute('id') == select.widgets.amount.iconIncreaseId) {
          thisWidget.setValue(thisWidget.value + 1);
        }
      });
    }
  }

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
      console.log(thisCart.products, ' thisCart.productssss');
      thisCart.update();
    }

    update() {
      const thisCart = this;
      let deliveryFee = 0;
      let totalNumber = 0;
      let subtotalPrice = 0;
      for (const singleProduct of thisCart.products) {
        totalNumber = singleProduct.amount;
        subtotalPrice += singleProduct.price;
      }
      if (totalNumber > 0) deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalPrice = subtotalPrice + deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      for (let singleTotalPrice of thisCart.dom.totalPrice) {
        singleTotalPrice.innerHTML = subtotalPrice + deliveryFee;
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
        console.log(event, 'to jest event');
        console.log(event.detail.cartProduct, 'to jest event.detail.cartProduct');
        thisCart.remove(event.detail.cartProduct);
      });
    }

    remove(arg) {
      const thisCart = this;
      console.log(arg, 'to jets event.detail.cartProduct');
      console.log(thisCart.products, 'to jest obiekt z produktami');
      console.log(thisCart.products.indexOf(arg), 'to jest numer indeksu');
      const arrayIndex = thisCart.products.indexOf(arg);
      arg.dom.wrapper.remove();
      if (arrayIndex >= 0) {
        thisCart.products.splice(arrayIndex, 1);
        console.log(thisCart.products, 'to jest obiekt z produktami po usunieciu');
      }
      thisCart.update();
    }

  }

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
      console.log(thisCartProduct, 'to jest this z cartProduct');
    }
    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      console.log(element, 'wrapper z cartProd');
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
      thisCartProduct.dom.input = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.input);
      thisCartProduct.dom.actionButtons = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.actionButtons);
      console.log(thisCartProduct.dom.actionButtons, 'thisCartProduct.dom.actionButtons');
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
      console.log(event, ' to jest event z remove');
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
  }

  const app = {
    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initCart: function () {
      const thisApp = this;
      const cartWrapper = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartWrapper);
    },

    initMenu: function () {
      const thisApp = this;
      for (const productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
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
      thisApp.initMenu();
    },
  };

  app.init();
}