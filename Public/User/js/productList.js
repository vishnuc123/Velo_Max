async function allProducts() {
  try {
    const container = document.getElementById("productsListing"); // Ensure this matches your actual container ID
    const response = await axios.get(
      "http://localhost:4000/product/listProduct"
    );
    const data = response.data;
    console.log(data);

    const allDocuments = data.allDocuments;
    createAllProductsButton(data);
    // Loop through each category in allDocuments
    Object.keys(allDocuments).forEach((categoryName) => {
      const products = allDocuments[categoryName];

      // Create a button for the category
      createCategoryButton(categoryName, data);

      // Loop through each product in the category and create a card
      products.forEach(createProductCard);
    });
  } catch (error) {
    console.log("Error while getting products from the server", error);
  }
}

// Run the function to fetch and display all products
allProducts();

let activeCategory = null; // Variable to keep track of the currently active category
let allProductsButton = null; // Variable to keep track of the All Products button


function createAllProductsButton(data) {
  const container = document.getElementById("product-tag"); // Ensure this matches your actual container ID
  const allProductsButton = document.createElement("button");
  allProductsButton.classList.add(
    "bg-gray-400",
    "text-white",
    "px-4",
    "py-2",
    "rounded-full",
    "mr-2"
  ); // Styling for the button
  allProductsButton.textContent = "All Products"; // Set button text

  allProductsButton.addEventListener("click", () => {
   if (activeCategory) {
      activeCategory.classList.remove("bg-black");
      activeCategory.classList.add("bg-gray-500");
    }

    // Change the All Products button color to black
    allProductsButton.classList.remove("bg-gray-400");
    allProductsButton.classList.add("bg-red-800");

    // Clear active category reference
    activeCategory = null; // No active category when viewing all products

  
    displayAllProducts(data); // Call function to display all products
  });

  container.appendChild(allProductsButton); // Append the button to the container
}



function createCategoryButton(categoryName, data) {
  const container = document.getElementById("product-tag"); // Ensure this matches your actual container ID
  const button = document.createElement("button");
  button.classList.add(
    "bg-gray-400",
    "text-white",
    "px-4",
    "py-2",
    "rounded-full",
    "mr-2"
  ); // Add "product-tag" class as required
  button.textContent = categoryName; // Set category name as button text
  button.addEventListener("click", () => {
    if (activeCategory) {
        activeCategory.classList.remove("bg-black");
        activeCategory.classList.add("bg-gray-500");
      }
  
      // Set the clicked button as the active category
      activeCategory = button;
      button.classList.remove("bg-gray-500");
      button.classList.add("bg-black");
  
    displayCategoryProducts(categoryName, data);
  });
  container.appendChild(button);
}

function displayAllProducts(data) {
  const container = document.getElementById("productsListing"); // Ensure this matches your actual container ID
  container.innerHTML = ""; // Clear previous products

  // Loop through all categories and their products
  Object.keys(data.allDocuments).forEach((categoryName) => {
    const products = data.allDocuments[categoryName];
    products.forEach(createProductCard); // Create product cards for all products
  });
}
// Function to display products of a specific category
function displayCategoryProducts(categoryName, data) {
  const container = document.getElementById("productsListing"); // Ensure this matches your actual container ID
  container.innerHTML = ""; // Clear previous products

  // Retrieve the products for the clicked category from the previously fetched data
  const products = data.allDocuments[categoryName]; // Assuming allProductsData is accessible here

  if (products) {
    products.forEach(createProductCard); // Create product cards for the category
  } else {
    console.log(`No products found for category: ${categoryName}`);
  }
}



function createProductCard(product) {
    const container = document.getElementById("productsListing");
  
    // Create main card div
    const card = document.createElement("div");
    card.classList.add(
      "bg-white",
      "p-4",
      "rounded-lg",
      "shadow-lg",
      "mb-4",
      "transition",
      "transform",
      "hover:scale-105",
      "hover:shadow-2xl"
    );
  
    // Create and append image
    const img = document.createElement("img");
    img.src = product.coverImage; // Use product image
    img.alt = product.productName;
    img.classList.add(
      "w-full",
      "h-48",
      "object-cover",
      "mb-4",
      "rounded-lg",
      "transition",
      "transform",
      "hover:scale-110"
    );
    card.appendChild(img);
  
    // Create and append product name with click event
    const title = document.createElement("h3");
    title.classList.add(
      "font-bold",
      "text-xl",
      "text-gray-800",
      "mb-2",
      "text-center",
      "cursor-pointer"
    );
    title.textContent = product.productName;
  
    // Add click event to redirect to product detail
    title.addEventListener("click", () => {
      // Redirect to product detail page with the product ID
      window.location.href = `/product-detail?id=${product._id}`; // Use the appropriate route or path
    });
  
    card.appendChild(title);
  
  
    // Create action div
    const actionDiv = document.createElement("div");
    actionDiv.classList.add(
      "flex",
      "justify-between",
      "items-center",
      "pt-4",
      "border-t",
      "border-gray-200"
    );
  
    // Price section
    const price = document.createElement("span");
    price.classList.add("text-blue-500", "font-semibold", "text-lg");
    price.textContent = `₹.${product.ListingPrice}`;
    actionDiv.appendChild(price);
  
    // Add 'Add to Cart' button
    const button = document.createElement("button");
    button.classList.add(
      "flex",
      "items-center",
      "bg-gradient-to-r",
      "from-blue-200",
      "to-red-600",
      "text-white",
      "px-4",
      "py-2",
      "rounded-full",
      "hover:from-blue-200",
      "hover:to-blue-700",
      "transition",
      "transform",
      "hover:scale-105"
    );
    button.innerHTML = `<span class="mr-2">Add to Cart</span> &#128722;`;
    actionDiv.appendChild(button);
  
    // Add heart icon for favorites
    const heart = document.createElement("span");
    heart.classList.add(
      "text-red-500",
      "cursor-pointer",
      "hover:text-red-600",
      "transition"
    );
    heart.innerHTML = "&#9829;";
    actionDiv.appendChild(heart);
  
    // Append action div to card
    card.appendChild(actionDiv);
  
    // Append card to container
    container.appendChild(card);
  }
  