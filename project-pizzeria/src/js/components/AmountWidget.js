import { select, settings } from './../settings.js';

class AmountWidget {
  constructor(elem) {
    const thisWidget = this;
    thisWidget.getElements(elem);
    thisWidget.initActions();
    thisWidget.setValue(thisWidget.dom.input.value || settings.amountWidget.defaultValue);
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

export default AmountWidget;
