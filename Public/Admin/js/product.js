async function products() {
  try {
    const response = await axios.get("/product/listProduct");
    const data = response.data;

    console.log("products from the backend", data);
    const categorydetailsreponse = await axios.get("/category-details");
    const categoryDetails = categorydetailsreponse.data.data;
    console.log("categoryData", categoryDetails);

    const container = document.getElementById("product-list");

    const categoryTagsContainer = document.createElement("div");
    categoryTagsContainer.className = "category-tags mb-6";
    container.appendChild(categoryTagsContainer);

    const categories = Object.keys(data.allDocuments);
    categories.forEach((category) => {
      const categoryDetail = categoryDetails.find(
        (detail) =>
          detail.categoryTitle.toUpperCase() ===
          category.replace("_", " ").toUpperCase()
      );

      if (categoryDetail && !categoryDetail.isblocked) {
        const categoryTag = document.createElement("button");
        categoryTag.className =
          "category-tag bg-gray-900 text-white py-2 px-4 rounded-lg mr-2 mb-4 hover:bg-gray-800";
        categoryTag.textContent = category.replace("_", " ").toUpperCase();
        categoryTag.addEventListener("click", () => {
          showCategoryProducts(category);
        });

        categoryTagsContainer.appendChild(categoryTag);
      }
    });

    function showCategoryProducts(category) {
      const productTableContainer = document.getElementById(
        "product-table-container"
      );

      // category message Hiding
      const categoryMessage = document.getElementById("category-message");

      // Function to hide the message with a smooth transition

      // Set the transition for smooth fading
      categoryMessage.style.transition = "opacity 0.5s ease-in-out"; // 0.5 seconds fade-out
      categoryMessage.style.opacity = "0"; // Start fading out

      // After the transition, completely hide the element
      setTimeout(() => {
        categoryMessage.style.display = "none"; // Hide the element after fading out
      }, 500); // Match the duration of the opacity transition (500ms)

      if (productTableContainer) {
        productTableContainer.remove();
      }

      const tableContainer = document.createElement("div");
      tableContainer.id = "product-table-container";
      container.appendChild(tableContainer);

      const productTable = document.createElement("table");
      productTable.className =
        "min-w-full bg-white border border-gray-200 mb-12";

      const tableHeader = document.createElement("thead");
      tableHeader.innerHTML = `
        <tr class="bg-gray-200 text-gray-700">
          <th class="p-4 text-left">Image</th>
          <th class="p-4 text-left">Product Name</th>
          <th class="p-4 text-left">Price</th>
          <th class="p-4 text-left">Action</th>
        </tr>`;
      productTable.appendChild(tableHeader);

      const tableBody = document.createElement("tbody");

      const products = data.allDocuments[category];
      const limit = 10;
      const totalPages = Math.ceil(products.length / limit);
      let currentPage = 1;

      function loadProducts(page) {
        // Clear current table body
        tableBody.innerHTML = "";

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const productsToDisplay = products.slice(startIndex, endIndex);

        productsToDisplay.forEach((product) => {
          const tableRow = document.createElement("tr");

          const imageCell = document.createElement("td");
          imageCell.className = "p-4";
          const productImage = document.createElement("img");
          productImage.src = product.coverImage;
          productImage.alt = product.productName;
          productImage.className = "w-24 h-24 object-cover";
          imageCell.appendChild(productImage);
          tableRow.appendChild(imageCell);

          // const nameCell = document.createElement("td");
          // nameCell.className = "p-4 font-semibold";
          // nameCell.textContent = product.productName;
          const descriptionCell = document.createElement("td");
          descriptionCell.className = "p-4 text-gray-600";

          // Create the link element for the description
          const descriptionLink = document.createElement("a");
          descriptionLink.href = "#"; // Prevent default navigation
          descriptionLink.textContent = product.productName; // Use product name or description as the link text
          descriptionLink.className = "text-blue-500 hover:underline";
          descriptionCell.appendChild(descriptionLink);
          tableRow.appendChild(descriptionCell);

          // Product detailed view
          descriptionCell.addEventListener("click", (event) => {
            event.preventDefault();

            // Create the modal container
            const modalContainer = document.createElement("div");
            modalContainer.className =
              "fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4";
            modalContainer.style.zIndex = 1000;

            // Create the modal content
            const modalContent = document.createElement("div");
            modalContent.className =
              "bg-white w-full max-w-3xl max-h-screen overflow-y-auto p-6 rounded-lg shadow-lg relative";

            // Create left section for product title, cover image, and additional images
            const leftSection = document.createElement("div");
            leftSection.className = "md:w-1/3 p-6 bg-gray-100"; // Adding background color for contrast

            // Add product title (product name) at the top
            const productTitle = document.createElement("h2");
            productTitle.className = "text-2xl font-bold mb-4"; // Styling for product name
            productTitle.textContent = product.productName; // Display product name
            leftSection.appendChild(productTitle);

            // Add cover image
            const coverImage = document.createElement("img");
            coverImage.src = product.coverImage; // Assuming product.coverImage contains the URL
            coverImage.alt = product.productName;
            coverImage.className = "w-full h-auto mb-4 object-cover rounded-lg"; // Large cover image
            leftSection.appendChild(coverImage);

            // Add additional images (if any) in a row
            if (
              product.additionalImage &&
              Array.isArray(product.additionalImage)
            ) {
              const imagesRow = document.createElement("div");
              imagesRow.className = "flex space-x-4 mb-4"; // Flex container to arrange images in a row

              product.additionalImage.forEach((imageUrl) => {
                const additionalImage = document.createElement("img");
                additionalImage.src = imageUrl;
                additionalImage.alt = `${product.productName} additional image`;
                additionalImage.className = "w-20 h-20 object-cover rounded"; // Small images
                imagesRow.appendChild(additionalImage);
              });

              leftSection.appendChild(imagesRow);
            }

            // Create right section for product details
            const rightSection = document.createElement("div");
            rightSection.className =
              "md:w-2/3 p-6 overflow-y-auto max-h-[80vh]";

            // Create a details container for the product attributes
            const detailsContainer = document.createElement("div");
            detailsContainer.className = "details-container space-y-4";

            // Highlight stock first if available
            if (product.stock !== undefined) {
              const stockItem = document.createElement("div");
              stockItem.className = "form-group mb-4";

              const stockLabel = document.createElement("label");
              stockLabel.className = "text-lg font-semibold text-gray-700";
              stockLabel.textContent = "Stock:";

              const stockValue = document.createElement("div");
              stockValue.className = "text-lg text-gray-800";

              // Check stock value and apply a color class
              if (product.stock < 10) {
                stockValue.classList.add("text-red-600"); // Red color for low stock
              } else {
                stockValue.classList.add("text-green-600"); // Green color for sufficient stock
              }

              stockValue.textContent = product.stock; // Show stock value

              stockItem.appendChild(stockLabel);
              stockItem.appendChild(stockValue);
              detailsContainer.appendChild(stockItem);
            }

            // Dynamically iterate over all other keys of the product object to display specifications
            Object.keys(product).forEach((key) => {
              // Filter out unnecessary fields
              if (
                [
                  "_id",
                  "coverImage",
                  "additionalImage",
                  "productName",
                  "__v",
                  "stock",
                ].includes(key)
              )
                return;

              const value = product[key];
              const detailItem = document.createElement("div");
              detailItem.className = "form-group mb-4"; // Added margin between items

              const label = document.createElement("label");
              label.className = "text-lg font-semibold text-gray-700"; // Label style
              label.textContent = key.replace(/([A-Z])/g, " $1") + ":"; // Format key with spaces between words

              const valueText = document.createElement("div");
              valueText.className = "text-lg text-gray-800"; // Styling for the value display
              if (Array.isArray(value)) {
                // Handle arrays (e.g., images or multiple values)
                valueText.innerHTML = value.join(", ");
              } else {
                valueText.textContent = value;
              }

              detailItem.appendChild(label);
              detailItem.appendChild(valueText);
              detailsContainer.appendChild(detailItem);
            });

            // Append the details container to the right section
            rightSection.appendChild(detailsContainer);

            // Add close button to close the modal
            const closeButton = document.createElement("button");
            closeButton.id = "closeModal";
            closeButton.className =
              "mt-6 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300";
            closeButton.textContent = "Close";

            rightSection.appendChild(closeButton);

            // Append sections to modal content
            modalContent.appendChild(leftSection);
            modalContent.appendChild(rightSection);

            // Append modal container to the body
            modalContainer.appendChild(modalContent);
            document.body.appendChild(modalContainer);

            // Add event listener to close the modal
            closeButton.addEventListener("click", () => {
              document.body.removeChild(modalContainer);
            });
          });

          const priceCell = document.createElement("td");
          priceCell.className = "p-4 font-bold text-green-600";
          priceCell.textContent = `Price: ₹${new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 2,
          }).format(product.ListingPrice)}`;

          tableRow.appendChild(priceCell);

          const actionCell = document.createElement("td");
          actionCell.className = "p-4";

          const editButton = document.createElement("button");
          editButton.id = "productEditButton";
          editButton.className =
            " text-black py-2 pb-2 px-4 rounded-lg mr-2 flex items-center space-x-2 hover:bg-blue-400 transition duration-300";

          // Create and add the pencil icon
          const editIcon = document.createElement("i");
          editIcon.className = "fas fa-pencil-alt"; // FontAwesome pencil icon

          editButton.appendChild(editIcon);
          editButton.appendChild(document.createTextNode(" Edit")); // Add text after the icon

          // Append button to the action cell
          actionCell.appendChild(editButton);

          // Add click event listener
          editButton.addEventListener("click", () => {
            openEditModal(product, category);
          });

          // delete button
          const deleteButton = document.createElement("button");
          deleteButton.className =
            "text-black py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-200"; // Adjusted for text and icon
          const icon = document.createElement("span"); // For the icon
          deleteButton.appendChild(icon);

          // Set initial icon based on the product's block state
          if (product.isblocked) {
            icon.className = "fa fa-lock"; // Font Awesome locked icon for blocked product
            deleteButton.textContent = " Unblock"; // Button text
          } else {
            icon.className = "fa fa-unlock"; // Font Awesome unlocked icon for unblocked product
            deleteButton.textContent = " Block"; // Button text
          }

          actionCell.appendChild(deleteButton);

          deleteButton.addEventListener("click", async () => {
            if (product.isblocked == true) {
              // Unblock the product
              const response = await axios.patch(
                `/product/${category}/${product._id}/unblock`
              );
              const data = response.data;
              console.log(data);

              // Update button text, icon, and product state
              icon.className = "fa fa-unlock"; // Font Awesome unlocked icon
              deleteButton.textContent = " Block";
              product.isblocked = false; // Toggle the blocked state
            } else {
              // Block the product
              const response = await axios.patch(
                `/product/${category}/${product._id}/block`
              );
              const data = response.data;
              console.log(data);

              // Update button text, icon, and product state
              icon.className = "fa fa-lock"; // Font Awesome locked icon
              deleteButton.textContent = " Unblock";
              product.isblocked = true; // Toggle the blocked state
            }
          });

          tableRow.appendChild(actionCell);
          tableBody.appendChild(tableRow);
        });
      }

      // Load products for the first page
      loadProducts(currentPage);

      // Append table body to the table
      productTable.appendChild(tableBody);
      tableContainer.appendChild(productTable);

      // Pagination controls
      const paginationContainer = document.createElement("div");
      paginationContainer.className = "pagination mb-6 text-center";

      const prevButton = document.createElement("button");
      prevButton.textContent = "Previous";
      prevButton.className = "bg-gray-500 text-white py-2 px-4 rounded-lg mr-2";
      prevButton.disabled = currentPage === 1;
      prevButton.addEventListener("click", () => {
        currentPage--;
        loadProducts(currentPage);
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
      });

      const nextButton = document.createElement("button");
      nextButton.textContent = "Next";
      nextButton.className = "bg-gray-500 text-white py-2 px-4 rounded-lg";
      nextButton.disabled = currentPage === totalPages;
      nextButton.addEventListener("click", () => {
        currentPage++;
        loadProducts(currentPage);
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
      });

      paginationContainer.appendChild(prevButton);
      paginationContainer.appendChild(nextButton);
      tableContainer.appendChild(paginationContainer);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Call the products function to load data
products();

document.addEventListener("DOMContentLoaded", () => {
  const ProductListContainer = document.getElementById("product-list");
  let selectedCategory;

  document
    .getElementById("openModalBtn")
    .addEventListener("click", async function () {
      try {
        // document.getElementById("openModalBtn").disabled = true;

        if (document.getElementById("categoryModal")) return;

        const modal = document.createElement("div");
        modal.id = "categoryModal";
        modal.className =
          "absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center";

        const modalContent = document.createElement("div");
        modalContent.className =
          "bg-white w-full max-w-4xl h-auto max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg";

        const modalTitle = document.createElement("h2");
        modalTitle.className = "text-3xl font-semibold mb-4 text-gray-900";
        modalTitle.textContent = "Select a Category";

        const categorySelect = document.createElement("select");
        categorySelect.className =
          "w-full p-4 border border-gray-300 rounded-lg mb-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

        const response = await axios.get("/category-details");
        const data = response.data.data;

        data.forEach((item) => {
          if (!item.isblocked) {
            const option = document.createElement("option");
            option.value = item.categoryTitle;
            option.textContent = item.categoryTitle;
            categorySelect.appendChild(option);
          }
        });

        const submitButton = document.createElement("button");
        submitButton.className =
          "bg-blue-500 text-white px-6 py-3 rounded-lg mr-4 hover:bg-blue-600 transition duration-300 text-lg focus:outline-none";
        submitButton.textContent = "Submit";

        submitButton.addEventListener("click", async function () {
          selectedCategory = categorySelect.value;
          const response = await axios.get(`/products/${selectedCategory}`);
          const data = response.data.categoryAttributes;
          console.log("data", data);

          document.body.removeChild(modal);
          // if (document.getElementById("formModal")) return;
          // if (document.getElementById("categoryModal")) return;

          const form = document.createElement("form");
          form.id = "productForm";
          form.className = "grid grid-cols-1 gap-6";
          form.method = "POST";
          form.enctype = "multipart/form-data";

          const formModal = document.createElement("div");
          formModal.id = "formModal";
          formModal.className =
            "fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4";

          // Adjust modal content for proper alignment and responsiveness
          const formModalContent = document.createElement("div");
          formModalContent.className =
            "bg-white w-full max-w-3xl max-h-screen overflow-y-auto p-6 rounded-lg shadow-lg relative";

          // Ensure the modal doesn't overflow
          formModalContent.style.maxHeight = "calc(100vh - 40px)";
          formModalContent.style.overflowY = "auto";
          formModalContent.style.margin = "20px";

          const formContainer = document.createElement("div");
          formContainer.id = "formContainer";
          formContainer.className = "grid grid-cols-1 gap-6 z-50";

          const closeFormModalButton = document.createElement("span");
          closeFormModalButton.innerHTML = "&times;";
          closeFormModalButton.className =
            "text-4xl cursor-pointer w-8 h-8 text-gray-700 hover:text-gray-900";

          // Append the close button to the form container
          form.appendChild(closeFormModalButton);

          // Position the close button absolutely to the top-right corner
          closeFormModalButton.style.position = "absolute";
          closeFormModalButton.style.top = "20px";
          closeFormModalButton.style.right = "20px";

          const formTitle = document.createElement("h2");
          formTitle.className = "text-3xl font-semibold mb-6 text-gray-900";
          formTitle.textContent = "Add New Product";
          formContainer.append(form);
          form.appendChild(formTitle);

          closeFormModalButton.addEventListener("click", function () {
            if (ProductListContainer.contains(formContainer)) {
              ProductListContainer.removeChild(formContainer);
            } else {
              document.body.removeChild(formModal);
            }
          });

          // Wrap the form groups into left and right column containers
          const leftColumn = document.createElement("div");
          leftColumn.className = "grid grid-cols-1 gap-6";

          const rightColumn = document.createElement("div");
          rightColumn.className = "grid grid-cols-1 gap-6";

          // Add basic product form fields to the left column
          leftColumn.appendChild(
            createFormGroup(
              "Product Name",
              "text",
              "Enter product name",
              "productName"
            )
          );
          leftColumn.appendChild(
            createFormGroup(
              "Description",
              "textarea",
              "Enter product description",
              "productDescription"
            )
          );
          leftColumn.appendChild(
            createFormGroup(
              "Regular Price",
              "number",
              "Enter product price",
              "productRegularPrice"
            )
          );
          leftColumn.appendChild(
            createFormGroup(
              "Listing Price",
              "number",
              "Enter product price",
              "productListingPrice"
            )
          );
          leftColumn.appendChild(
            createFormGroup("Brand", "text", "Enter brand name", "productBrand")
          );

          // Add stock and image-related fields to the right column
          rightColumn.appendChild(
            createFormGroup(
              "Stock",
              "number",
              "Enter product stock",
              "productStock"
            )
          );
          rightColumn.appendChild(
            createImageInput("Cover Image:", "coverImage")
          );

          // Add additional images to the right column
          const additionalImagesGroup = document.createElement("div");
          const additionalImagesLabel = document.createElement("label");
          additionalImagesLabel.textContent = "Additional Images:";
          additionalImagesGroup.appendChild(additionalImagesLabel);
          addAdditionalImages(additionalImagesGroup, 4);
          rightColumn.appendChild(additionalImagesGroup);

          // Dynamic Fields based on Category Attributes
          data.forEach((item) => {
            const formGroup = document.createElement("div");
            formGroup.classList.add("form-group", "mb-6");

            const label = document.createElement("label");
            label.setAttribute("for", item.key);
            label.innerText = item.key;
            formGroup.appendChild(label);

            let input;

            if (item.value === "string") {
              input = document.createElement("input");
              input.setAttribute("type", "text");
              input.setAttribute("name", item.key);
              input.setAttribute("placeholder", `Enter ${item.key}`);
              input.classList.add(
                "form-input",
                "w-full",
                "p-4",
                "border",
                "border-gray-300",
                "rounded-lg",
                "text-lg"
              );
            } else if (item.value === "number") {
              input = document.createElement("input");
              input.setAttribute("type", "number");
              input.setAttribute("name", item.key);
              input.setAttribute("placeholder", `Enter ${item.key}`);
              input.classList.add(
                "form-input",
                "w-full",
                "p-4",
                "border",
                "border-gray-300",
                "rounded-lg",
                "text-lg"
              );
            } else if (item.value === "boolean") {
              input = document.createElement("input");
              input.setAttribute("type", "checkbox");
              input.checked = Boolean(item.key); // Convert the key to boolean and set checkbox state
              input.addEventListener("change", () => {
                // When the checkbox is checked, store "yes", otherwise store "no"
                input.value = input.checked ? "yes" : "no";
              });
              input.setAttribute("name", item.key);
              input.classList.add("form-checkbox", "h-4", "w-5", "m-2");

              // Initially set the value attribute to "yes" or "no" based on the checkbox state
              input.value = input.checked ? "yes" : "no";
            }

            if (input) {
              formGroup.appendChild(input);
            }

            // Alternate placement of dynamic fields between left and right columns
            if (item.key.length % 2 === 0) {
              leftColumn.appendChild(formGroup);
            } else {
              rightColumn.appendChild(formGroup);
            }
          });

          // Add left and right columns to the form
          const columnsContainer = document.createElement("div");
          columnsContainer.className = "grid grid-cols-2 gap-12";
          columnsContainer.appendChild(leftColumn);
          columnsContainer.appendChild(rightColumn);

          // Append the columns container to the form
          form.appendChild(columnsContainer);

          // Append the form to the modal content
          formModalContent.appendChild(formContainer);
          formModal.appendChild(formModalContent);

          // Append the form modal to the body
          document.body.appendChild(formModal);

          // Submit Button
          const submitFormButton = document.createElement("button");
          submitFormButton.className =
            "bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300 mt-6 text-lg focus:outline-none";
          submitFormButton.textContent = "Add Product";
          submitFormButton.type = "submit";

          form.appendChild(submitFormButton);

          // Toast Message
          const toast = document.createElement("div");
          toast.id = "toast";
          toast.className =
            "absolute top-5 right-5 bg-green-500 text-white py-3 px-6 rounded-md shadow-md opacity-0 transition-opacity duration-300";
          toast.textContent = "Product added successfully!";
          document.body.appendChild(toast);

          // });

          function validateForm() {
            let isValid = true;

            // Define regex patterns for standard fields
            const regexPatterns = {
              productName: /^[a-zA-Z0-9][a-zA-Z0-9 ]*$/,
              Brand: /^[a-zA-Z0-9][a-zA-Z0-9 ]*$/,
              RegularPrice: /^\d+(\.\d{1,2})?$/,
              ListingPrice: /^\d+(\.\d{1,2})?$/,
              Stock: /^\d+$/,
            };

            // Loop through each input element in the form
            const inputs = form.querySelectorAll("input, textarea");

            inputs.forEach((input) => {
              // Clear any previous error message
              const error = input.nextElementSibling;
              if (error && error.classList.contains("error-message")) {
                error.remove();
              }

              // General required field validation
              if (!input.value.trim()) {
                showError(input, `${input.name} is required.`);
                isValid = false;
                return;
              }

              // Skip validation for specific fields like additionalImages
              if (
                input.name === "additionalImages" ||
                input.name.startsWith("additionalImage_")
              ) {
                return;
              }

              // Specific validations using regex
              if (regexPatterns[input.name]) {
                const regex = regexPatterns[input.name];
                if (!regex.test(input.value.trim())) {
                  showError(
                    input,
                    `${input.name} is invalid. Please enter a valid ${input.name}.`
                  );
                  isValid = false;
                  return;
                }

                // Additional check for spaces-only input
                if (input.value.trim().length < 2) {
                  showError(
                    input,
                    `${input.name} must be at least 2 characters long.`
                  );
                  isValid = false;
                  return;
                }
              }

              // Price and stock validations
              if (
                (input.name === "RegularPrice" ||
                  input.name === "ListingPrice") &&
                (isNaN(input.value) || input.value <= 0)
              ) {
                showError(input, "Price should be a positive number.");
                isValid = false;
              } else if (
                input.name === "Stock" &&
                (isNaN(input.value) || input.value < 0)
              ) {
                showError(input, "Stock should be a non-negative number.");
                isValid = false;
              }
            });

            return isValid;
          }
          // Helper function to show error message for a specific input
          function showError(input, message) {
            // Check if an error message already exists
            if (
              !input.nextElementSibling ||
              !input.nextElementSibling.classList.contains("error-message")
            ) {
              // Create a new error message element
              const error = document.createElement("span");
              error.classList.add("error-message");
              error.innerText = message;
              error.style.color = "red";
              // Insert the error message after the input element
              input.parentNode.insertBefore(error, input.nextSibling);
            }
          }
          submitFormButton.addEventListener("click", async function (event) {
            event.preventDefault();

            // Validate form before proceeding
            const isFormValid = await validateForm();
            if (!isFormValid) {
              return;
            }

            Swal.fire({
              title: "Are you sure?",
              text: "You won't be able to revert this!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6", // Initial button color for confirmation
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, submit it!",
            }).then(async (result) => {
              if (result.isConfirmed) {
                try {
                  const formDetails = new FormData(
                    document.getElementById("productForm")
                  );
                  const response = await axios.post(
                    `/product/Addproduct/${selectedCategory}`,
                    formDetails
                  );

                  // Show success notification with updated button color
                  Swal.fire({
                    title: "Submitted!",
                    text: "Your product has been added successfully.",
                    icon: "success",
                    confirmButtonColor: "#28a745", // New color for success button
                  });
                  // Optionally show toast message here
                  const errorMessage =
                    document.getElementById("product-message");
                  errorMessage.textContent = "Product added successfully!";
                  errorMessage.style.display = "block"; // Show the message
                  setTimeout(() => {
                    errorMessage.style.display = "none"; // Hide after 3 seconds
                  }, 3000);

                  // Reset form and redirect to products page
                  document.getElementById("productForm").reset();
                  window.location.href = `/products`;
                } catch (error) {
                  console.error(
                    "Error while sending data to the server:",
                    error
                  );
                }
              }
            });
          });

          formContainer.appendChild(submitFormButton);

          // formModal.appendChild(formModalContent);
          document.body.appendChild(formModal);
          formContainer.scrollIntoView({ behavior: "smooth" });
        });

        modalContent.appendChild(modalTitle);
        modalContent.appendChild(categorySelect);
        modalContent.appendChild(submitButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    });
});

function createFormGroup(
  labelText,
  inputType,
  defaultValue,
  name,
  validationRules = {}
) {
  const group = document.createElement("div");
  group.className = "mb-4";

  const label = document.createElement("label");
  label.textContent = labelText;
  label.className = "block font-semibold text-gray-700 mb-2";
  group.appendChild(label);

  let input;
  if (inputType === "textarea") {
    input = document.createElement("textarea");
    input.className = "w-full p-2 border border-gray-300 rounded";
    input.name = name;
    input.textContent = defaultValue || "";
  } else {
    input = document.createElement("input");
    input.type = inputType;
    input.className = "w-full p-2 border border-gray-300 rounded";
    input.name = name;
    input.value = defaultValue || "";
  }
  group.appendChild(input);

  // Add event listener for validation
  input.addEventListener("blur", () => validateField(input, validationRules));

  // Create error message element
  const errorMessage = document.createElement("p");
  errorMessage.className = "text-red-500 text-xs italic mt-1 hidden";
  group.appendChild(errorMessage);

  return group;
}

// Updated createImageInput function to accept default image URL
function createImageInput(labelText, name, imageUrl) {
  const group = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = labelText;
  group.appendChild(label);

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.name = name;
  input.className = "form-input w-full p-2 border border-gray-300 rounded";
  group.appendChild(input);

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (group.querySelector("img")) {
      group.querySelector("img").remove();
    }
    const preview = document.createElement("img");
    preview.src = URL.createObjectURL(file);
    preview.className =
      "mt-2 w-32 h-32 object-cover border border-gray-300 rounded";

    showCropper(preview.src, preview, input);

    group.appendChild(preview);
  });

  return group;
}

// Function to add additional image inputs with cropping for multiple images
function addAdditionalImages(container, maxImages) {
  let imageCounter = 0;
  for (let i = 0; i < maxImages; i++) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.name = `additionalImage_${i}`;
    input.className = "form-input w-full p-2 border border-gray-300 rounded";
    container.appendChild(input);

    input.addEventListener("change", (event) => {
      if (imageCounter >= maxImages) {
        alert(`You can only upload up to ${maxImages} images.`);
        return;
      }
      const file = event.target.files[0];
      const preview = document.createElement("img");
      preview.src = URL.createObjectURL(file);
      preview.className =
        "mt-2 w-32 h-32 object-cover border border-gray-300 rounded";
      container.appendChild(preview);
      showCropper(preview.src, preview, input);
      console.log(preview.src);

      imageCounter++;
    });
  }
}
function showCropper(src, previewElement, inputElement) {
  // Create a modal for cropping
  const cropModal = document.createElement("div");
  cropModal.id = "cropModal";
  cropModal.className =
    "fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50";

  const cropModalContent = document.createElement("div");
  cropModalContent.className =
    "bg-white w-1/2 max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg relative";

  const cropModalTitle = document.createElement("h2");
  cropModalTitle.className = "text-2xl font-semibold mb-4 text-gray-800";
  cropModalTitle.textContent = "Crop Image";

  // Close button
  const closeCropModalButton = document.createElement("span");
  closeCropModalButton.innerHTML = "&times;";
  closeCropModalButton.className =
    "absolute top-0 right-0 text-4xl cursor-pointer p-2";
  closeCropModalButton.addEventListener("click", () => {
    document.body.removeChild(cropModal);
  });

  // Append elements to modal
  cropModalContent.appendChild(cropModalTitle);
  cropModalContent.appendChild(closeCropModalButton);

  // Create container for Croppie
  const cropContainer = document.createElement("div");
  cropContainer.id = "cropContainer";
  cropModalContent.appendChild(cropContainer);

  // Create crop button
  const cropButton = document.createElement("button");
  cropButton.className = "bg-green-500 text-white px-4 py-2 rounded mt-4";
  cropButton.textContent = "Crop & Save";

  cropModalContent.appendChild(cropButton);
  cropModal.appendChild(cropModalContent);
  document.body.appendChild(cropModal);

  // Initialize Croppie with square viewport
  const croppieInstance = new Croppie(cropContainer, {
    viewport: { width: 200, height: 200, type: "square" },
    boundary: { width: 300, height: 300 },
    showZoomer: true,
  });
  croppieInstance.bind({ url: src });

  // Handle crop and save
  cropButton.addEventListener("click", () => {
    croppieInstance
      .result({ type: "base64", format: "jpeg" }) // Use "base64" format
      .then((croppedBase64) => {
        // Set the cropped image as the preview in Base64 format
        previewElement.src = croppedBase64;

        // Directly append the Base64 string to the input element's form data
        const base64String = croppedBase64; // The Base64 string

        // Update the inputElement to include Base64 string
        const dataTransfer = new DataTransfer();
        // Instead of creating a File, store the Base64 string in a custom attribute or FormData
        inputElement.dataset.base64 = base64String; // Store Base64 string in a data attribute

        // Close the modal
        document.body.removeChild(cropModal);
      });
  });
}

// Existing code...

// Inside the loop where you create the product card

// Function to open edit modal
function openEditModal(product, category) {
  // Create modal container
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center overflow-auto z-50 p-10";

  const modalContent = document.createElement("div");
  modalContent.className =
    "bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg relative";
  modalContent.style.margin = "auto";

  // Modal title
  const modalTitle = document.createElement("h2");
  modalTitle.className = "text-2xl font-semibold mb-4";
  modalTitle.textContent = "Edit Product";
  modalContent.appendChild(modalTitle);

  // Create form for editing product
  const form = document.createElement("form");
  form.className = "grid grid-cols-1 gap-4";
  form.method = "POST";
  form.enctype = "multipart/form-data";

  // Populate form fields with product details
  form.appendChild(
    createFormGroup("Product Name", "text", product.productName, "productName")
  );
  form.appendChild(
    createFormGroup(
      "Description",
      "textarea",
      product.productDescription,
      "productDescription"
    )
  );
  form.appendChild(
    createFormGroup(
      "Regular Price",
      "number",
      product.RegularPrice,
      "RegularPrice"
    )
  );
  form.appendChild(
    createFormGroup(
      "Listing Price",
      "number",
      product.ListingPrice,
      "ListingPrice"
    )
  );
  form.appendChild(createFormGroup("Stock", "number", product.Stock, "Stock"));
  form.appendChild(createFormGroup("Brand", "text", product.Brand, "Brand"));

  // Cover Image field with preview and removal functionality
  const coverImageGroup = createImageInput(
    "Cover Image",
    "coverImage",
    product.coverImage
  );
  form.appendChild(coverImageGroup);

  // Additional Images (up to 4) with preview and removal functionality
  const additionalImagesGroup = document.createElement("div");
  const additionalImagesLabel = document.createElement("label");
  additionalImagesLabel.textContent = "Additional Images:";
  additionalImagesGroup.appendChild(additionalImagesLabel);
  console.log(product.additionalImage);

  EditaddAdditionalImages(
    additionalImagesGroup,
    product.additionalImage || [],
    4
  );

  form.appendChild(additionalImagesGroup);

  // Add dynamic fields based on category attributes
  createDynamicFields(product, form);

  // Append form to modal content
  modalContent.appendChild(form);

  // Close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.className =
    "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 absolute top-4 right-4";
  closeButton.addEventListener("click", () => document.body.removeChild(modal));
  modalContent.appendChild(closeButton);

  // Submit button
  const submitButton = document.createElement("button");
  submitButton.textContent = "Save Changes";
  submitButton.className =
    "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-12";
  submitButton.type = "submit";

  submitButton.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!validateForm(form)) {
      return;
    }
   
  const formData = new FormData(form);

  // Send update request to server
  try {
    const response = await axios.patch(
      `/product/editProduct/${product._id}/${category}`,
      formData
    );

    Swal.fire({
      title: "Product Updated!",
      text: "The product was successfully updated.",
      imageUrl:
        "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWFvZGI5dDlmbWMyNmRyZHY1aXFncGFrdmdiYTE0ZWxoMGE5MW5lbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6Zt2YL3H8a7vPBio/giphy.gif",
      imageWidth: 200,
      imageHeight: 200,
      confirmButtonText: "OK",
      confirmButtonColor: "#4CAF50",
      backdrop: `rgba(0,0,0,0.4) left top no-repeat`
    }).then(() => {
      window.location.reload();
    });

    console.log("Product updated:", response.data);
    document.body.removeChild(modal);
  } catch (error) {
    console.error("Error updating product:", error);

    Swal.fire({
      title: "Error!",
      text: "There was an issue updating the product. Please try again.",
      icon: "error",
      confirmButtonText: "Retry",
      confirmButtonColor: "#d33",
      footer: '<a href="https://support.example.com">Need more help?</a>'
    });
  }
  });

  modalContent.appendChild(submitButton);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

