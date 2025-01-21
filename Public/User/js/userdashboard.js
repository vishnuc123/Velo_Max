const eventOrigin = new EventSource('/events');

eventOrigin.onmessage = function (event) {
  if (event.data === 'categoryStatus') {
    console.log('Category status updated. Refreshing cart items...');
    getCategory();
  }
};

async function getCategory() {
  try {
    const response = await axios.get("/dashboard/category-details");
    const { data } = response.data;

    console.log(data);

    const container = document.getElementById("cards-container");

    // Clear existing cards
    container.innerHTML = '';

    // Create a DocumentFragment to optimize DOM manipulation
    const fragment = document.createDocumentFragment();

    data.forEach(({ imageUrl, categoryTitle, categoryDescription }) => {
      // Create the card div element
      const card = document.createElement("div");
      card.classList.add("bg-white", "rounded-lg", "shadow-lg", "overflow-hidden");

      // Create the image element
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = categoryTitle; // Use category title as alt text
      img.classList.add("w-full", "h-40", "object-cover");

      // Create the content div element
      const content = document.createElement("div");
      content.classList.add("p-4");

      // Create the title (h2) element
      const title = document.createElement("h2");
      title.classList.add("text-lg", "font-semibold");
      title.textContent = categoryTitle;

      // Create the description (p) element
      const description = document.createElement("p");
      description.classList.add("text-gray-600");
      description.textContent = categoryDescription;

      // Append the title and description to the content div
      content.appendChild(title);
      content.appendChild(description);

      // Append the image and content to the card div
      card.appendChild(img);
      card.appendChild(content);

      // Append the card to the DocumentFragment
      fragment.appendChild(card);
    });

    // Append the fragment to the container
    container.appendChild(fragment);
  } catch (error) {
    console.error("Error while getting category details", error);
  }
}

// Initial fetch
getCategory();
