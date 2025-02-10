document.addEventListener('DOMContentLoaded', () => {
    
const eventOrigin = new EventSource('/events');
  
eventOrigin.onmessage = function (event) {
  // Parse the incoming event data (now it includes event and productId)
  const data = JSON.parse(event.data); 

  if(data.event === 'couponCreated'|| data.event === 'couponDeleted'){
    fetchCoupons();
  }
}

})

let typingTimer; 
const typingInterval = 400;



let originalCartTotal = 0;

async function checkCouponCode() {
    const couponInput = document.getElementById('coupon');
    const couponDiscount = document.getElementById('couponDiscount');
    const totalElement = document.getElementById('total');
    const couponError = document.getElementById('couponError'); // Error element
    const cartTotal = parseFloat(totalElement.textContent.replace('₹', '')) || 0;

    if (!originalCartTotal) {
        originalCartTotal = cartTotal;
    }

    clearTimeout(typingTimer);

    if (!couponInput.value.trim()) {
        couponInput.classList.remove('border-red-500', 'border-green-500');
        couponDiscount.textContent = `₹0.00`;
        couponError.classList.add('text-red-500');
        couponError.classList.remove('text-green-500');
        couponError.innerText = "Invalid Coupon Code";
        return;
    }

    typingTimer = setTimeout(async () => {
        try {
            const totalElement = document.getElementById('total')
            const totalPrice = parseFloat(totalElement.textContent.replace('₹', ''));
            const response = await axios.post(
                '/validate-coupon',
                { coupon: couponInput.value,totalPrice:totalPrice },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const { isValid, message, couponRecord } = response.data;

            if (isValid && couponRecord.isActive) {
                const currentDate = new Date();
                const startDate = new Date(couponRecord.startDate);
                const endDate = new Date(couponRecord.endDate);

                // Validate coupon date range
                if (currentDate >= startDate && currentDate <= endDate) {
                    couponInput.classList.remove('border-red-500');
                    couponInput.classList.add('border-green-500');
                    couponError.classList.add('text-green-500');
                    couponError.classList.remove('text-red-500');
                    couponError.innerText = "Valid Coupon Code! Discount Applied.";

                    // Calculate discount
                    let discountAmount = 0;
                    let discountDisplay = '';

                    if (couponRecord.discountType === 'percentage') {
                        discountAmount = (couponRecord.discountValue / 100) * originalCartTotal;
                        discountDisplay = `${couponRecord.discountValue}%`;
                    } else if (couponRecord.discountType === 'fixed') {
                        discountAmount = couponRecord.discountValue;
                        discountDisplay = `₹${discountAmount}`;
                    }

                    // Ensure discount does not exceed total
                    discountAmount = Math.min(discountAmount, originalCartTotal);

                    // Update the UI
                    const newTotal = originalCartTotal - discountAmount;
                    couponDiscount.textContent = `Discount Applied: ${discountDisplay} (₹${discountAmount.toFixed(2)})`;
                    totalElement.textContent = `₹${newTotal.toFixed(2)}`;
                } else {
                    couponInput.classList.add('border-red-500');
                    couponInput.classList.remove('border-green-500');
                    couponError.classList.add('text-red-500');
                    couponError.classList.remove('text-green-500');
                    couponError.innerText = "Coupon expired or not active.";
                    couponDiscount.textContent = `₹0.00`;
                    totalElement.textContent = `₹${originalCartTotal.toFixed(2)}`;
                }
            } else {
                couponInput.classList.add('border-red-500');
                couponInput.classList.remove('border-green-500');
                couponError.classList.add('text-red-500');
                couponError.classList.remove('text-green-500');
                couponError.innerText = message || "Invalid Coupon Code.";
                couponDiscount.textContent = `₹0.00`;
                totalElement.textContent = `₹${originalCartTotal.toFixed(2)}`;
            }
        } catch (error) {
            console.error("Error validating coupon code:", error);
            couponInput.classList.add('border-red-500');
            couponInput.classList.remove('border-green-500');
            couponError.classList.add('text-red-500');
            couponError.classList.remove('text-green-500');
            couponError.innerText = "Error validating coupon.";
            couponDiscount.textContent = `₹0.00`;
            totalElement.textContent = `₹${originalCartTotal.toFixed(2)}`;
        }
    }, typingInterval);
}


// Reset functionality when input field changes
const couponInputField = document.getElementById('coupon');
couponInputField.addEventListener('input', () => {
    if (!couponInputField.value.trim()) {
        const totalElement = document.getElementById('total');
        const couponDiscount = document.getElementById('couponDiscount');
        
        // Reset UI elements to original state
        couponInputField.classList.remove('border-red-500', 'border-green-500');
        couponDiscount.textContent = `₹0.00`;
        totalElement.textContent = `₹${originalCartTotal.toFixed(2)}`;
    }
});



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
          let discountText = '';

          if (coupon.discountType === 'fixed') {
              discountText = `Flat ₹${discountValue} OFF`;
          } else if (coupon.discountType === 'percentage') {
              discountText = `${discountValue}% OFF`;
          }

          if (coupon.discountType === 'percentage' && discountValue > 50) {
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
                          <p class="text-md font-semibold">${discountText}</p> <!-- Discount text -->
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
          } else if (coupon.discountType === 'percentage' && discountValue > 20) {
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
                          <p class="text-sm font-medium">${discountText}</p> <!-- Discount text -->
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
                          <p class="text-xs">${discountText}</p> <!-- Discount text -->
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
