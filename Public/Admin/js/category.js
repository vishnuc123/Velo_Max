document.addEventListener("DOMContentLoaded", async () => {
  // modal opening
  document.getElementById("openModal").onclick = function () {
    document.getElementById("modal").classList.remove("hidden");
  };

  // modal closing
  document.getElementById("closeMainModal").onclick = function () {
    document.getElementById("modal").classList.add("hidden");
  };

  let responsetracker = false;

  let cropper;
  let image_url;

  let input = document.getElementById("input");
  let image_show = document.getElementById("wrapper");
  let cropbutton = document.getElementById("crop-button");
  let cropmodal = document.getElementById("cropModal");
  let newWrap = document.getElementById("newwrap");
  let cropModalCloseButton = document.getElementById("closeModal");
  let cropImageSaveButton = document.getElementById("cropButton");
  let finalImage = document.getElementById("croppedImageDataURl");

  let croppedImageInput = document.createElement("input");
  croppedImageInput.type = "hidden";
  croppedImageInput.name = "croppedImageDataUrl"; // Consistent naming
  document.getElementById("categoryForm").appendChild(croppedImageInput);

  input.addEventListener("change", (event) => {
    if (event.target.files && event.target.files[0]) {
      cropbutton.classList.remove("hidden");

      let image_file = event.target.files[0];
      let reader = new FileReader();

      reader.readAsDataURL(image_file);
      reader.onload = (e) => {
        image_url = e.target.result;
        image_show.innerHTML = "";

        let image = document.createElement("img");
        image.src = image_url;
        image.style.width = "100px";
        image.style.height = "100px";
        image.classList.add(
          "categoryImage",
          "w-20",
          "h-20",
          "object-cover",
          "rounded-md"
        );
        image_show.appendChild(image);
      };
    }
  });

  cropbutton.addEventListener("click", (event) => {
    event.preventDefault();
    cropmodal.classList.remove("hidden");

    newWrap.innerHTML = "";

    let cropImage = document.createElement("img");
    cropImage.src = image_url;
    newWrap.appendChild(cropImage);

    cropper = new Croppie(cropImage, {
      viewport: { width: 300, height: 300, type: "square" },
      boundary: { width: 400, height: 400 },
      enableExif: true,
    });
  });

  cropImageSaveButton.addEventListener("click", (event) => {
    event.preventDefault();
    if (cropper) {
      cropper
        .result({
          type: "base64",
          size: { width: 300, height: 300 },
          format: "jpeg",
          quality: 1,
        })
        .then((result) => {
          let croppedImage = document.createElement("img");
          croppedImage.src = result;
          croppedImage.style.width = "100px";
          croppedImage.style.height = "100px";
          croppedImage.classList.add(
            "categoryImage",
            "w-20",
            "h-20",
            "object-cover",
            "rounded-md"
          );

          image_show.innerHTML = "";
          image_show.appendChild(croppedImage);

          croppedImageInput.value = result;
          cropmodal.classList.add("hidden");
        });
    }
  });

  cropModalCloseButton.addEventListener("click", (event) => {
    event.preventDefault();
    cropmodal.classList.add("hidden");
  });

  document
    .getElementById("categoryForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const categoryNameError = document.getElementById("categoryNameError");
      const categoryDescError = document.getElementById("categoryDescError");
      const categoryImageError = document.getElementById("categoryImageError");
      

      console.log(croppedImageInput.value);

      const categoryName = document.getElementById("categoryName").value;
      finalImage = croppedImageInput.value;
      const categoryDescription = document.getElementById(
        "categoryDescription"
      ).value;
      let hasError = false;

      // Regex for category name (letters, spaces, and must end with 's')
      const categoryRegex = /^[A-Za-z ]+s$/;
      
      // Regex for description (allow letters, numbers, spaces)
      const generalRegex = /^[A-Za-z0-9 ]+$/;
      
      // Validate Category Name
      if (categoryName.trim() === "") {
        categoryNameError.textContent = "Category Name is required";
        categoryNameError.classList.add(
          "text-red-600", "text-sm", "mt-1", "font-medium", "bg-red-100", "p-2", "rounded", "shadow-md", "animate-pulse"
        );
        hasError = true;
      } else if (!categoryRegex.test(categoryName.trim())) {
        categoryNameError.textContent = "Category Name can only contain letters, spaces, and must end with 's'.";
        categoryNameError.classList.add(
          "text-red-600", "text-sm", "mt-1", "font-medium", "bg-red-100", "p-2", "rounded", "shadow-md", "animate-pulse"
        );
        hasError = true;
      } else {
        categoryNameError.textContent = "";
      }
      
      // Validate Category Description
      if (categoryDescription.trim() === "") {
        categoryDescError.textContent = "Category Description is required";
        categoryDescError.classList.add(
          "text-red-600", "text-sm", "mt-1", "font-medium", "bg-red-100", "p-2", "rounded", "shadow-md", "animate-pulse"
        );
        hasError = true;
      } else if (!generalRegex.test(categoryDescription.trim())) {
        categoryDescError.textContent = "Category Description can only contain letters, numbers, and spaces.";
        categoryDescError.classList.add(
          "text-red-600", "text-sm", "mt-1", "font-medium", "bg-red-100", "p-2", "rounded", "shadow-md", "animate-pulse"
        );
        hasError = true;
      } else {
        categoryDescError.textContent = "";
      }
      
      // Validate Category Image (Assuming it's a URL, you might want to adjust the regex based on URL format)
      const urlRegex = /^[A-Za-z0-9-._~:/?#[\]@!$&'()*+,;=]+$/;
      
      if (finalImage.trim() === "") {
        categoryImageError.textContent = "Category Image is required";
        categoryImageError.classList.add(
          "text-red-600", "text-sm", "mt-1", "font-medium", "bg-red-100", "p-2", "rounded", "shadow-md", "animate-pulse"
        );
        hasError = true;
      } else if (!urlRegex.test(finalImage.trim())) {
        categoryImageError.textContent = "Category Image must be a valid URL or contain only valid characters.";
        categoryImageError.classList.add(
          "text-red-600", "text-sm", "mt-1", "font-medium", "bg-red-100", "p-2", "rounded", "shadow-md", "animate-pulse"
        );
        hasError = true;
      } else {
        categoryImageError.textContent = "";
      }
      
      if (hasError) return;
      
      
      const formData = new FormData(this);
      formData.append("categoryDescription", categoryDescription);
      formData.append("categoryImage", croppedImageInput.value);

      try {
        const response = await axios.post(
          "http://localhost:4000/category",
          formData
        );
        const data = response;
        console.log("sucess", data);


        Swal.fire({
          title: 'Category Added Successfully!',
          text: 'Your new category has been added successfully.',
          icon: 'success',
          confirmButtonText: 'Great!',
          confirmButtonColor: '#4CAF50',
          backdrop: `rgba(0,0,0,0.4)`
        });

        this.reset();
        
        image_show.innerHTML = "";
        croppedImageInput.value = "";
        document.getElementById("modal").classList.add("hidden");
      } catch (error) {
        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            "An error occurred while submitting the form.";
          console.log(`Error: ${errorMessage}`);
          console.error("Error response:", error.response.data);
        } else if (error.request) {
          console.log(
            "No response received from the server. Please try again later."
          );
          console.error("Error request:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
      }

      // await axios
      //   .post("http://localhost:4000/category", formData)
      //   .then((response) => {
      //     console.log("Success:", response.data);
      //     responsetracker = true;

      //     // creating dynamic card

      // Reset form
    });
});

// adding attributes

document
  .getElementById("addAttribute")
  .addEventListener("click", async function () {
    const attributesContainer = document.getElementById("attributesContainer");

    const attributeRow = document.createElement("div");
    attributeRow.classList.add("attribute-row", "flex", "items-center", "mb-2");

    const keyInput = document.createElement("input");
    keyInput.type = "text";
    keyInput.placeholder = "Key";
    keyInput.required = true;
    keyInput.classList.add(
      "border",
      "border-gray-300",
      "rounded-md",
      "p-2",
      "w-1/3",
      "mr-2"
    );
    keyInput.name = "attributeKey[]";

    const typeSelect = document.createElement("select");
    typeSelect.required = true;
    typeSelect.classList.add(
      "border",
      "border-gray-300",
      "rounded-md",
      "p-2",
      "mr-2"
    );
    typeSelect.name = "attributeType[]";

    const optionString = document.createElement("option");
    optionString.value = "string";
    optionString.text = "String";
    const optionNumber = document.createElement("option");
    optionNumber.value = "number";
    optionNumber.text = "Number";
    const optionBoolean = document.createElement("option");
    optionBoolean.value = "boolean";
    optionBoolean.text = "Boolean";

    typeSelect.appendChild(optionString);
    typeSelect.appendChild(optionNumber);
    typeSelect.appendChild(optionBoolean);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.classList.add(
      "remove-attribute",
      "bg-red-500",
      "text-white",
      "px-2",
      "rounded-md"
    );

    attributeRow.appendChild(keyInput);
    attributeRow.appendChild(typeSelect);
    attributeRow.appendChild(removeButton);

    attributesContainer.appendChild(attributeRow);

    removeButton.addEventListener("click", function () {
      attributeRow.remove();
    });
  });
  async function listcategory() {
    try {
      const res = await axios.get("http://localhost:4000/category-details");
      const data = res.data;
  
      for (let i = 0; i < data.data.length; i++) {
        const container = document.getElementById("category-list");
        const card = document.createElement("div");
        card.className = "max-w-md rounded overflow-hidden shadow-lg";
        container.appendChild(card);
  
        const image = document.createElement("img");
        image.className = "object-cover w-full h-50";
        image.src = data.data[i].imageUrl;
        card.appendChild(image);
  
        const cardContent = document.createElement("div");
        cardContent.className = "px-6 py-4";
  
        const title = document.createElement("div");
        title.className = "font-bold text-xl mb-2";
        title.textContent = data.data[i].categoryTitle;
        cardContent.appendChild(title);
  
        const description = document.createElement("p");
        description.className = "text-gray-700 text-base";
        description.textContent = data.data[i].categoryDescription;
        cardContent.appendChild(description);
  
        const toggleButton = document.createElement("button");
        toggleButton.className = "toggleButton px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg mt-2";
        toggleButton.textContent = data.data[i].isblocked ? "Unblock" : "Block";
        toggleButton.setAttribute("data-user-id", data.data[i]._id);
        cardContent.appendChild(toggleButton);
        
        const statusText = document.createElement("span");
        statusText.textContent = data.data[i].isblocked ? "Blocked" : "Active";
        statusText.className = data.data[i].isblocked ? "bg-red-500 animate-pulse" : "bg-green-500 animate-bounce";
        cardContent.appendChild(statusText);
        
        toggleButton.addEventListener("click", async (e) => {
          const buttonToggle = e.target.closest(".toggleButton");
        
          if (buttonToggle) {
            const categoryId = buttonToggle.getAttribute("data-user-id");
            buttonToggle.textContent = "Loading...";
            buttonToggle.disabled = true; // Prevent multiple clicks
        
            try {
              // Determine action based on the current status in `statusText`
              const isCurrentlyBlocked = statusText.textContent === "Blocked";
              const endpoint = isCurrentlyBlocked
                ? `http://localhost:4000/category-details/${categoryId}/unblock`
                : `http://localhost:4000/category-details/${categoryId}/block`;
        
              const response = await axios.patch(endpoint);
        
              // Ensure the response includes `categoryData` with `isblocked`
              if (response.data && response.data.categoryData && response.data.categoryData.isblocked !== undefined) {
                const isBlockedNow = response.data.categoryData.isblocked;
        
                // Update UI to reflect the server's actual status
                statusText.textContent = isBlockedNow ? "Blocked" : "Active";
                buttonToggle.textContent = isBlockedNow ? "Unblock" : "Block";
        
                // Update CSS classes for statusText based on blocked status
                if (isBlockedNow) {
                  statusText.classList.replace("bg-green-500", "bg-red-500");
                  statusText.classList.replace("animate-bounce", "animate-pulse");
                } else {
                  statusText.classList.replace("bg-red-500", "bg-green-500");
                  statusText.classList.replace("animate-pulse", "animate-bounce");
                }
        
                console.log(`User ${categoryId} is now ${isBlockedNow ? "blocked" : "active"}`);
              } else {
                throw new Error("Unexpected response format from server.");
              }
            } catch (error) {
              console.error("Error updating user status:", error);
              buttonToggle.textContent = "Error";
              // Reset UI after error with a 2-second delay
              setTimeout(() => {
                buttonToggle.textContent = statusText.textContent === "Active" ? "Block" : "Unblock";
              }, 3000);
            } finally {
              buttonToggle.disabled = false; // Re-enable button
            }
          }
        });
        
  
        card.appendChild(cardContent);
      }
    } catch (error) {
      console.log("Error while getting data in the function", error);
    }
  }
  
  listcategory();
  