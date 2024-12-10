document.addEventListener("DOMContentLoaded", function() {
  // Select all input elements with name="sort"
  document.querySelectorAll('input[name="sort"]').forEach((input) => {
    // Add a click event listener
    input.addEventListener('click', () => {
      // Remove 'active' class from all parent labels
      document.querySelectorAll('label').forEach((label) => {
        label.classList.remove('active');
      });

      // Add 'active' class to the clicked radio button's parent label
      input.parentElement.classList.add('active');
      
      // Call the sortProducts function here to handle sorting
      sortProducts(input.value);
    });
  });

  document.querySelector('#searchButton').addEventListener('click', async () => {
    const searchInput = document.querySelector('#searchInput').value;
    const spinner = document.querySelector('#spinner');
    
    // Check if there is any input
    if (searchInput) {
      try {
        // Show the spinner and hide the button text
        spinner.classList.remove('hidden');
        spinner.classList.add('block');
        
        // Hide the search button text
        document.querySelector('#searchButton').classList.add('opacity-50');
        
        // Send the search input to the backend via GET request
        const response = await axios.get(`/search`, {
          params: { search: searchInput },
        });
  
        // Call the function to render the results on the page
        renderSearchResults(response.data);
        
      } catch (error) {
        console.error('Error fetching search results:', error);
        alert('An error occurred while searching. Please try again.');
      } finally {
        // Hide the spinner and show the button text again
        spinner.classList.add('hidden');
        spinner.classList.remove('block');
        document.querySelector('#searchButton').classList.remove('opacity-50');
      }
    } else {
      alert('Please enter a search term');
    }
  });
  
  // Function to render the search results
  function renderSearchResults(products) {
    const resultsContainer = document.getElementById('productsListing');
    resultsContainer.innerHTML = ''; // Clear any previous results
  
    if (products.length === 0) {
      resultsContainer.textContent = 'No products found.'; // Display message if no products are found
      return;
    }
  
    // Loop through the products and display them using createProductCard
    products.forEach(product => {
      createProductCard(product, product.categoryName); // Pass categoryName as well
    });
  }
  

  
});


function sortProducts(sortType) {
  // Log the selected sort option
  console.log(`Sort by: ${sortType}`);

  // Send the sorting option to the backend using axios
  axios.post('/dashboard/products/sortProducts', { sortType: sortType })
    .then((response) => {
      console.log("Backend response:", response.data);

      // Update the product list with the sorted data
      const filteredProducts = response.data; // Assuming the backend returns sorted products
      const container = document.getElementById("productsListing");
      container.innerHTML = ""; // Clear current product grid
      console.log(filteredProducts);
      
      filteredProducts.forEach((product) => {
        createProductCard(product, product.categoryName); // Reuse existing function
      });
    })
    .catch((error) => {
      console.error("Error sorting products:", error);
    });
}


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
    console.log(data);
    
    
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

function createProductCard(product,categoryName) {
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
  button.id = 'cartButton'
  button.innerHTML = `<span class="mr-2">Add to Cart</span> &#128722;`;
  actionDiv.appendChild(button);

  // const heart = document.createElement("span");
  // heart.classList.add("text-red-500", "cursor-pointer", "hover:text-red-600", "transition");
  // heart.innerHTML = "&#9829;";
  // actionDiv.appendChild(heart);

  card.appendChild(actionDiv);
  container.appendChild(card);
}



