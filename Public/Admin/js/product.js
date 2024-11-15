async function products() {
  try {
    const response = await axios.get(
      "http://localhost:4000/product/listProduct"
    );
    const data = response.data;

    console.log(data);
    const categorydetailsreponse = await axios.get(
      "http://localhost:4000/category-details"
    );
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
          "category-tag bg-blue-500 text-white py-2 px-4 rounded-lg mr-2 mb-4";
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
          <th class="p-4 text-left">Description</th>
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

          const nameCell = document.createElement("td");
          nameCell.className = "p-4 font-semibold";
          nameCell.textContent = product.productName;

          const descriptionCell = document.createElement("td");
          descriptionCell.className = "p-4 text-gray-600";
          descriptionCell.textContent = product.productDescription;
          tableRow.appendChild(descriptionCell);

          const priceCell = document.createElement("td");
          priceCell.className = "p-4 font-bold text-green-600";
          priceCell.textContent = `Price: $${product.ListingPrice}`;
          tableRow.appendChild(priceCell);

          const actionCell = document.createElement("td");
          actionCell.className = "p-4";

          const editButton = document.createElement("button");
          editButton.id = "productEditButton";
          editButton.className =
            "bg-blue-500 text-white py-2 px-4 rounded-lg mr-2";
          editButton.textContent = "Edit";
          actionCell.appendChild(editButton);

          editButton.addEventListener("click", () => {
            openEditModal(product, category);
          });

          // delete button
          const deleteButton = document.createElement("button");
          deleteButton.className = "bg-red-500 text-white py-2 px-4 rounded-lg";
          deleteButton.textContent = product.isblocked ? "Unblock" : "Block";
          actionCell.appendChild(deleteButton);

          deleteButton.addEventListener("click", async () => {
            
            if (product.isblocked==true) {
              // Unblock the product
              const response = await axios.patch(
                `http://localhost:4000/product/${category}/${product._id}/unblock`
              );
              const data = response.data;
              console.log(data);
              
              // Update button text and product state
              deleteButton.textContent = "Block";
              product.isblocked = false; // Toggle the blocked state
            } else {
              // Block the product
              const response = await axios.patch(
                `http://localhost:4000/product/${category}/${product._id}/block`
              );
              const data = response.data;
              console.log(data);
              
              // Update button text and product state
              deleteButton.textContent = "Unblock";
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
        if (document.getElementById("categoryModal")) return;

        const modal = document.createElement("div");
        modal.id = "categoryModal";
        modal.className =
          "absolute fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center";

        const modalContent = document.createElement("div");
        modalContent.className =
          "bg-white w-1/2 h-auto max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg";

        const modalTitle = document.createElement("h2");
        modalTitle.className = "text-2xl font-semibold mb-4 text-gray-800";
        modalTitle.textContent = "Select a Category";

        const categorySelect = document.createElement("select");
        categorySelect.className =
          "w-full p-3 border border-gray-300 rounded mb-4";

        const response = await axios.get(
          "http://localhost:4000/category-details"
        );
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
          "bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition duration-300";
        submitButton.textContent = "Submit";

        submitButton.addEventListener("click", async function () {
          selectedCategory = categorySelect.value;
          const response = await axios.get(
            `http://localhost:4000/products/${selectedCategory}`
          );
          const data = response.data.categoryAttributes;
          console.log(data);

          document.body.removeChild(modal);

          const form = document.createElement("form");
          form.id = "productForm";
          form.className = "grid grid-cols-1 gap-4";
          form.method = "POST";
          form.enctype = "multipart/form-data";

          const formModal = document.createElement("div");
          formModal.id = "formModal";
          formModal.className =
            "absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center overflow-auto mt-5";

          const formModalContent = document.createElement("div");
          formModalContent.className =
            "bg-white w-1/2 h-auto max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg relative mt-10";
          formModalContent.style.top = "50%";

          const closeFormModalButton = document.createElement("span");
          closeFormModalButton.innerHTML = "&times;";
          closeFormModalButton.className =
            "absolute top-0 right-0 text-6xl cursor-pointer bg-red-500 w-10";
          closeFormModalButton.addEventListener("click", function () {
            document.body.removeChild(formModal);
          });

          formModalContent.appendChild(closeFormModalButton);

          const formTitle = document.createElement("h2");
          formTitle.className = "text-2xl font-semibold mb-4 text-gray-800 ";
          formTitle.textContent = "Add New Product";
          formModalContent.appendChild(formTitle);

          const formContainer = document.createElement("div");
          formContainer.id = "formContainer";
          formContainer.className = "grid grid-cols-1 gap-4";
          formContainer.append(form);

          // Basic Product Form Fields
          form.appendChild(
            createFormGroup(
              "Product Name",
              "text",
              "Enter product name",
              "productName"
            )
          );
          form.appendChild(
            createFormGroup(
              "Description",
              "textarea",
              "Enter product description",
              "productDescription"
            )
          );
          form.appendChild(
            createFormGroup(
              "Regular Price",
              "number",
              "Enter product price",
              "productRegularPrice"
            )
          );
          form.appendChild(
            createFormGroup(
              "Listing Price",
              "number",
              "Enter product price",
              "productListingPrice"
            )
          );
          form.appendChild(
            createFormGroup(
              "Stock",
              "number",
              "Enter product stock",
              "productStock"
            )
          );
          form.appendChild(
            createFormGroup("Brand", "text", "Enter brand name", "productBrand")
          );

          // Cover Image
          const coverImageGroup = createImageInput(
            "Cover Image:",
            "coverImage"
          );
          form.appendChild(coverImageGroup);

          // Additional Images (up to 4)
          const additionalImagesGroup = document.createElement("div");
          const additionalImagesLabel = document.createElement("label");
          additionalImagesLabel.textContent = "Additional Images:";
          additionalImagesGroup.appendChild(additionalImagesLabel);
          addAdditionalImages(additionalImagesGroup, 4);
          form.appendChild(additionalImagesGroup);

          // Dynamic Fields based on Category Attributes
          data.forEach((item) => {
            const formGroup = document.createElement("div");
            formGroup.classList.add("form-group", "mb-4");

            // Create label
            const label = document.createElement("label");
            label.setAttribute("for", item.key);
            label.innerText = item.key;
            formGroup.appendChild(label);

            let input;

            // Check type and create the appropriate input field
            if (item.value === "string") {
              input = document.createElement("input");
              input.setAttribute("type", "text");
              input.setAttribute("name", item.key);
              input.setAttribute("placeholder", `Enter ${item.key}`);
              input.classList.add(
                "form-input",
                "w-full",
                "p-2",
                "border",
                "border-gray-300",
                "rounded"
              );
            } else if (item.value === "number") {
              input = document.createElement("input");
              input.setAttribute("type", "number");
              input.setAttribute("name", item.key);
              input.setAttribute("placeholder", `Enter ${item.key}`);
              input.classList.add(
                "form-input",
                "w-full",
                "p-2",
                "border",
                "border-gray-300",
                "rounded"
              );
            } else if (item.value === "boolean") {
              console.log(item);

              input = document.createElement("input");
              input.setAttribute("type", "checkbox");
              input.checked = Boolean(item.key);
              input.addEventListener("change", () => {
                input.value = input.checked ? "true" : "false";
              });
              input.setAttribute("name", item.key);
              input.classList.add("form-checkbox", "h-4", "w-5", "m-1");
            }

            if (input) {
              formGroup.appendChild(input);
            }

            // Append the form group to the form container
            form.appendChild(formGroup);
          });

          formModalContent.appendChild(formContainer);

          // Submit Button
          const submitFormButton = document.createElement("button");
          submitFormButton.className =
            "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 mt-4";
          submitFormButton.textContent = "Add Product";
          submitFormButton.type = "submit";

          const toast = document.createElement("div");
          toast.id = "toast";
          toast.className =
            "absolute top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-md shadow-md opacity-0 transition-opacity duration-300";
          toast.textContent = "Product added successfully!";
          document.body.appendChild(toast);

          function validateForm() {
            let isValid = true;
          
            // Loop through each input element in the form, including dynamic fields
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
          
              // Specific validations for standard fields
              if (input.name === "productName") {
                // Product Name: Allow spaces, letters, and numbers, but no symbols
                const regex = /^[a-zA-Z0-9 ]+$/;  // Only letters, numbers, and spaces allowed
                if (input.value.trim().length < 3) {
                  showError(input, "Product Name should be at least 3 characters long.");
                  isValid = false;
                } else if (!regex.test(input.value.trim())) {
                  showError(input, "Product Name can only contain letters, numbers, and spaces.");
                  isValid = false;
                }
              } else if (input.name === "Brand") {
                // Brand Name: Allow spaces, letters, and numbers, but no symbols
                const regex = /^[a-zA-Z0-9 ]+$/;  // Only letters, numbers, and spaces allowed
                if (input.value.trim().length < 2) {
                  showError(input, "Brand name should be at least 2 characters long.");
                  isValid = false;
                } else if (!regex.test(input.value.trim())) {
                  showError(input, "Brand name can only contain letters, numbers, and spaces.");
                  isValid = false;
                }
              } else if (
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
          
              // Validations for dynamic fields
              if (!standardFields.includes(input.name)) {
                // Additional validation logic for dynamic fields based on inferred types
                if (
                  typeof input.value === "number" &&
                  (isNaN(input.value) || input.value < 0)
                ) {
                  showError(input, `${input.name} should be a valid number.`);
                  isValid = false;
                } else if (
                  typeof input.value === "string" &&
                  input.value.trim().length < 2
                ) {
                  showError(
                    input,
                    `${input.name} should be at least 2 characters long.`
                  );
                  isValid = false;
                } else if (input.type === "checkbox") {
                  // Optional: add specific validations for checkboxes if needed
                  isValid = true;
                } else if (!/^[a-zA-Z0-9 ]*$/.test(input.value.trim())) {
                  // Disallow symbols in other dynamic fields (if applicable)
                  showError(input, `${input.name} can only contain letters, numbers, and spaces.`);
                  isValid = false;
                }
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
              confirmButtonText: "Yes, submit it!"
            }).then(async (result) => {
              if (result.isConfirmed) {
                try {
                  const formDetails = new FormData(document.getElementById("productForm"));
                  const response = await axios.post(
                    `http://localhost:4000/product/Addproduct/${selectedCategory}`,
                    formDetails
                  );
            
                  // Show success notification with updated button color
                  Swal.fire({
                    title: "Submitted!",
                    text: "Your product has been added successfully.",
                    icon: "success",
                    confirmButtonColor: "#28a745" // New color for success button
                  });
                  // Optionally show toast message here
                  const errorMessage = document.getElementById("product-message");
                  errorMessage.textContent = "Product added successfully!";
                  errorMessage.style.display = "block"; // Show the message
                  setTimeout(() => {
                    errorMessage.style.display = "none"; // Hide after 3 seconds
                  }, 3000);
          
                  // Reset form and redirect to products page
                  document.getElementById("productForm").reset();
                  window.location.href = `/products`;
                } catch (error) {
                  console.error("Error while sending data to the server:", error);
                }
              }
            });
          });

          formModalContent.appendChild(submitFormButton);

          formModal.appendChild(formModalContent);
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
    "fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center";

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
    "absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center overflow-auto mt-5";

  const modalContent = document.createElement("div");
  modalContent.className =
    "bg-white w-1/2 h-auto max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg relative mt-10";
  modalContent.style.top = "60%";

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

  // Cover Image field
  const coverImageGroup = createImageInput(
    "Cover Image",
    "coverImage",
    product.coverImage
  );
  form.appendChild(coverImageGroup);

  // Additional Images (up to 4)
  const additionalImagesGroup = document.createElement("div");
  const additionalImagesLabel = document.createElement("label");
  additionalImagesLabel.textContent = "Additional Images:";
  additionalImagesGroup.appendChild(additionalImagesLabel);
  addAdditionalImages(additionalImagesGroup, 4);
  form.appendChild(additionalImagesGroup);

  // Add dynamic fields based on category attributes
  createDynamicFields(product, form); // Pass dynamic attributes to function

  // Append form to modal content
  modalContent.appendChild(form);

  // Close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.className =
    "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600";
  closeButton.addEventListener("click", () => document.body.removeChild(modal));
  modalContent.appendChild(closeButton);

  // Submit button
  const submitButton = document.createElement("button");
  submitButton.textContent = "Save Changes";
  submitButton.className =
    "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-4";
  submitButton.type = "submit";
  function validateForm() {
    let isValid = true;
  
    // Loop through each input element in the form, including dynamic fields
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
  
      // Specific validations for standard fields
      if (input.name === "productName") {
        // Product Name: Allow spaces, letters, and numbers, but no symbols
        const regex = /^[a-zA-Z0-9 ]+$/;
        if (input.value.trim().length < 3) {
          showError(input, "Product Name should be at least 3 characters long.");
          isValid = false;
        } else if (!regex.test(input.value.trim())) {
          showError(input, "Product Name can only contain letters, numbers, and spaces.");
          isValid = false;
        }
      } else if (input.name === "Brand") {
        // Brand Name: Allow spaces, letters, and numbers, but no symbols
        const regex = /^[a-zA-Z0-9 ]+$/;
        if (input.value.trim().length < 2) {
          showError(input, "Brand name should be at least 2 characters long.");
          isValid = false;
        } else if (!regex.test(input.value.trim())) {
          showError(input, "Brand name can only contain letters, numbers, and spaces.");
          isValid = false;
        }
      } else if (
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
  
      // Validations for dynamic fields
      if (!standardFields.includes(input.name)) {
        // Additional validation logic for dynamic fields based on inferred types
        if (
          typeof input.value === "number" &&
          (isNaN(input.value) || input.value < 0)
        ) {
          showError(input, `${input.name} should be a valid number.`);
          isValid = false;
        } else if (
          typeof input.value === "string" &&
          input.value.trim().length < 2
        ) {
          showError(
            input,
            `${input.name} should be at least 2 characters long.`
          );
          isValid = false;
        } else if (input.type === "checkbox") {
          // Optional: add specific validations for checkboxes if needed
          isValid = true;
        }
      }
    });
  
    return isValid;
  }
  

  // Helper function to show error message for a field
  function showError(input, message) {
    const error = document.createElement("span");
    error.className = "error-message text-red-500 text-sm mt-1";
    error.textContent = message;
    input.parentElement.appendChild(error);
  }

  submitButton.addEventListener("click", async (event) => {
    event.preventDefault();

    // Validate form fields before submission
    if (!validateForm()) {
      return; // Stop submission if form is invalid
    }

    const formData = new FormData(form);

    // Send update request to server
    try {
      const response = await axios.patch(
        `http://localhost:4000/product/editProduct/${product._id}/${category}`,
        formData
      );
    
      Swal.fire({
  title: 'Product Updated!',
  text: 'The product was successfully updated.',
  imageUrl: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWFvZGI5dDlmbWMyNmRyZHY1aXFncGFrdmdiYTE0ZWxoMGE5MW5lbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6Zt2YL3H8a7vPBio/giphy.gif',
  imageWidth: 200, // adjust width as needed
  imageHeight: 200, // adjust height as needed
  confirmButtonText: 'OK',
  confirmButtonColor: '#4CAF50',
  backdrop: `
    rgba(0,0,0,0.4)
    left top
    no-repeat
  `
});

    
      console.log("Product updated:", response.data);
      document.body.removeChild(modal);
      
      // Optionally, reload products to reflect changes
      // products();
    } catch (error) {
      console.error("Error updating product:", error);
    
      // Show error alert with SweetAlert2
      Swal.fire({
        title: 'Error!',
        text: 'There was an issue updating the product. Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
        confirmButtonColor: '#d33',
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
// Define standard fields to exclude from dynamic creation

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
  "__v",
];
// Function to create dynamic fields based on product data
function createDynamicFields(product, formContainer) {
  console.log(product);

  Object.keys(product).forEach((key) => {
    // Skip standard fields
    if (standardFields.includes(key)) return;

    // Create a form group container
    const formGroup = document.createElement("div");
    formGroup.className = "form-group mb-4";

    // Create and append label
    const label = document.createElement("label");
    label.setAttribute("for", key);
    label.innerText = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize the label text
    formGroup.appendChild(label);

    // Initialize input element based on the type of the value
    let input;
    const value = product[key];

    if (value === "true" || value === "false" || value === "on") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.className = "form-checkbox h-4 w-5 m-1";
      input.checked = value;
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
      // Fallback for unsupported types (e.g., arrays, objects)
      input = document.createElement("input");
      input.type = "text";
      input.className = "form-input w-full p-2 border border-gray-300 rounded";
      input.name = key;
      input.value = JSON.stringify(value); // Convert complex types to string for display
    }

    // Append input to form group
    formGroup.appendChild(input);

    // Append the form group to the form container
    formContainer.appendChild(formGroup);
  });
}
