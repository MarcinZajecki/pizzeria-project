import { templates, select } from './../settings.js';
import AmountWidget from './AmountWidget.js';


class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.element = element;
    thisBooking.render(element);
    thisBooking.initWidgets();
  }
  render() {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = thisBooking.element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    console.log(thisBooking.dom.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);

  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidgetHours = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}

export default Booking;
