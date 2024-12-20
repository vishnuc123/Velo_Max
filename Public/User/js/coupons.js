

let typingTimer; 
const typingInterval = 400;

// async function getCouponDiscount () {
//   const response = await axios.get('/getCoupons')
//   const 
// }


async function checkCouponCode() {
  const couponInput = document.getElementById('coupon');
  const couponDiscount = document.getElementById('couponDiscount')

  // Clear previous timeout
  clearTimeout(typingTimer);

  // Immediate feedback for empty input
  if (!couponInput.value.trim()) {
      couponInput.classList.add('border-red-500');
      couponInput.classList.remove('border-green-500');
      return; // Exit early, no need to validate empty input
  }

  // Set a timeout to validate the coupon code
  typingTimer = setTimeout(async () => {
      try {
          const response = await axios.post(
              '/validate-coupon',
              { coupon: couponInput.value },
              { headers: { 'Content-Type': 'application/json' } }
          );

          if (response.data.isValid) {
              couponInput.classList.remove('border-red-500');
              couponInput.classList.add('border-green-500');
              couponDiscount.textContent = ``
          } else {
            couponDiscount.textContent = `₹0.00`
              couponInput.classList.add('border-red-500');
              couponInput.classList.remove('border-green-500');
          }
      } catch (error) {
          console.error("Error validating coupon code:", error);
          couponInput.classList.add('border-red-500');
          couponDiscount.textContent = `₹0.00`
      }
  }, typingInterval);
}


async function fetchCoupons() {
    try {
      const response = await axios.get('/getCoupons');
      const { coupons } = response.data;
  
      const couponList = document.getElementById('coupon-list');
      couponList.innerHTML = '';
  
      coupons.forEach(coupon => {
        const card = document.createElement('div');
        const discountValue = coupon.discountValue;
  
        let cardContent = '';
        if (discountValue > 50) {
          // High offer design (Smaller Size)
          card.classList.add(
            'p-4', // Reduced padding
            'bg-gradient-to-br',
            'from-green-400',
            'to-emerald-600',
            'text-white',
            'rounded-md', // Reduced corner radius
            'shadow-sm', // Smaller shadow
            'transition-all',
            'duration-300',
            'hover:shadow-md',
            'hover:scale-105',
            'border',
            'border-green-300'
          );
          cardContent = `
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-lg font-bold mb-1">Mega Savings!</h2> <!-- Reduced font size -->
                <p class="text-md font-semibold">Get ${discountValue}% OFF</p> <!-- Reduced font size -->
              </div>
              <div class="bg-white text-emerald-600 text-xs font-bold px-1 py-0.5 rounded">HIGH VALUE</div>
            </div>
            <p class="text-xs mt-2">Expires: ${new Date(coupon.endDate).toLocaleDateString()}</p>
            <button class="mt-4 px-3 py-1 text-sm bg-white text-emerald-600 font-medium rounded shadow-md hover:bg-emerald-50 transition duration-300 reveal-code w-full">
              Reveal Code
            </button>
            <div class="relative mt-2">
              <p class="hidden coupon-code text-sm font-mono bg-white text-emerald-600 p-2 rounded-md shadow-inner text-center font-medium tracking-wide">${coupon.code}</p>
            </div>
          `;
        } else if (discountValue > 20) {
          // Medium offer design (Smaller Size)
          card.classList.add(
            'p-3',
            'bg-gradient-to-br',
            'from-yellow-300',
            'to-amber-500',
            'text-gray-800',
            'rounded-md',
            'shadow-sm',
            'transition-all',
            'duration-300',
            'hover:shadow-md',
            'hover:scale-105',
            'border',
            'border-yellow-200'
          );
          cardContent = `
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-md font-semibold mb-1">Great Deal!</h2>
                <p class="text-sm font-medium">Save ${discountValue}%</p>
              </div>
              <div class="bg-white text-amber-600 text-xs font-bold px-1 py-0.5 rounded">GOOD OFFER</div>
            </div>
            <p class="text-xs mt-1">Expires: ${new Date(coupon.endDate).toLocaleDateString()}</p>
            <button class="mt-3 px-3 py-1 text-sm bg-white text-amber-600 font-medium rounded shadow-md hover:bg-amber-50 transition duration-300 reveal-code w-full">
              Reveal Code
            </button>
            <div class="relative mt-1">
              <p class="hidden coupon-code text-sm font-mono bg-white text-amber-600 p-2 rounded-md shadow-inner text-center font-medium">${coupon.code}</p>
            </div>
          `;
        } else {
          // Low offer design (Smaller Size)
          card.classList.add(
            'p-3',
            'bg-gradient-to-br',
            'from-gray-100',
            'to-gray-200',
            'text-gray-800',
            'rounded-md',
            'shadow-xs', // Small shadow
            'transition-all',
            'duration-300',
            'hover:shadow-sm',
            'hover:scale-105',
            'border',
            'border-gray-300'
          );
          cardContent = `
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-sm font-medium mb-1">Special Offer</h2>
                <p class="text-xs">Enjoy ${discountValue}% off</p>
              </div>
              <div class="bg-gray-800 text-white text-xs font-bold px-1 py-0.5 rounded">SAVINGS</div>
            </div>
            <p class="text-xs mt-1">Expires: ${new Date(coupon.endDate).toLocaleDateString()}</p>
            <button class="mt-2 px-2 py-1 text-xs bg-gray-800 text-white font-medium rounded shadow-sm hover:bg-gray-700 transition duration-300 reveal-code w-full">
              Reveal Code
            </button>
            <div class="relative mt-1">
              <p class="hidden coupon-code text-xs font-mono bg-white text-gray-800 p-1 rounded shadow-inner text-center">${coupon.code}</p>
            </div>
          `;
        }
  
        card.innerHTML = cardContent;
        couponList.appendChild(card);
  
        // Add event listener to reveal button
        const revealButton = card.querySelector('.reveal-code');
        const codeElement = card.querySelector('.coupon-code');
        revealButton.addEventListener('click', () => {
          codeElement.classList.toggle('hidden');
          revealButton.textContent = codeElement.classList.contains('hidden') ? 'Reveal Code' : 'Hide Code';
        });
      });
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  }
  
  window.onload = fetchCoupons;


  
 

