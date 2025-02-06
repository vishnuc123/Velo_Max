async function createProductCards() {
    try {
        // Show the loading spinner
        const loadingSpinner = document.getElementById("loading-spinner");
        if (loadingSpinner) {
            loadingSpinner.classList.remove("hidden");  // Show spinner
        }

        // Fetch the products and wishlist items using Axios
        const productsResponse = await axios.get("/getWishlistProducts");
        const wishlistResponse = await axios.get("/getWishlistItems");

        if (productsResponse.status !== 200 || wishlistResponse.status !== 200) {
            throw new Error("Failed to fetch data");
        }

        const products = productsResponse.data.products;
        const wishlistItems = wishlistResponse.data.items.items;

       

        const productGrid = document.getElementById("productGrid");

        if (!productGrid) {
            console.error("Product grid element not found!");
            return;
        }

        // Clear the grid before adding new products
        productGrid.innerHTML = "";

        // Check if there are any products
        if (!products || products.length === 0) {
            productGrid.innerHTML =
                '<p class="text-center text-gray-500">No products in your wishlist.</p>';
        } else {
            // Create a map of productId to categoryId from wishlistItems for quick lookup
            const productCategoryMap = wishlistItems.reduce((map, item) => {
                map[item.productId] = item.categoryId;
                return map;
            }, {});

            // Add products to the grid
            products.forEach((product) => {
                const card = document.createElement("div");
                card.className =
                    "product-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300";

                // Filter out the standard fields
                const standardFields = [
                    "_id",
                    "productName",
                    "ListingPrice",
                    "RegularPrice",
                    "discount",
                    "Stock",
                    "coverImage",
                    "additionalImage",
                    "additionalImages",
                    "productDescription",
                    "__v",
                    "isblocked",
                ];

                // Filter out standard fields and get remaining specifications
                const specifications = Object.entries(product).filter(
                    ([key]) => !standardFields.includes(key)
                );

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
                            <div class="flex space-x-2">
                                <!-- Add to Cart Button -->
                                <button class="add-to-cart-btn mt-4 text-gray-500 hover:text-gray-900 bg-white border border-gray-300 hover:border-gray-400 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
                                    data-productId="${product._id}" 
                                    data-categoryId="${productCategoryMap[product._id] || ""}">
                                    Add to Cart
                                </button>
                                <!-- Remove from Wishlist Button -->
                                <button class="remove-from-wishlist-btn mt-4 text-gray-500 hover:text-gray-700"
                                    data-productId="${product._id}">
                                    Remove
                                </button>
                            </div>
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
                const description = card.querySelector(".description");
                const toggleDescriptionBtn = card.querySelector(".toggle-description");
                if (toggleDescriptionBtn) {
                    toggleDescriptionBtn.addEventListener("click", () => {
                        const isExpanded =
                            description.getAttribute("data-expanded") === "true";
                        description.classList.toggle("overflow-hidden", isExpanded);
                        description.classList.toggle("truncate", isExpanded);
                        toggleDescriptionBtn.textContent = isExpanded
                            ? "Read More"
                            : "Show Less";
                        description.setAttribute("data-expanded", !isExpanded);
                    });
                }

                // Add event listener for "Add to Cart" button
                const addToCartBtn = card.querySelector(".add-to-cart-btn");
                if (addToCartBtn) {
                    addToCartBtn.addEventListener("click", async (e) => {
                        const quantity = 1;
                        const price = product.ListingPrice;
                        const productId = addToCartBtn.getAttribute("data-productId");
                        const categoryId = addToCartBtn.getAttribute("data-categoryId");

                        // Data to send to the backend
                        const data = {
                            quantity: quantity,
                            price: price,
                        };

                        // Use try-catch for handling the asynchronous Axios call
                        try {
                            const response = await axios.post(
                                `/addToCart/${categoryId}/${productId}`,
                                data
                            );
                            Swal.fire({
                                title: "Product Added to Cart!",
                                text: "The product has been added successfully.",
                                showConfirmButton: false,
                                timer: 3000,
                                timerProgressBar: true,
                                position: "top",
                                customClass: {
                                    popup:
                                        "max-w-md w-full p-4 bg-white shadow-lg rounded-lg fixed top-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 transition-all ease-in-out duration-500",
                                },
                                html: `<button onclick="window.location.href='/dashboard/products'" class="btn btn-primary mt-4">Discover Other Products You Might Like &#8594;</button>`,
                            });
                        } catch (error) {
                            // Handle error response
                            console.error("Error adding to cart:", error);
                            alert("Failed to add product to cart.");
                        }
                    });
                }

                // Add event listener for "Remove from Wishlist" button
                const removeFromWishlistBtn = card.querySelector(".remove-from-wishlist-btn");

                if (removeFromWishlistBtn) {
                    removeFromWishlistBtn.addEventListener("click", async (e) => {
                        const productId = removeFromWishlistBtn.getAttribute("data-productId");
            

                        
                        try {
                            const response = await axios.delete(`/removeFromWishlist/${productId}`);
                
                
                            // Display a success notification
                            Swal.fire({
                                title: "Product Removed from Wishlist!",
                                text: "The product has been successfully removed.",
                                showConfirmButton: false,
                                timer: 3000,
                                timerProgressBar: true,
                                position: "top",
                                customClass: {
                                    popup:
                                        "max-w-md w-full p-4 bg-white shadow-lg rounded-lg fixed top-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 transition-all ease-in-out duration-500",
                                },
                            });
                
                            // Optionally, remove the card from the product grid
                            card.remove();
                        } catch (error) {
                            // Handle error response
                            console.error("Error removing from wishlist:", error);
                            alert("Failed to remove product from wishlist.");
                        }
                    });
                }
                
            });
        }

        // Hide the loading spinner after the data is loaded
        if (loadingSpinner) {
            loadingSpinner.classList.add("hidden");  // Hide spinner
        }

        // Initialize animations after products are added
        initializeAnimations();
    } catch (error) {
        console.error("Error fetching wishlist products:", error);
        const productGrid = document.getElementById("productGrid");
        if (productGrid) {
            productGrid.innerHTML =
                '<p class="text-center text-red-500">Failed to load wishlist products. Please try again later.</p>';
        }

        // Hide the loading spinner on error
        const loadingSpinner = document.getElementById("loading-spinner");
        if (loadingSpinner) {
            loadingSpinner.classList.add("hidden");  // Hide spinner
        }
    }
}

