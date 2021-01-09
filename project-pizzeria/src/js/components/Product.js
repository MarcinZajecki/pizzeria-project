import { select, classNames, templates } from './../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


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
    // app.cart.addCartObjects(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });
    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
