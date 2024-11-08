function appendValue(value) {
    document.getElementById('display').value += value;
  }

  function clearDisplay() {
    document.getElementById('display').value = '';
  }

  function calculateResult() {
    try {
      const result = eval(document.getElementById('display').value);
      document.getElementById('display').value = result;
    } catch (error) {
      document.getElementById('display').value = 'Error';
    }
  }


  document.getElementById('calculateButton').addEventListener('click', function() {
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const discount = parseFloat(document.getElementById('discount').value);

    if (isNaN(productPrice) || isNaN(quantity) || isNaN(discount)) {
      alert('Please enter valid values!');
      return;
    }

    const totalPrice = productPrice * quantity;
    const discountAmount = (totalPrice * discount) / 100;
    const finalPrice = totalPrice - discountAmount;

    document.getElementById('finalPrice').value = `$${finalPrice.toFixed(2)}`;
  });