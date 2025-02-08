const eventSource = new EventSource('/events');
eventSource.onmessage = function (event) {
  if (event.data === 'productStatusBlocked') {
    console.log('Product status updated. Refreshing cart items...');
    gettingCartItems();
    fetchCart();
  }else if(event.data === 'offerCreated'||event.data === 'offerDeleted'){
    gettingCartItems();
    fetchCart();
  } 
  else {
    console.log('Received event:', event.data);
    gettingCartItems();
    fetchCart();
  }
};

const shopNowButton = document.getElementById('shopNow')
shopNowButton.addEventListener('click', () => {
  window.location.href = '/dashboard/products'
})
const checkoutButton = document.getElementById('cart-checkout');

checkoutButton.addEventListener('click', async () => {
  try {
    const response = await axios.get('/gettingCartItems');

    const cartContainer = document.getElementById('cart-container');
    const cartContainerText = cartContainer ? cartContainer.textContent.trim() : "";
    const cartContainerHTML = cartContainer ? cartContainer.innerHTML.trim() : "";

    if (response.data.cartItems.length === 0 || cartContainerText === "Your cart is empty" || cartContainerHTML.includes('Your cart is empty')) {
      await Swal.fire({
        title: "Your Cart is Empty",
        text: "Please add items to your cart before checking out.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        position: 'top',
        customClass: {
          popup: 'max-w-md w-full p-4 bg-white shadow-lg rounded-lg fixed top-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 transition-all ease-in-out duration-500',
          image: 'rounded-md order-first',
          title: 'text-lg font-semibold text-gray-800 text-left',
          htmlContainer: 'flex-grow',
          text: 'text-sm text-gray-600 text-left',
        },
        html: `
          <button onclick="window.location.href='/dashboard/products'" class="btn btn-primary mt-4">Discover Products You Might Like &#8594;</button>
        `,
        backdrop: `rgba(0,0,0,0.4) left top no-repeat`,
        willOpen: () => {
          document.querySelector('.swal2-popup').style.opacity = '0';
        },
        didOpen: () => {
          document.querySelector('.swal2-popup').style.transition = 'opacity 0.5s ease-in-out';
          document.querySelector('.swal2-popup').style.opacity = '1';
        },
      });
    } else {
      // Cart has items and is not empty, proceed to checkout page
      window.location.href = '/cartcheckout';
    }
  } catch (error) {
    console.error('Error fetching cart items:', error);
    
    // Animated SweetAlert for error
    await Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'There was an error checking your cart. Please try again later.',
      background: '#000000',
      color: '#ffffff',
      iconColor: '#ffffff',
      showClass: {
        popup: 'animate__animated animate__shakeX animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut animate__faster'
      },
      customClass: {
        container: 'bg-black border border-white rounded-lg shadow-xl',
        title: 'text-2xl font-bold text-white mb-2',
        content: 'text-gray-300',
        confirmButton: 'bg-white text-black px-4 py-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50'
      }
    });
  }
});




