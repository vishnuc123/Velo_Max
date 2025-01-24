document.addEventListener("DOMContentLoaded", function () {
  const eventOrigin = new EventSource('/events');
  
  eventOrigin.onmessage = function (event) {
    // Parse the incoming event data (now it includes event and productId)
    const data = JSON.parse(event.data); 

    if (data.event === 'categoryStatusBlocked') {
      console.log('Category status updated. Refreshing categories...');
      updateCategories();  
      showBlockedCategoryMessage();  
    } else if (data.event === 'categoryStatusUnblocked') {
      console.log('Category status updated. Refreshing categories...');
      updateCategories();  
      showUnblockedCategoryMessage(); 
    } else if (data.event === 'productStatusBlocked') {
      const productId = data.productId; // Now the productId is part of the event data
      
      if (productId) {
        markProductUnavailable(productId); // Handle marking the product unavailable
        console.log("Product marked as unavailable:", productId);
      } else {
        console.error('Product ID is missing in the event.');
      }
    } else if (data.event === 'productStatusUnblocked') {
      const productId = data.productId; // Ensure productId is used

      if (productId) {
        markProductAvailable(productId); // Mark the product as available
        removeProductBadge(productId);   // Remove any unavailable badge
        console.log('Product status updated. Product is now available:', productId);
      } else {
        console.error('Product ID is missing in the event.');
      }
    }else if (data.event === 'offerDeleted'|| data.event === "offerCreated"){
      allProducts()
      console.log("hai");
      

    }
  };

  
  // Function to show blocked category message
 // Function to show blocked category message with SweetAlert2, progress bar, and black-yellow theme
function showBlockedCategoryMessage() {
  Swal.fire({
    icon: 'warning',
    title: 'Some categories are unavailable',
    text: 'These categories are blocked and cannot be accessed at the moment.',
    timer: 5000,  // Auto-dismiss after 5 seconds
    timerProgressBar: true,  // Show progress bar
    customClass: {
      popup: 'bg-black text-yellow-400',  // Custom black background with yellow text
    },
    willClose: () => {
      // Optional: You can add any custom actions here when the alert is closed.
    }
  });
}

// Function to show unblocked category message with SweetAlert2, progress bar, and black-yellow theme
function showUnblockedCategoryMessage() {
  Swal.fire({
    icon: 'success',
    title: 'New Category is available on the store',
    text: 'The categories have been updated and are now accessible.',
    timer: 5000,  // Auto-dismiss after 5 seconds
    timerProgressBar: true,  // Show progress bar
    customClass: {
      popup: 'bg-black text-yellow-400',  // Custom black background with yellow text
    },
    willClose: () => {
      // Optional: You can add any custom actions here when the alert is closed.
    }
  });
}

function markProductUnavailable(productId) {
  // Get the product card element by its ID (productId should match the element's ID)
  const productCard = document.getElementById(`product-${productId}`);
  
  if (productCard) {
    // Check if 'Currently Unavailable' badge is already present
    let unavailableBadge = productCard.querySelector('.unavailable-badge');
    
    if (!unavailableBadge) {
      // Create and add the 'Currently Unavailable' badge to the product card
      unavailableBadge = document.createElement('span');
      unavailableBadge.classList.add('unavailable-badge', 'text-white', 'bg-red-600', 'rounded-full', 'px-3', 'py-1', 'text-xs', 'absolute', 'top-2', 'right-2');
      unavailableBadge.textContent = 'Currently Unavailable';
      productCard.appendChild(unavailableBadge);
    }

    // Disable the 'Add to Cart' button for this product
    const cartButton = productCard.querySelector('#cartButton');
    if (cartButton) {
      cartButton.disabled = true;
      cartButton.classList.add('bg-gray-400', 'cursor-not-allowed');  // Change button appearance
      cartButton.innerHTML = '<span class="mr-2">Currently Unavailable</span>';  // Update button text
    }
  } else {
    console.error(`Product with ID ${productId} not found.`);
  }
}

function markProductAvailable(productId) {
  // Update the UI to reflect the product is available
  const productElement = document.querySelector(`[data-product-id="${productId}"]`);
  if (productElement) {
    productElement.classList.remove('unavailable'); // Example class for unavailable products
    productElement.classList.add('available'); // Example class for available products
  }
}

function removeProductBadge(productId) {
  // Remove any 'unavailable' badge from the product
  const badgeElement = document.querySelector(`[data-product-id="${productId}"] .product-badge`);
  if (badgeElement) {
    badgeElement.remove(); // Assuming the badge is an element that can be removed
  }
}



  async function updateCategories() {
    try {
      const container = document.getElementById("productsListing");
      const response = await axios.get("/getProducts");
      const data = response.data;
      console.log('allproducts', data);
  
      // Hide the 'unique-container' before updating
      document.querySelector('.unique-container').style.display = "none";
      
      const categoryDetailsResponse = await axios.get("/dashboard/category-details");
      console.log(categoryDetailsResponse.data);
  
      const categoryDetails = categoryDetailsResponse.data.data;
  
      // Clear the category buttons and add the 'All Products' button again
      const categoryContainer = document.getElementById("category-tags");
      categoryContainer.innerHTML = '';  // Clear previous buttons
      createAllProductsButton(data);    // Re-create 'All Products' button
  
      Object.keys(data.allDocuments).forEach((categoryName) => {
        createCategoryButton(categoryName, data, categoryDetails);
      });
  
      console.log("Categories updated successfully");
  
      // Trigger product update after categories are refreshed
      displayAllProducts(data);  // This will show all products after category update
      
    } catch (error) {
      console.error("Error updating categories:", error);
      alert("An error occurred while updating the categories.");
    }
  }
  
  
  

  document.querySelectorAll('input[name="sort"]').forEach((input) => {
    input.addEventListener("click", () => {
      document.querySelectorAll("label").forEach((label) => {
        label.classList.remove("active");
      });
      input.parentElement.classList.add("active");
      filterProducts(input.value, getSelectedCategory());
    });
  });

  document.querySelector("#searchButton").addEventListener("click", async () => {
    const searchInput = document.querySelector("#searchInput").value;
    const spinner = document.querySelector("#spinner");

    if (searchInput) {
      try {
        spinner.classList.toggle("hidden", false);
        document.querySelector("#searchButton").classList.add("opacity-50");

        const response = await axios.get(`/search`, {
          params: { search: searchInput },
          validateStatus: (status) => status < 500,
        });

        if (response.status === 404 || response.data.products?.length === 0) {
          Swal.fire({
            title: "No Products Found",
            text: "Sorry, the searched products were not found.",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            position: "top",
            customClass: {
              popup: "max-w-md w-full p-4 bg-white shadow-lg rounded-lg fixed top-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 transition-all ease-in-out duration-500",
            },
            html: `<button onclick="window.location.href='/dashboard/products'" class="btn btn-primary mt-4">Discover Other Products You Might Like &#8594;</button>`
          });
          return;
        }

        renderSearchResults(response.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
        alert("An error occurred while searching. Please try again.");
      } finally {
        spinner.classList.toggle("hidden", true);
        document.querySelector("#searchButton").classList.remove("opacity-50");
      }
    } else {
      Swal.fire({
        title: "Please click all products to see all products",
        text: "The search field is empty.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        position: "top",
        customClass: {
          popup: "max-w-md w-full p-4 bg-white shadow-lg rounded-lg fixed top-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 transition-all ease-in-out duration-500",
        },
        html: `<button onclick="window.location.href='/dashboard/products'" class="btn btn-primary mt-4">Discover Other Products You Might Like &#8594;</button>`
      });
    }
  });

  function renderSearchResults(data) {
    const resultsContainer = document.getElementById("productsListing");
    resultsContainer.innerHTML = "";

    const validProducts = data.filter((product) => !product.isblocked);

    if (validProducts.length > 0) {
      validProducts.forEach((product) => createProductCard(product, product.category));
    } else {
      alert('No product found');
    }
  }

  function filterProducts(sortType, categoryName) {
    console.log("categoryName",categoryName);
    
    axios.post("/dashboard/products/sortProducts", { 
      sortType, 
      categoryName // Send the category to the backend
    })
      .then((response) => {
        const sortedProducts = response.data.products.map((product) => ({
          ...product,
          category: product.category,
        }));
    
        const sortedArray = sortedProducts.sort((a, b) => {
          if (sortType === "priceLowToHigh") {
            return a.ListingPrice - b.ListingPrice;
          } else if (sortType === "priceHighToLow") {
            return b.ListingPrice - a.ListingPrice;
          } else if (sortType === "newArrivals") {
            return new Date(b.arrivalDate) - new Date(a.arrivalDate);
          } else if (sortType === "aToZ") {
            return a.productName.localeCompare(b.productName);
          } else if (sortType === "zToA") {
            return b.productName.localeCompare(a.productName);
          }
          return 0;
        });
    
        const container = document.getElementById("productsListing");
        container.innerHTML = "";
        sortedArray.forEach((product) => createProductCard(product, categoryName));
  
        // Reattach event listeners for "Add to Cart" buttons
        attachAddToCartListeners();
      })
      .catch((error) => {
        console.error("Error sorting products:", error);
        alert("Failed to filter products. Please try again later.");
      });
  }
  
  function attachAddToCartListeners() {
    const addToCartButtons = document.querySelectorAll('#cartButton');
    addToCartButtons.forEach((button) => {
      button.addEventListener('click', handleAddToCartClick);
    });
  }
  
  // Call this function in your initial load or wherever you dynamically update the product list.
  attachAddToCartListeners();
  
  

  function getSelectedCategory() {
    const categoryRadio = document.querySelector('input[name="category"]:checked');
    return categoryRadio ? categoryRadio.id.replace('category_', '') : 'all';
  }

  async function allProducts() {
    try {
        // Show the loading screen while fetching data
        document.getElementById('loadingScreen').classList.remove('hidden');
  
        // Fetch the products and category details
        const container = document.getElementById("productsListing");
        const response = await axios.get("/getProducts");
        const data = response.data;
        console.log('allproducts', data);
  
        // Fetch category details after getting the products
        const categoryDetailsResponse = await axios.get("/dashboard/category-details");
        console.log(categoryDetailsResponse.data);
  
        const categoryDetails = categoryDetailsResponse.data.data;
  
        // Create the product and category buttons
        createAllProductsButton(data);
  
        Object.keys(data.allDocuments).forEach((categoryName) => {
            createCategoryButton(categoryName, data, categoryDetails);
        });
  
        // Display all products
        displayAllProducts(data);
    } catch (error) {
        console.log("Error while getting products from the server", error);
    } finally {
        // Hide the loading screen after the operation, either success or error
        document.getElementById('loadingScreen').classList.add('hidden');
    }
}

// Call the function to load products
allProducts();

  function createAllProductsButton(data) {
    const container = document.getElementById("category-tags");

    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "flex-start";
    container.style.justifyContent = "flex-end";

    const allProductsRadio = document.createElement("input");
    allProductsRadio.type = "radio";
    allProductsRadio.name = "category";
    allProductsRadio.id = "all";
    allProductsRadio.checked = true;
    allProductsRadio.classList.add("mr-2");

    const allProductsLabel = document.createElement("label");
    allProductsLabel.htmlFor = "allProductsRadio";
    allProductsLabel.textContent = "All Products";
    allProductsLabel.classList.add("bg-gray-400", "text-white", "px-3", "py-2", "rounded-full", "cursor-pointer",
      "flex", "items-center", "justify-center", "space-x-2");

    allProductsRadio.classList.add("w-4", "h-4");

    allProductsRadio.addEventListener("change", () => {
      if (allProductsRadio.checked) {
        displayAllProducts(data);
      } else {
        document.getElementById("productsListing").innerHTML = "";
      }
    });

    container.appendChild(allProductsRadio);
    container.appendChild(allProductsLabel);
  }

  function createCategoryButton(categoryName, data, categoryDetails) {
    const container = document.getElementById("category-tags");

    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "flex-start";
    container.style.justifyContent = "flex-end";

    const categoryDetail = categoryDetails.find(detail => detail.categoryTitle.toLowerCase() === categoryName.toLowerCase());

    const categoryRadio = document.createElement("input");
    categoryRadio.type = "radio";
    categoryRadio.name = "category";
    categoryRadio.id = `category_${categoryName}`;
    categoryRadio.classList.add("mr-2");

    const categoryLabel = document.createElement("label");
    categoryLabel.htmlFor = categoryRadio.id;
    categoryLabel.textContent = categoryName;
    categoryLabel.classList.add(
      "bg-gray-400", "text-white", "px-3", "py-2", "rounded-full", "cursor-pointer", "transition-all", 
      "duration-300", "ease-in-out", "hover:scale-105", "hover:shadow-lg",
      "inline-flex", "items-center", "justify-center", "space-x-2"
    );

    categoryRadio.classList.add("w-4", "h-4");

    categoryRadio.addEventListener("change", () => {
      if (categoryRadio.checked) {
        displayCategoryProducts(categoryName, data);
      } else {
        document.getElementById("productsListing").innerHTML = "";
      }
    });

    container.appendChild(categoryRadio);
    container.appendChild(categoryLabel);
  }

  function displayAllProducts(data) {
    const container = document.getElementById("productsListing");
    container.innerHTML = "";
  
    Object.keys(data.allDocuments).forEach((categoryName) => {
      const products = data.allDocuments[categoryName];
      if (products) {
        products.filter((product) => !product.isblocked)
                .forEach((product) => createProductCard(product, categoryName));
      }
    });
  }

  function displayCategoryProducts(categoryName, data) {
    const container = document.getElementById("productsListing");
    container.innerHTML = "";

    const products = data.allDocuments[categoryName];
    if (products) {
      products.filter((product) => !product.isblocked)
        .forEach((product) => createProductCard(product, categoryName));
    }
  }

  function createProductCard(product, categoryName) {
    const container = document.getElementById("productsListing");
  
    const card = document.createElement("div");
    card.classList.add(
      "bg-white", "p-4", "rounded-lg", "shadow-lg", "mb-4",
      "transition", "transform", "hover:scale-105", "hover:shadow-2xl"
    );
    card.id = `product-${product._id}`;
  
    const img = document.createElement("img");
    img.src = product.coverImage;
    img.alt = product.productName;
    img.classList.add("w-full", "h-48", "object-cover", "mb-4", "rounded-lg", "transition", "transform", "hover:scale-110");
    card.appendChild(img);
  
    const title = document.createElement("h3");
    title.classList.add("font-bold", "text-xl", "text-gray-800", "mb-2", "text-center", "cursor-pointer");
    title.textContent = product.productName;
  
    title.addEventListener("click", () => {
      window.location.href = `/product-detail?category=${categoryName}&id=${product._id}`;
    });
    card.appendChild(title);
  
    const actionDiv = document.createElement("div");
    actionDiv.classList.add("flex", "justify-between", "items-center", "pt-4", "border-t", "border-gray-200");
  
    const priceDiv = document.createElement("div");
    
    
  
    // Check if discounted price exists and is less than the original price
if (product.discountedPrice && product.discountedPrice < product.ListingPrice) {
  const price = document.createElement("span");
  price.classList.add("text-gray-800", "font-semibold", "text-lg", "line-through");
  price.textContent = `₹${product.ListingPrice}`;
  priceDiv.appendChild(price);

  const newPrice = document.createElement("span");
  newPrice.classList.add("text-green-600", "font-semibold", "text-lg", "ml-2");
  newPrice.textContent = `₹${product.discountedPrice}`;
  priceDiv.appendChild(newPrice);

  // Log whether it's a category offer or product offer
  if (product.productOffer) {
    // Create the main offer badge container
    const offerBadge = document.createElement("div");
    offerBadge.classList.add(
        "absolute",
        "top-2",
        "right-2",
        "flex",
        "flex-col",
        "items-center",
        "z-10",
        "offer-badge-container",
        "animate-swing"
    );

    // Create string element
    const string = document.createElement("div");
    string.classList.add(
        "w-0.5",
        "h-6",
        "bg-gray-800",
        "rounded-full",
        "shadow-sm"
    );

    // Create the badge
    const badge = document.createElement("div");
    badge.classList.add(
        "bg-red-600",
        "text-white",
        "p-2",
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "relative",
        "price-tag",
        "min-w-[80px]"
    );

    // Add discount text
    const discountContainer = document.createElement("div");
    discountContainer.classList.add("text-center");

    if (product.productOffer.discountType === "fixed") {
        discountContainer.innerHTML = `
            <span class="text-xl font-bold">₹${product.productOffer.discountValue}</span>
            <span class="block text-sm font-bold">OFF</span>
        `;
    } else {
        discountContainer.innerHTML = `
            <span class="text-2xl font-bold">${product.productOffer.discountValue}%</span>
            <span class="block text-sm font-bold">OFF</span>
        `;
    }

    // Add "Product Offer" text
    const offerText = document.createElement("span");
    offerText.textContent = "Product Offer";
    offerText.classList.add("text-[10px]", "mt-1", "opacity-75");

    // Add the styles if not already present
    if (!document.querySelector('.price-tag-style')) {
        const style = document.createElement("style");
        style.classList.add('price-tag-style');
        style.textContent = `
            .price-tag {
                clip-path: polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%);
                border-radius: 4px;
            }

            .price-tag::before {
                content: '';
                position: absolute;
                inset: 2px;
                border: 1px dashed rgba(255,255,255,0.5);
                border-radius: 2px;
                clip-path: polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%);
            }

            @keyframes swing {
                0%, 100% { transform: rotate(-5deg); }
                50% { transform: rotate(5deg); }
            }

            .animate-swing {
                animation: swing 3s ease-in-out infinite;
                transform-origin: top center;
            }

            .price-tag::after {
                content: '';
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 8px;
                height: 8px;
                background: #1a1a1a;
                border-radius: 50%;
            }
        `;
        document.head.appendChild(style);
    }

    // Assemble the badge
    badge.appendChild(discountContainer);
    badge.appendChild(offerText);
    offerBadge.appendChild(string);
    offerBadge.appendChild(badge);

    // Add the badge to the card
    card.appendChild(offerBadge);

  } else if (product.categoryOffer) {
    // Create and add the offer badge (add this code after creating the card element)
    const offerBadge = document.createElement("div");
    offerBadge.classList.add(
        "absolute",
        "top-3",
        "right-3",
        "bg-amber-400",
        "text-black",
        "font-bold",
        "p-2",
        "flex",
        "flex-col",
        "items-center",
        "z-10",
        "transform",
        "clip-path-pentagon",
        "min-w-[60px]"
    );
    
    // Add stars
    const stars = document.createElement("div");
    stars.classList.add("flex", "gap-0.5", "mb-0.5");
    stars.innerHTML = "★★★";
    stars.classList.add("text-[10px]");
    
    // Add offer text
    const offerHead = document.createElement("span");
    offerHead.textContent = "Category Offer";
    offerHead.classList.add("text-[10px]", "leading-tight");
    
    const offerText = document.createElement("span");
    offerText.textContent = "On Going";
    offerText.classList.add("text-[7px]", "leading-tight");
    
    // Add discount amount
    const discountText = document.createElement("span");
    discountText.textContent = `${product.categoryOffer.discountType==="fixed"?`₹${product.categoryOffer.discountValue}`:`${product.categoryOffer.discountValue}%`}`;
    discountText.classList.add("text-xs", "font-bold");
    
    // Assemble the badge
    offerBadge.appendChild(stars);
    offerBadge.appendChild(offerHead);
    offerBadge.appendChild(offerText);
    offerBadge.appendChild(discountText);
    
    // Add the clip-path style if not already present
    if (!document.querySelector('.clip-path-pentagon')) {
        const style = document.createElement("style");
        style.textContent = `
            .clip-path-pentagon {
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            }`;
        document.head.appendChild(style);
    }
    
    // Add the badge to the card (add this line after creating the card element)
    card.appendChild(offerBadge);

    console.log("This price reflects a category offer:", product.categoryOffer);
  }
} else {
  const price = document.createElement("span");
  price.classList.add("text-gray-800", "font-semibold", "text-lg");
  price.textContent = `₹${product.ListingPrice}`;
  priceDiv.appendChild(price);
}
  
    actionDiv.appendChild(priceDiv);
  
    const button = document.createElement("button");
    button.classList.add(
      "flex", "items-center", "bg-gradient-to-r", "from-gray-900", "to-gray-900", 
      "text-white", "px-4", "py-2", "rounded-full", "hover:from-blue-200", "hover:to-blue-700", 
      "transition", "transform", "hover:scale-105"
    );
    button.id = "cartButton";
    button.dataset.categoryId = categoryName;
    button.dataset.productId = product._id;
    button.innerHTML = `<span class="mr-2">Add to Cart</span> &#128722;`;
  
    if (product.Stock <= 0) {
      const outOfStockBadge = document.createElement("span");
      outOfStockBadge.classList.add("text-white", "bg-red-600", "rounded-full", "px-3", "py-1", "text-xs", "absolute", "top-2", "left-2");
      outOfStockBadge.textContent = "Out of Stock";
      outOfStockBadge.id = "outOfStockBadge";
      card.appendChild(outOfStockBadge);
  
      button.disabled = true;
      button.classList.add("bg-gray-400", "cursor-not-allowed");
      button.innerHTML = `<span class="mr-2">Out of Stock</span>`;
    } else {
      button.addEventListener("click", handleAddToCartClick);
    }
  
    actionDiv.appendChild(button);
    card.appendChild(actionDiv);
    container.appendChild(card);
  }
  
  
  async function handleAddToCartClick(e) {
    const targetButton = e.currentTarget;
    const categoryId = targetButton.dataset.categoryId;
    const productId = targetButton.dataset.productId;

    console.log(productId,categoryId);
    

    if (!categoryId || !productId) {
      console.error("Invalid button data attributes.");
      alert("Invalid product details. Unable to proceed.");
      return;
    }

    try {
      const [productResponse, cartResponse] = await Promise.all([
        axios.get(`/getproductDetails/${categoryId}/${productId}`),
        axios.get(`/getCartItems`),
      ]);

      const productData = productResponse.data.productData;
      const cartItems = cartResponse.data.cartItems;

      const isProductInCart = cartItems.some((item) => item.productId === productId);

      if (productData.Stock <= 0) {
        alert("This product is out of stock!");
        targetButton.disabled = true;
        return;
      }

      if (isProductInCart) {
        targetButton.textContent = "Already in Cart";
        targetButton.disabled = true;
        return;
      }

      const addToCartResponse = await axios.post(`/addtoCart/${categoryId}/${productId}`, {
        price: productData.ListingPrice,
        quantity: 1,
      });

      if (addToCartResponse.status === 200 || addToCartResponse.status === 201) {
        Swal.fire({
          title: "Product Added to Cart!",
          text: "The product has been added successfully.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          position: "top",
          customClass: {
            popup: "max-w-md w-full p-4 bg-white shadow-lg rounded-lg fixed top-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 transition-all ease-in-out duration-500",
          },
          html: `<button onclick="window.location.href='/dashboard/products'" class="btn btn-primary mt-4">Discover Other Products You Might Like &#8594;</button>`,
        });

        targetButton.textContent = "Already in Cart";
        targetButton.disabled = true;
      } else {
        alert("Failed to add the product to the cart. Please try again.");
      }
    } catch (error) {
      console.error("Error processing the cart action:", error);
      alert("An error occurred while processing the cart action.");
    }
  }
});
