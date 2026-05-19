const paymentGateway = {
  gatewayName: "Stripe",
  processPayment() {
    console.log("Processing payment through", this.gatewayName);
  },
};

paymentGateway.processPayment();

const externalProcessor  = paymentGateway.processPayment

externalProcessor()

const boundProcessor = paymentGateway.processPayment.bind(paymentGateway)

boundProcessor()