async function gettingCartItems() {
  try {
    const response = await axios.get('/getCartItems');
    const data = response.data;


    const cartContainer = document.getElementById('cart-container');
    const cartTotalElement = document.getElementById('cart-total-price');

    const validCartItems = data.cartItems.filter(
      (item) => !item.productDetails.isblocked
    );

    if (validCartItems.length === 0) {
      cartContainer.innerHTML = `
        <p class="text-gray-600">Your cart is empty.</p>
        <button onclick="window.location.href='/dashboard/products'" class="btn btn-primary mt-4">
          Browse Products &#8594;
        </button>
      `;
      cartTotalElement.textContent = '₹ 0.00';
      return;
    }

    let totalPrice = 0;

    // Clear previous cart content
    cartContainer.innerHTML = '';

    // Generate cart items dynamically
    validCartItems.forEach((item, index) => {
      const stock = item.productDetails.Stock;
      const actualPrice = item.productDetails.ListingPrice;

      // Determine discounted price (product or category offer)
      const discountPrice = item.offers.productOffer
  ? item.offers.productOffer.discountType === 'percentage'
    ? actualPrice * (1 - item.offers.productOffer.discountValue / 100)
    : actualPrice - item.offers.productOffer.discountValue
  : item.offers.categoryOffer
  ? item.offers.categoryOffer.discountType === 'percentage'
    ? actualPrice * (1 - item.offers.categoryOffer.discountValue / 100)
    : actualPrice - item.offers.categoryOffer.discountValue
  : actualPrice;



      const itemPrice = discountPrice * item.quantity;
      totalPrice += itemPrice;

      let stockStatusHTML = '';
      if (stock <= 0) {
        stockStatusHTML = `<p class="text-red-600 font-semibold mt-2">Oops! Out of Stock</p>`;
      } else if (stock > 0 && stock <= 5) {
        stockStatusHTML = `<p class="text-orange-500 font-semibold mt-2">Hurry up! Only ${stock} left in stock</p>`;
      }

      let offerHTML = '';
      if (item.offers.productOffer) {
        offerHTML = `
          <p class="text-sm text-green-600 font-medium mt-2">
            Product Offer: ${item.offers.productOffer.offerName} 
            (${item.offers.productOffer.discountType === 'percentage' 
              ? item.offers.productOffer.discountValue + '% Off' 
              : '₹ ' + item.offers.productOffer.discountValue + ' Off'})
          </p>`;
      } else if (item.offers.categoryOffer) {
        offerHTML = `
          <p class="text-sm text-blue-600 font-medium mt-2">
            Category Offer: ${item.offers.categoryOffer.offerName} 
            (${item.offers.categoryOffer.discountType === 'percentage' 
              ? item.offers.categoryOffer.discountValue + '% Off' 
              : '₹ ' + item.offers.categoryOffer.discountValue + ' Off'})
          </p>`;
      }

      const cartItemHTML = `
        <div class="flex gap-6 pb-6 border-b" data-item-id="${item.productId}">
          <div class="w-32 h-32 bg-gray-50 rounded-lg overflow-hidden">
            <img src="${
              item.productDetails.coverImage || '/placeholder.svg?height=128&width=128'
            }" 
                 alt="Product" 
                 class="w-full h-full object-cover">
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-medium">${item.productDetails.productName}</h3>
            ${offerHTML}
            ${stockStatusHTML}
            <div class="flex items-center justify-between mt-4">
              <div class="flex items-center border rounded">
                <button class="px-3 py-1 hover:bg-gray-100 decreaseBtn" data-index="${index}" ${
                  stock <= 0 ? 'disabled' : ''
                }>-</button>
                <span class="px-3 py-1 border-x quantityInput" data-index="${index}">${item.quantity}</span>
                <button class="px-3 py-1 hover:bg-gray-100 increaseBtn" data-index="${index}" ${
                  stock <= 0 ? 'disabled' : ''
                }>+</button>
              </div>
              <div>
                <p class="text-lg font-medium itemPrice">₹ ${(discountPrice * item.quantity).toFixed(2)}</p>
                <p class="text-sm text-gray-500 line-through">₹ ${actualPrice}</p>
              </div>
            </div>
            <button 
              class="mt-4 text-gray-500 hover:text-gray-700" 
              onclick="removeCartItem('${item.productId}')">
              Remove
            </button>
          </div>
        </div>
      `;
      cartContainer.innerHTML += cartItemHTML;
    });

    // Update the total price
    cartTotalElement.textContent = `₹ ${totalPrice.toFixed(2)}`;

    // Attach quantity update handlers
    document.querySelectorAll('.increaseBtn').forEach((button) => {
  button.addEventListener('click', async () => {
    const index = button.dataset.index;
    const item = validCartItems[index];
    const quantityInput = document.querySelectorAll('.quantityInput')[index];
    const itemPriceElement = button
      .closest('.flex-1')
      .querySelector('.itemPrice');
    const lineThroughPriceElement = button
      .closest('.flex-1')
      .querySelector('.line-through');

    if (item.quantity < 5 && item.quantity < item.productDetails.Stock) {
      // Increase quantity
      item.quantity += 1;
      quantityInput.textContent = item.quantity;

      // Recalculate item's discounted price
      const discountPrice = item.offers.productOffer
        ? item.offers.productOffer.discountType === 'percentage'
          ? item.productDetails.ListingPrice *
            (1 - item.offers.productOffer.discountValue / 100)
          : item.productDetails.ListingPrice -
            item.offers.productOffer.discountValue
        : item.offers.categoryOffer
        ? item.offers.categoryOffer.discountType === 'percentage'
          ? item.productDetails.ListingPrice *
            (1 - item.offers.categoryOffer.discountValue / 100)
          : item.productDetails.ListingPrice -
            item.offers.categoryOffer.discountValue
        : item.productDetails.ListingPrice;

      const updatedItemPrice = discountPrice * item.quantity;

      // Update item price in the DOM
      itemPriceElement.textContent = `₹ ${updatedItemPrice.toFixed(2)}`;
      // lineThroughPriceElement.textContent = `₹ ${(item.productDetails.ListingPrice * item.quantity).toFixed(2)}`;

      // Update total price and backend
      await updateCart(item, validCartItems, cartTotalElement);
    } else{
      Swal.fire({
        title: 'Limit Reached',
        text: 'You have reached the maximum available stock for this item.',
        icon: 'warning',
        background: '#000000',
        color: '#ffffff',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white'
        }
      }).then(() => {
        // Re-enable the button after alert closes, if the stock is still at limit
        button.disabled = false;
      });
    }
  });
});

document.querySelectorAll('.decreaseBtn').forEach((button) => {
  button.addEventListener('click', async () => {
    const index = button.dataset.index;
    const item = validCartItems[index];
    const quantityInput = document.querySelectorAll('.quantityInput')[index];
    const itemPriceElement = button
      .closest('.flex-1')
      .querySelector('.itemPrice');
    const lineThroughPriceElement = button
      .closest('.flex-1')
      .querySelector('.line-through');

    if (item.quantity > 1) {
      // Decrease quantity
      item.quantity -= 1;
      quantityInput.textContent = item.quantity;

      // Recalculate item's discounted price
      const discountPrice = item.offers.productOffer
        ? item.offers.productOffer.discountType === 'percentage'
          ? item.productDetails.ListingPrice *
            (1 - item.offers.productOffer.discountValue / 100)
          : item.productDetails.ListingPrice -
            item.offers.productOffer.discountValue
        : item.offers.categoryOffer
        ? item.offers.categoryOffer.discountType === 'percentage'
          ? item.productDetails.ListingPrice *
            (1 - item.offers.categoryOffer.discountValue / 100)
          : item.productDetails.ListingPrice -
            item.offers.categoryOffer.discountValue
        : item.productDetails.ListingPrice;

      const updatedItemPrice = discountPrice * item.quantity;

      // Update item price in the DOM
      itemPriceElement.textContent = `₹ ${updatedItemPrice.toFixed(2)}`;
      // lineThroughPriceElement.textContent = `₹ ${(item.productDetails.ListingPrice * item.quantity).toFixed(2)}`;

      // Update total price and backend
      await updateCart(item, validCartItems, cartTotalElement);
    } 
  });
});

  } catch (error) {
    console.error('Failed to load cart items:', error);
  }
}

