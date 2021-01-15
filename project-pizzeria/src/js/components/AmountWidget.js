import { select, settings } from './../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(elem) {
    super(elem, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements();
    thisWidget.initActions();
    console.log('AmountWidget: ', thisWidget);
    thisWidget.setValue(thisWidget.dom.input.value || settings.amountWidget.defaultValue);
  }

  getElements() {
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector('input');
    thisWidget.dom.btnLess = thisWidget.dom.wrapper.querySelector('a[href*="#less"]');
    thisWidget.dom.btnMore = thisWidget.dom.wrapper.querySelector('a[href*="#more"]');
    thisWidget.dom.amountWrapper = thisWidget.dom.wrapper.querySelector('div.amount');
  }

  isValid(value) {
    // const thisWidget = this;
    const maxValue = settings.amountWidget.defaultMax;
    const minValue = settings.amountWidget.defaultMin;
    return !isNaN(value)
      && value >= minValue
      && value <= maxValue;
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function (event) {
      thisWidget.setValue(thisWidget.value);
      console.log(event);
    });
    thisWidget.dom.wrapper.addEventListener('click', function (event) {
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