// Function to create a generic form group with a label and input
function createFormGroup(labelText, inputType, defaultValue, name) {
  const group = document.createElement("div");
  group.className = "mb-4";

  const label = document.createElement("label");
  label.textContent = labelText;
  label.className = "block font-semibold text-gray-700 mb-2";
  group.appendChild(label);

  let input;
  if (inputType === "textarea") {
    input = document.createElement("textarea");
    input.className = "w-full p-2 border border-gray-300 rounded";
    input.name = name;
    input.textContent = defaultValue || "";
  } else {
    input = document.createElement("input");
    input.type = inputType;
    input.className = "w-full p-2 border border-gray-300 rounded";
    input.name = name;
    input.value = defaultValue || "";
  }
  group.appendChild(input);

  return group;
}

// Function to create an image input with preview and removal
function createImageInput(labelText, name, imageUrl) {
  const group = document.createElement("div");
  group.className = "mb-4";

  const label = document.createElement("label");
  label.textContent = labelText;
  label.className = "block font-semibold text-gray-700 mb-2";
  group.appendChild(label);

  const imagePreview = document.createElement("img");
  imagePreview.src = imageUrl;
  imagePreview.alt = labelText;
  imagePreview.className = "w-32 h-32 object-cover mb-2";
  group.appendChild(imagePreview);

  const input = document.createElement("input");
  input.type = "file";
  input.className = "w-full p-2 border border-gray-300 rounded";
  input.name = name;
  input.accept = "image/*";
  group.appendChild(input);

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.className = "text-red-500 ml-2";
  removeButton.type = "button";
  removeButton.addEventListener("click", () => {
    input.value = null;
    imagePreview.src = "";
  });
  group.appendChild(removeButton);

  return group;
}