// Function to cycle specifications randomly and filter for quality
function cycleSpecifications(card, specifications) {
  const specificationsList = card.querySelector("#specificationsList");

  setInterval(() => {
    if (specificationsList) {
      specificationsList.innerHTML = ""; // Clear existing specifications
      const qualitySpecs = specifications.filter(([key]) =>
        key.toLowerCase().includes("quality")
      ); // Filter for quality specs
      const randomSpecs = getRandomSpecifications(qualitySpecs, 3); // Get 3 random quality specifications
      randomSpecs.forEach(([key, value]) => {
        const specItem = document.createElement("li");
        specItem.classList.add("flex", "items-center");
        specItem.innerHTML = `
                    <span class="badge bg-green-500 text-white py-1 px-3 rounded-full mr-2">✅</span>
                    <span class="text-gray-700">${key.replace(/([A-Z])/g, " $1").toUpperCase()}: ${value}</span>
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
  gsap.from(".product-card", {
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: {
      amount: 1,
      grid: "auto",
      from: "start",
    },
    ease: "power3.out",
  });

  // Add to cart button animation
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      gsap.to(btn, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          gsap.to(btn, {
            backgroundColor: "#16a34a",
            duration: 0.3,
            onComplete: () => {
              setTimeout(() => {
                gsap.to(btn, {
                  backgroundColor: "#dc2626",
                  duration: 0.3,
                });
              }, 1000);
            },
          });
        },
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  createProductCards().then(() => {
    // initializeSharePopup();
  });
});
