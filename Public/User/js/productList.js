document.addEventListener("DOMContentLoaded", function () {


  const eventSource = new EventSource('/events'); // Assuming '/events' is the endpoint sending SSE updates from your backend

  // Listen for the 'reload' event to refresh the product list
  eventSource.addEventListener('reload', function (event) {
    console.log('Product list has been updated. Reloading...');
    allProducts(); // Call the function to fetch and update the product list
  });


  
  // Add event listeners for sorting options
  document.querySelectorAll('input[name="sort"]').forEach((input) => {
    input.addEventListener("click", () => {
      // Remove 'active' class from all parent labels
      document.querySelectorAll("label").forEach((label) => {
        label.classList.remove("active");
      });

      // Add 'active' class to the clicked radio button's parent label
      input.parentElement.classList.add("active");

      // Call the sortProducts function to handle sorting
      sortProducts(input.value);
    });
  });

  // Add event listener for the search button
  document.querySelector("#searchButton").addEventListener("click", async () => {
    const searchInput = document.querySelector("#searchInput").value;
    const spinner = document.querySelector("#spinner");
    console.log(searchInput);
  
    if (searchInput) {
      try {
        // Show the spinner
        spinner.classList.remove("hidden");
        spinner.classList.add("block");
  
        // Dim the search button
        document.querySelector("#searchButton").classList.add("opacity-50");
  
        // Fetch search results from the backend
        const response = await axios.get(`/search`, {
          params: { search: searchInput },
          validateStatus: function (status) {
            return status < 500; // Resolve only if status is less than 500 (e.g., 404 will resolve)
          },
        });

        
        if (response.status === 404 || response.data.products?.length === 0) {
          Swal.fire({
            title: "No Products Found",
            text: "Sorry,The Searched Products Not Found",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            position: "top",
            customClass: {
              popup: "max-w-md w-full p-4 bg-white shadow-lg rounded-lg fixed top-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 transition-all ease-in-out duration-500",
            },
            html: `
              <button onclick="window.location.href='/dashboard/products'" class="btn btn-primary mt-4">Discover Other Products You Might Like &#8594;</button>
            `,
          });

    

          // renderSearchResults({ products: [] }); // Ensure empty render
          return;
        }
  
        console.log(response.data);
  
        // Render the search results
        renderSearchResults(response.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
        alert("An error occurred while searching. Please try again.");
      } finally {
        // Hide the spinner and restore button opacity
        spinner.classList.add("hidden");
        spinner.classList.remove("block");
        document.querySelector("#searchButton").classList.remove("opacity-50");
      }
    } else {
       Swal.fire({
            title: "please click all products to see all products",
            text: "Sorry,The Search field is empty",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            position: "top",
            customClass: {
              popup: "max-w-md w-full p-4 bg-white shadow-lg rounded-lg fixed top-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 transition-all ease-in-out duration-500",
            },
            html: `
              <button onclick="window.location.href='/dashboard/products'" class="btn btn-primary mt-4">Discover Other Products You Might Like &#8594;</button>
            `,
          });
    }
  });
  
  // Function to render search results
  function renderSearchResults(data) {
    const resultsContainer = document.getElementById("productsListing");
    resultsContainer.innerHTML = ""; // Clear previous results
  
    // Filter out products where isBlocked is true
    const validProducts = data.filter((product) => !product.isblocked);
  
    // Render each valid product
    if (validProducts.length > 0) {
      validProducts.forEach((product) => {
        createProductCard(product, product.category);
      });
    } else {
      alert('no product found')
    }
  }
  

  // Function to handle sorting
  function sortProducts(sortType) {
    console.log(`Sort by: ${sortType}`);

    axios
      .post("/dashboard/products/sortProducts", { sortType: sortType })
      .then((response) => {
        console.log("Backend response:", response.data);

        // The products are already in an array
        const sortedProducts = response.data.products.map((product) => ({
          ...product,
          category: product.category, // Retain category for URL or other uses
        }));

        // Sort the aggregated array based on the sortType
        const sortedArray = sortedProducts.sort((a, b) => {
          if (sortType === "price_low_high") {
            return a.ListingPrice - b.ListingPrice;
          } else if (sortType === "price_high_low") {
            return b.ListingPrice - a.ListingPrice;
          } else if (sortType === "new_arrivals") {
            return new Date(b.arrivalDate) - new Date(a.arrivalDate); // Assuming arrivalDate exists
          } else if (sortType === "name") {
            return a.productName.localeCompare(b.productName);
          }
          return 0;
        });

        const container = document.getElementById("productsListing");
        container.innerHTML = ""; // Clear current product grid

        sortedArray.forEach((product) => {
          createProductCard(product, product.category);
        });
      })
      .catch((error) => {
        console.error("Error sorting products:", error);
        alert("Failed to sort products. Please try again later.");
      });
  }

  });

function updateProductList(products) {
  // Implement the logic to update the product list on the page with the sorted products
  const productGrid = document.getElementById('product-tag');
  productGrid.innerHTML = ''; // Clear current product grid

  products.forEach((product) => {
    // Create and append a product element to the grid (example)
    const productElement = document.createElement('div');
    productElement.classList.add('product-item');
    productElement.innerHTML = `
      <h3>${product.name}</h3>
      <p>${product.price}</p>
      <p>Rating: ${product.rating}</p>
    `;
    productGrid.appendChild(productElement);
  });
}


async function allProducts() {
  try {
    const container = document.getElementById("productsListing"); // Ensure this matches your actual container ID
    const response = await axios.get(
      "/getProducts"
    );
    const data = response.data;
    console.log("product from the backend",data);

   
      const uniqueContainer = document.querySelector('.unique-container');
      uniqueContainer.style.display = "none";
  
    
    const categoryDetailsResponse = await axios.get("/dashboard/category-details");
    const categoryDetails = categoryDetailsResponse.data;
    console.log(data);

    const allDocuments = data.allDocuments;
    createAllProductsButton(data);

    // Create category buttons for each category
    Object.keys(allDocuments).forEach((categoryName) => {
      createCategoryButton(categoryName, data, categoryDetails);
    });

    // Display all unblocked products by default on page load
    displayAllProducts(data);
  } catch (error) {
    console.log("Error while getting products from the server", error);
  }
}

// Run the function to fetch and display all products
allProducts();

let activeCategory = null; // Variable to keep track of the currently active category

function createAllProductsButton(data) {
  const container = document.getElementById("product-tag");
  const allProductsButton = document.createElement("button");
  allProductsButton.classList.add(
    "bg-gray-400",
    "text-white",
    "px-4",
    "py-2",
    "rounded-full",
    "mr-2"
  );
  allProductsButton.textContent = "All Products";

  allProductsButton.addEventListener("click", () => {
    if (activeCategory) {
      activeCategory.classList.remove("bg-black");
      activeCategory.classList.add("bg-gray-500");
    }

    // Set the All Products button as active
    allProductsButton.classList.remove("bg-gray-400");
    allProductsButton.classList.add("bg-red-800");
    activeCategory = null; // Clear active category reference

    // Display all unblocked products
    displayAllProducts(data);
  });

  container.appendChild(allProductsButton);
}

function createCategoryButton(categoryName, data, categoryDetails) {
  const container = document.getElementById("product-tag");

  const button = document.createElement("button");
  button.classList.add("bg-gray-400", "text-white", "px-4", "py-2", "rounded-full", "mr-2");
  button.textContent = categoryName;

  button.addEventListener("click", () => {
    if (activeCategory) {
      activeCategory.classList.remove("bg-black");
      activeCategory.classList.add("bg-gray-500");
    }

    // Set the clicked button as active
    activeCategory = button;
    button.classList.remove("bg-gray-500");
    button.classList.add("bg-black");

    // Display products of the selected category
    displayCategoryProducts(categoryName, data);
  });

  container.appendChild(button);
}

function displayAllProducts(data) {
  const container = document.getElementById("productsListing");
  container.innerHTML = ""; // Clear previous products

  Object.keys(data.allDocuments).forEach((categoryName) => {
    const products = data.allDocuments[categoryName];
    if (products) {
      products.filter((product) => !product.isblocked)
              .forEach((product) => createProductCard(product, categoryName)); // Pass categoryName
    }
  });
}


// Function to display products of a specific category
function displayCategoryProducts(categoryName, data) {
  const container = document.getElementById("productsListing");
  container.innerHTML = ""; // Clear previous products

  const products = data.allDocuments[categoryName];
  if (products) {
    products.filter((product) => !product.isblocked)
            .forEach((product) => createProductCard(product, categoryName)); // Pass categoryName
  }
}

function createProductCard(product, categoryName) {
  const container = document.getElementById("productsListing");

  const card = document.createElement("div");
  card.classList.add("bg-white", "p-4", "rounded-lg", "shadow-lg", "mb-4", "transition", "transform", "hover:scale-105", "hover:shadow-2xl");

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

  const price = document.createElement("span");
  price.classList.add("text-gray-800", "font-semibold", "text-lg");
  price.textContent = `₹${product.ListingPrice}`;
  actionDiv.appendChild(price);

  const button = document.createElement("button");
  button.classList.add("flex", "items-center", "bg-gradient-to-r", "from-gray-900", "to-gray-900", "text-white", "px-4", "py-2", "rounded-full", "hover:from-blue-200", "hover:to-blue-700", "transition", "transform", "hover:scale-105");
  button.id = "cartButton";
  button.dataset.categoryId = categoryName;
  button.dataset.productId = product._id;
  button.innerHTML = `<span class="mr-2">Add to Cart</span> &#128722;`;

  // Check if the product is out of stock
  if (product.Stock <= 0) {
    const outOfStockBadge = document.createElement("span");
    outOfStockBadge.classList.add("text-white", "bg-red-600", "rounded-full", "px-3", "py-1", "text-xs", "absolute", "top-2", "right-2");
    outOfStockBadge.textContent = "Out of Stock";
    card.appendChild(outOfStockBadge);

    // Disable the Add to Cart button
    button.disabled = true;
    button.classList.add("bg-gray-400", "cursor-not-allowed");
    button.innerHTML = `<span class="mr-2">Out of Stock</span>`;
  } else {
    // Add click event listener for Add to Cart
    button.addEventListener("click", async (e) => {
      const targetButton = e.currentTarget || e.target.closest("button#cartButton");
      if (!targetButton) return;

      const categoryId = targetButton.dataset.categoryId;
      const productId = targetButton.dataset.productId;

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

        // Check stock availability
        if (productData.Stock <= 0) {
          alert("This product is out of stock!");
          targetButton.disabled = true;
          return;
        }

        // If the product is already in the cart
        if (isProductInCart) {
          targetButton.textContent = "Already in Cart";
          targetButton.disabled = true;
          return;
        }

        // Add to cart if not already present
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
            html: `
              <button onclick="window.location.href='/dashboard/products'" class="btn btn-primary mt-4">Discover Other Products You Might Like &#8594;</button>
            `,
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
    });
  }

  actionDiv.appendChild(button);
  card.appendChild(actionDiv);
  container.appendChild(card);
}



