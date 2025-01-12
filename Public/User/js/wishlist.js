async function createProductCards() {
    try {
        const response = await fetch('/getWishlistProducts');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const products = data.products; // Adjust this based on your actual API response structure
        console.log("Fetched products:", products);

        const productGrid = document.getElementById('productGrid');

        if (!productGrid) {
            console.error("Product grid element not found!");
            return;
        }

        // Clear the grid before adding new products
        productGrid.innerHTML = '';

        // Check if there are any products
        if (!products || products.length === 0) {
            productGrid.innerHTML = '<p class="text-center text-gray-500">No products in your wishlist.</p>';
            return;
        }

        // Add products to the grid
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300';

            // Filter out the standard fields
            const standardFields = [
                "_id", "productName", "ListingPrice", "RegularPrice", "discount",
                "Stock", "coverImage", "additionalImage", "additionalImages", "productDescription", 
                "__v", "isblocked"
            ];

            // Filter out standard fields and get remaining specifications
            const specifications = Object.entries(product).filter(([key]) => !standardFields.includes(key));

            // Display HTML for product card
            card.innerHTML = `
                <div class="relative group">
                    <img src="${product.coverImage}" alt="${product.productName}" class="w-full h-48 object-cover mb-4 rounded-lg transition transform hover:scale-110">
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>
                <div class="p-4 flex flex-col space-y-4">
                    <h3 class="text-gray-800 font-medium text-lg truncate">${product.productName}</h3>
                    <div class="description text-gray-600 text-sm h-20 overflow-hidden truncate" data-expanded="false">
                        ${product.productDescription}
                        <button class="toggle-description text-blue-500 text-xs underline mt-2">Read More</button>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-900 font-semibold">₹${product.ListingPrice}</span>
                        <button class="add-to-cart-btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors duration-300">
                            Add to Cart
                        </button>
                    </div>
                    <div class="specifications mt-4">
                        <ul id="specificationsList" class="text-gray-600 text-sm flex space-x-4">
                            <!-- Specifications will be updated dynamically -->
                        </ul>
                    </div>
                </div>
            `;

            productGrid.appendChild(card);
            cycleSpecifications(card, specifications);

            // Add event listener for description toggle
            const description = card.querySelector('.description');
            const toggleDescriptionBtn = card.querySelector('.toggle-description');
            if (toggleDescriptionBtn) {
                toggleDescriptionBtn.addEventListener('click', () => {
                    const isExpanded = description.getAttribute('data-expanded') === 'true';
                    description.classList.toggle('overflow-hidden', isExpanded);
                    description.classList.toggle('truncate', isExpanded);
                    toggleDescriptionBtn.textContent = isExpanded ? 'Read More' : 'Show Less';
                    description.setAttribute('data-expanded', !isExpanded);
                });
            }
        });

        // Initialize animations after products are added
        initializeAnimations();
    } catch (error) {
        console.error('Error fetching wishlist products:', error);
        const productGrid = document.getElementById('productGrid');
        if (productGrid) {
            productGrid.innerHTML = '<p class="text-center text-red-500">Failed to load wishlist products. Please try again later.</p>';
        }
    }
}

// Function to cycle specifications randomly and filter for quality
function cycleSpecifications(card, specifications) {
    const specificationsList = card.querySelector('#specificationsList');

    setInterval(() => {
        if (specificationsList) {
            specificationsList.innerHTML = ''; // Clear existing specifications
            const qualitySpecs = specifications.filter(([key]) => key.toLowerCase().includes("quality")); // Filter for quality specs
            const randomSpecs = getRandomSpecifications(qualitySpecs, 3); // Get 3 random quality specifications
            randomSpecs.forEach(([key, value]) => {
                const specItem = document.createElement('li');
                specItem.classList.add('flex', 'items-center');
                specItem.innerHTML = `
                    <span class="badge bg-green-500 text-white py-1 px-3 rounded-full mr-2">✅</span>
                    <span class="text-gray-700">${key.replace(/([A-Z])/g, ' $1').toUpperCase()}: ${value}</span>
                `;
                specificationsList.appendChild(specItem);
            });
        }
    }, 4000); // Change every 4 seconds
}

// Function to get a random set of specifications
function getRandomSpecifications(specifications, count) {
    const shuffled = [...specifications].sort(() => 0.5 - Math.random()); // Shuffle the array
    return shuffled.slice(0, count); // Get the first 'count' random specifications
}


// Initialize GSAP animations
function initializeAnimations() {
    // Stagger product cards entrance
    gsap.from('.product-card', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: {
            amount: 1,
            grid: 'auto',
            from: 'start'
        },
        ease: 'power3.out'
    });

    // Add to cart button animation
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            gsap.to(btn, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    gsap.to(btn, {
                        backgroundColor: '#16a34a',
                        duration: 0.3,
                        onComplete: () => {
                            setTimeout(() => {
                                gsap.to(btn, {
                                    backgroundColor: '#dc2626',
                                    duration: 0.3
                                });
                            }, 1000);
                        }
                    });
                }
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    createProductCards().then(() => {
        initializeSharePopup();
    });
});