// Helper function to update cart
async function updateCart(item, validCartItems, cartTotalElement) {
  try {
    // Update backend
    await axios.post('/updateCartItem', {
      productId: item.productId,
      quantity: item.quantity,
    });

    // Recalculate total price
    let totalPrice = 0;
    validCartItems.forEach((cartItem) => {
      const discountPrice = cartItem.offers.productOffer
        ? (cartItem.offers.productOffer.discountType === 'percentage'
            ? cartItem.productDetails.ListingPrice * (1 - cartItem.offers.productOffer.discountValue / 100)
            : cartItem.productDetails.ListingPrice - cartItem.offers.productOffer.discountValue)
        : cartItem.offers.categoryOffer
        ? (cartItem.offers.categoryOffer.discountType === 'percentage'
            ? cartItem.productDetails.ListingPrice * (1 - cartItem.offers.categoryOffer.discountValue / 100)
            : cartItem.productDetails.ListingPrice - cartItem.offers.categoryOffer.discountValue)
        : cartItem.productDetails.ListingPrice;

      totalPrice += discountPrice * cartItem.quantity;
    });

    // Update total price in the UI
    cartTotalElement.textContent = `₹ ${totalPrice.toFixed(2)}`;
  } catch (error) {
    console.error('Failed to update cart:', error);
  }
}