// Function to add additional image inputs with preview and removal
function EditaddAdditionalImages(container, images, limit) {
  console.log("images array", images);

  images.forEach((imageUrl, index) => {
    if (index < limit) {
      container.appendChild(
        createImageInput(
          `Additional Image ${index + 1}`,
          `additionalImage${index + 1}`,
          imageUrl
        )
      );
    }
  });

  for (let i = images.length; i < limit; i++) {
    container.appendChild(
      createImageInput(
        `Additional Image ${i + 1}`,
        `additionalImage${i + 1}`,
        ""
      )
    );
  }
}

// Function to create dynamic fields based on product data
function createDynamicFields(product, formContainer) {
  const standardFields = [
    "productName",
    "productDescription",
    "RegularPrice",
    "ListingPrice",
    "Stock",
    "Brand",
    "coverImage",
    "_id",
    "additionalImage",
    "additionalImages",
    "__v",
    "isblocked",
  ];

  Object.keys(product).forEach((key) => {
    if (standardFields.includes(key)) return;

    const formGroup = document.createElement("div");
    formGroup.className = "form-group mb-4";

    const label = document.createElement("label");
    label.setAttribute("for", key);
    label.innerText = key.charAt(0).toUpperCase() + key.slice(1);
    formGroup.appendChild(label);

    let input;
    const value = product[key];

    if (value === "true" || value === "false" || value === "on") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.className = "form-checkbox h-4 w-5 m-1";
      input.checked = value === "true";
      input.addEventListener("change", () => {
        input.value = input.checked ? "true" : "false";
      });
      input.name = key;
    } else if (typeof value === "number") {
      input = document.createElement("input");
      input.type = "number";
      input.className = "form-input w-full p-2 border border-gray-300 rounded";
      input.name = key;
      input.value = value;
    } else if (typeof value === "string") {
      input = document.createElement("input");
      input.type = "text";
      input.className = "form-input w-full p-2 border border-gray-300 rounded";
      input.name = key;
      input.value = value;
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.className = "form-input w-full p-2 border border-gray-300 rounded";
      input.name = key;
      input.value = JSON.stringify(value);
    }

    formGroup.appendChild(input);
    formContainer.appendChild(formGroup);
  });
}

