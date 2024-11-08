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


      let hasError = false

      if (categoryName.trim() === "") {
        categoryNameError.textContent = "Category Name is required";
        categoryNameError.classList.add(
          "text-red-600",         // Red color for visibility
          "text-sm",              // Smaller font size
          "mt-1",                 // Spacing above the error message
          "font-medium",          // Bold text for emphasis
          "bg-red-100",           // Light red background for contrast
          "p-2",                  // Padding around the text
          "rounded",              // Rounded corners
          "shadow-md",            // Slight shadow to pop the message
          "animate-pulse"         // Pulse animation to draw attention
        );
        hasError = true
      }else{
        categoryNameError.textContent = "";
      }
      
      if (categoryDescription.trim() === "") {
        categoryDescError.textContent = "Category Description is required";
        categoryDescError.classList.add(
          "text-red-600",
          "text-sm",
          "mt-1",
          "font-medium",
          "bg-red-100",
          "p-2",
          "rounded",
          "shadow-md",
          "animate-pulse"
        );
        hasError = true
      }else{
        categoryDescError.textContent = ""
      }
      
      if (finalImage.trim() === "") {
        categoryImageError.textContent = "Category Image is required";
        categoryImageError.classList.add(
          "text-red-600",
          "text-sm",
          "mt-1",
          "font-medium",
          "bg-red-100",
          "p-2",
          "rounded",
          "shadow-md",
          "animate-pulse"
        );
        hasError = true
      }else{
        categoryImageError.textContent = ""
      }
      if(hasError)return
      
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

        this.reset();
        image_show.innerHTML = "";
        croppedImageInput.value = "";
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

// showing category functionsss

async function listcategory() {
  try {
    const res = await axios.get("http://localhost:4000/category-details");
    const data = res.data;
    console.log(data);
    for (let i = 0; i < data.data.length; i++) {
      console.log(i);

      const container = document.getElementById("category-list");
      const card = document.createElement("div");
      card.className = "max-w-md rounded overflow-hidden shadow-lg";
      container.appendChild(card);

      // Image element
      const image = document.createElement("img");
      image.className = "object-cover w-full h-50";
      image.src = data.data[i].imageUrl;
      card.appendChild(image);

      // Card content container
      const cardContent = document.createElement("div");
      cardContent.className = "px-6 py-4";

      // Title element
      const title = document.createElement("div");
      title.className = "font-bold text-xl mb-2";
      title.textContent = data.data[i].categoryTitle;
      title.innerHTML = data.data[i].categoryTitle;
      cardContent.appendChild(title);

      // Description element
      const description = document.createElement("p");
      description.className = "text-gray-700 text-base";
      description.textContent = data.data[i].categoryDescription;
      cardContent.appendChild(description);


      const status = document.createElement('button')
      
      

      card.appendChild(cardContent);
    }
  } catch (error) {
    console.log("error while getting data in the function", error);
  }
}

listcategory();