// Initialize cart items
gettingCartItems();






const cartButton = document.getElementById('cart-button');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeButton = document.getElementById('close-cart');

function toggleCart() {
    const isCartOpen = !cartSidebar.classList.contains('translate-x-full'); // Check if the cart is currently open
    
    // Toggle cart visibility
    cartSidebar.classList.toggle('translate-x-full');
    cartOverlay.classList.toggle('hidden');
    document.body.classList.toggle('overflow-hidden');

    // Reload cart items if the cart is being opened
    if (!isCartOpen) {
        gettingCartItems();
    }

    // Optionally, reload the page when the cart is closed
    if (isCartOpen && cartSidebar.classList.contains('translate-x-full')) {
        window.location.reload();
    }
}


cartButton.addEventListener('click', toggleCart);
closeButton.addEventListener('click', toggleCart);
cartOverlay.addEventListener('click', toggleCart);

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !cartSidebar.classList.contains('translate-x-full')) {
        toggleCart();
    }
});
        function toggleDropdown(event) {
    event.preventDefault(); // Prevent default link behavior
    const dropdown = document.getElementById('dropdown');
    dropdown.classList.toggle('hidden'); // Tailwind's `hidden` class
  }

  // Example: Update user info dynamically
  document.getElementById('user-name').textContent = 'Jane Doe';
  document.getElementById('user-email').textContent = 'jane.doe@example.com';

  async function removeCartItem(itemId) {
  try {
    // Show animated confirmation dialog
    const result = await Swal.fire({
      title: 'Remove Item?',
      text: "This item will be removed from your cart",
      icon: 'warning',
      background: '#000000',
      color: '#ffffff',
      backdrop: `
        rgba(0,0,0,0.8)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `,
      showClass: {
        popup: `
          animate__animated
          animate__fadeInDown
          animate__faster
        `
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutUp
          animate__faster
        `
      },
      showCancelButton: true,
      confirmButtonColor: '#ffffff',
      cancelButtonColor: '#666666',
      confirmButtonText: 'Yes, remove it!',
      customClass: {
        title: 'text-white',
        content: 'text-gray-300',
        confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white',
        cancelButton: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-600'
      }
    });

    if (result.isConfirmed) {
      const response = await axios.delete('http://velomax.vishnuc.site/removeCartItem', {
        data: { itemId }
      });

      if (response.status === 200) {
        // Show animated success message
        await Swal.fire({
          title: 'Removed!',
          text: 'Item has been removed from cart',
          icon: 'success',
          background: '#000000',
          color: '#ffffff',
          showClass: {
            popup: `
              animate__animated 
              animate__flipInX
              animate__faster
            `
          },
          hideClass: {
            popup: `
              animate__animated
              animate__flipOutX
              animate__faster
            `
          },
          customClass: {
            title: 'text-white',
            content: 'text-gray-300',
            confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white'
          }
        });
        
        document.getElementById('cart-container').innerHTML = '';
        gettingCartItems();
      }
    }
  } catch (error) {
    console.error('Failed to remove item:', error);
    // Show animated error message
    await Swal.fire({
      title: 'Error!',
      text: 'Failed to remove item. Please try again.',
      icon: 'error',
      background: '#000000', 
      color: '#ffffff',
      showClass: {
        popup: `
          animate__animated
          animate__shakeX
          animate__faster
        `
      },
      customClass: {
        title: 'text-white',
        content: 'text-gray-300',
        confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white'
      }
    });
  }
}

const whislistButton = document.getElementById('wishlist-button')
whislistButton.addEventListener('click',() => {
  window.location.href = '/getWishlist'
})
