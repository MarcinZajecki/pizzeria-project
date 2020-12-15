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
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
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
      thisProduct.menuImages();
      thisProduct.initAmountWidget();
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
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = select.menuProduct.imageWrapper;
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
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
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (const singleInput of thisProduct.formInputs) {
        singleInput.addEventListener('change', function (event) {
          thisProduct.processOrder();
          console.log(event);
        });
      }
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }

    menuImages() {
      // debugger;
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      const paramsId = thisProduct.data.params;
      for (const singlParamId in paramsId) {
        const param = paramsId[singlParamId];
        const paramOptions = param.options;
        for (const singlParamOption in paramOptions) {
          const allExtraImg = thisProduct.element.querySelector(`${thisProduct.imageWrapper} img.${singlParamId}-${singlParamOption}`);
          if (allExtraImg) {
            allExtraImg.classList.remove(classNames.menuProduct.imageVisible);
          }
          if (formData[singlParamId] && formData[singlParamId].includes(singlParamOption)) {
            console.log(formData, 'thisProduct');
            for (const inclOptions of formData[singlParamId]) {
              const allExtraImgIncl = thisProduct.element.querySelector(`${thisProduct.imageWrapper} img.${singlParamId}-${inclOptions}`);
              if (allExtraImgIncl) {
                allExtraImgIncl.classList.add(classNames.menuProduct.imageVisible);
              }
            }
          }
        }
      }
    }

    processOrder() {
      // debugger;
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      let price = thisProduct.data.price;
      const paramsId = thisProduct.data.params;
      for (const singlParamId in paramsId) {
        const param = paramsId[singlParamId];
        const paramOptions = param.options;
        for (const singlParamOption in paramOptions) {
          const option = paramOptions[singlParamOption];
          // Menu images - visibility
          const allExtraImg = thisProduct.element.querySelector(`${thisProduct.imageWrapper} img.${singlParamId}-${singlParamOption}`);
          if (allExtraImg) {
            allExtraImg.classList.remove(classNames.menuProduct.imageVisible);
          }
          if (formData[singlParamId] && formData[singlParamId].includes(singlParamOption)) {
            console.log(formData, 'thisProduct');
            for (const inclOptions of formData[singlParamId]) {
              const allExtraImgIncl = thisProduct.element.querySelector(`${thisProduct.imageWrapper} img.${singlParamId}-${inclOptions}`);
              if (allExtraImgIncl) {
                allExtraImgIncl.classList.add(classNames.menuProduct.imageVisible);
              }
            }
            if (!option['default'] || option.default === false) {
              price = (price + option.price);
            }
          }
          else {
            if (option['default'] && option.default === true) {
              price = (price - option.price);
            }
          }
        }
      }
      thisProduct.priceElem.innerHTML = price * thisProduct.amountWidget.value;
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
      thisWidget.elem = elem;
      thisWidget.input = thisWidget.elem.querySelector('input');
      thisWidget.btnLess = thisWidget.elem.querySelector('a[href*="less"].btn-quantity');
      thisWidget.btnMore = thisWidget.elem.querySelector('a[href*="#more"].btn-quantity');
    }

    announce() {
      const thisWidget = this;
      const evt = new Event('updated');
      thisWidget.elem.dispatchEvent(evt);
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
      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.value);
      });
      thisWidget.btnLess.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.btnMore.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

  }

  const app = {
    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
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
      thisApp.initMenu();
    },
  };

  app.init();
}