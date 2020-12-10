/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      thisProduct.processOrder();
      // console.log('new product:', thisProduct);
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
      })
      for (const singleInput of thisProduct.formInputs) {
        singleInput.addEventListener('change', function (event) {
          thisProduct.processOrder();
        })
      }
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      })
    }

    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      let price = thisProduct.data.price;
      const paramsId = thisProduct.data.params;
      for (const singlParamId in paramsId) {
        const param = paramsId[singlParamId];
        const paramOptions = param.options;
        for (const singlParamOption in paramOptions) {
          const option = paramOptions[singlParamOption];
          // images visibility
          const allExtraImg = thisProduct.element.querySelector(`img.${singlParamId}-${singlParamOption}`);
          if (allExtraImg) {
            if (option.hasOwnProperty('default') && option.default === true) {
              allExtraImg.classList.add(classNames.menuProduct.imageVisible);
            }
            else {
              allExtraImg.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
          if (formData[singlParamId] && formData[singlParamId].includes(singlParamOption)) {
            // console.log(formData[singlParamId], 'aaa');
            // console.log(formData, 'aaabbb');
            for (let xyz of formData[singlParamId]) {
              // console.log(xyz);
              // console.log(singlParamId);
              console.log(`${xyz}-${singlParamId}`);
            }
            if (!option.hasOwnProperty('default') || option.default === false) {
              price += option.price;

              if (allExtraImg) {
                allExtraImg.classList.toggle(classNames.menuProduct.imageVisible);
              }
            }
          }
          else {
            if (option.hasOwnProperty('default') && option.default === true) {
              price -= option.price;
              if (allExtraImg) {
                allExtraImg.classList.toggle(classNames.menuProduct.imageVisible);
              }
            }
          }
        }
      }
      thisProduct.priceElem.innerHTML = price;
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