function validateForm(form) {
  let isValid = true;

  // Define regex patterns for standard fields
  const regexPatterns = {
    productName: /^[a-zA-Z0-9][a-zA-Z0-9 ]*$/,
    Brand: /^[a-zA-Z0-9][a-zA-Z0-9 ]*$/,
    RegularPrice: /^\d+(\.\d{1,2})?$/,
    ListingPrice: /^\d+(\.\d{1,2})?$/,
    // Stock: /^\d+$/,
  };

  // Loop through each input element in the form
  const inputs = form.querySelectorAll("input, textarea");

  inputs.forEach((input) => {
    // Clear any previous error message
    const error = input.nextElementSibling;
    if (error && error.classList.contains("error-message")) {
      error.remove();
    }

    // Skip validation for image fields (coverImage and additionalImages)
    if (
      input.name === "coverImage" || 
      input.name === "additionalImages1" ||
      input.name.startsWith("additionalImage")
    ) {
      return;
    }

    // General required field validation
    if (!input.value.trim()) {
      showError(input, `${input.name} is required.`);
      isValid = false;
      return;
    }

    // Specific validations using regex
    if (regexPatterns[input.name]) {
      const regex = regexPatterns[input.name];
      if (!regex.test(input.value.trim())) {
        showError(
          input,
          `${input.name} is invalid. Please enter a valid ${input.name}.`
        );
        isValid = false;
        return;
      }

      // Additional check for spaces-only input
      if (input.value.trim().length < 2) {
        showError(input, `${input.name} must be at least 2 characters long.`);
        isValid = false;
        return;
      }
    }

    // Price and stock validations
    if (
      (input.name === "RegularPrice" || input.name === "ListingPrice") &&
      (isNaN(input.value) || input.value <= 0)
    ) {
      showError(input, "Price should be a positive number.");
      isValid = false;
    } else if (
      input.name === "Stock" &&
      (isNaN(input.value) || input.value < 0)
    ) {
      showError(input, "Stock should be a non-negative number.");
      isValid = false;
    }
  });

  return isValid;
}


function showError(input, message) {
  // Check if an error message already exists
  if (
    !input.nextElementSibling ||
    !input.nextElementSibling.classList.contains("error-message")
  ) {
    // Create a new error message element
    const error = document.createElement("span");
    error.classList.add("error-message");
    error.innerText = message;
    error.style.color = "red";
    // Insert the error message after the input element
    input.parentNode.insertBefore(error, input.nextSibling);
  }
}