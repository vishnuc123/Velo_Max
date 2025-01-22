document.addEventListener("DOMContentLoaded", () => {
    const openModalBtn = document.getElementById("openModalBtn");
    const offerForm = document.getElementById("offerForm");
    const cancelButton = document.getElementById("cancelButton");
    const offerType = document.getElementById("offer-type");
    const categorySelect = document.getElementById("category-select");
    const productSearch = document.getElementById("product-search");
    const productSearchInput = document.getElementById("product-search-input");
    const productSearchResults = document.getElementById("product-search-results");
    const discountTypeSelect = document.getElementById("discount-type");
    const discountValueInput = document.getElementById("discount-value");
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const errorMessages = {
        offerName: document.getElementById("offer-name-error"),
        offerType: document.getElementById("offer-type-error"),
        categorySelect: document.getElementById("category-error"),
        productSearchInput: document.getElementById("product-error"),
        discountType: document.getElementById("discount-type-error"),
        discountValueInput: document.getElementById("discount-value-error"),
        startDateInput: document.getElementById("start-date-error"),
        endDateInput: document.getElementById("end-date-error")
    };

    openModalBtn.addEventListener("click", () => toggleModal(true));
    cancelButton.addEventListener("click", () => toggleModal(false));

    offerType.addEventListener("change", handleOfferTypeChange);
    productSearchInput.addEventListener("input", handleProductSearch);
    discountValueInput.addEventListener("input", validateDiscountValue);
    startDateInput.addEventListener("change", validateDates);
    endDateInput.addEventListener("change", validateDates);
    offerForm.addEventListener("submit", handleFormSubmit);

    loadCategories();

    function toggleModal(isOpen) {
        if (isOpen) {
            offerForm.classList.remove("hidden", "scale-95", "opacity-0");
            offerForm.classList.add("scale-100", "opacity-100");
        } else {
            offerForm.classList.add("scale-95", "opacity-0");
            setTimeout(() => offerForm.classList.add("hidden"), 300);
        }
    }

    function handleOfferTypeChange(e) {
        const isCategory = e.target.value === "category";
        const isProduct = e.target.value === "product";

        categorySelect.classList.toggle("hidden", !isCategory);
        productSearch.classList.toggle("hidden", !isProduct);

        clearError("offerType");
    }

    async function handleProductSearch(e) {
        const searchTerm = e.target.value.trim();
        if (searchTerm.length > 2) {
            try {
                const response = await axios.get(`/searchproducts?q=${searchTerm}`);
                displaySearchResults(response.data.searchResults);
            } catch (error) {
                console.error("Error fetching product search results:", error);
                productSearchResults.classList.add("hidden");
            }
        } else {
            productSearchResults.classList.add("hidden");
        }
        clearError("productSearchInput");
    }

    function displaySearchResults(results) {
        productSearchResults.innerHTML = "";

        Object.keys(results).forEach(collectionName => {
            results[collectionName].forEach(product => {
                const div = document.createElement("div");
                div.className = "p-2 hover:bg-gray-100 cursor-pointer";
                div.textContent = product.productName;
                div.addEventListener("click", () => selectProduct(product));
                productSearchResults.appendChild(div);
            });
        });

        productSearchResults.classList.remove("hidden");
    }

    function selectProduct(product) {
        productSearchInput.value = product.productName;
        productSearchResults.classList.add("hidden");
        clearError("productSearchInput");
    }

    async function loadCategories() {
        try {
            const response = await axios.get("/category-details");
            populateCategories(response.data.data);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    }

    function populateCategories(categories) {
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category._id;
            option.textContent = category.categoryTitle;
            categorySelect.appendChild(option);
        });
    }

    function validateDiscountValue() {
        const discountType = discountTypeSelect.value;
        let value = discountValueInput.value;
        let errorMessage = "";

        if (discountType === "fixed") {
            errorMessage = /^\d+(\.\d{1,2})?$/.test(value) ? "" : "Please enter a valid positive number.";
        } else if (discountType === "percentage") {
            errorMessage = /^100$|^\d{1,2}$/.test(value) ? "" : "Please enter a number between 0 and 100.";
        }

        setError("discountValueInput", errorMessage);
    }

    function validateDates() {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startError = startDate < today ? "Start date must be today or in the future." : "";
        const endError = endDate <= startDate ? "End date must be after the start date." : "";

        setError("startDateInput", startError);
        setError("endDateInput", endError);
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        let isValid = true;

        if (!offerType.value) {
            setError("offerType", "Please select an offer type.");
            isValid = false;
        } else {
            clearError("offerType");
        }

        if (offerType.value === "category" && !categorySelect.value) {
            setError("categorySelect", "Please select a category.");
            isValid = false;
        } else {
            clearError("categorySelect");
        }

        if (offerType.value === "product" && !productSearchInput.value.trim()) {
            setError("productSearchInput", "Please select a product.");
            isValid = false;
        } else {
            clearError("productSearchInput");
        }

        if (!discountValueInput.value.trim()) {
            setError("discountValueInput", "Please enter a discount value.");
            isValid = false;
        }

        if (!startDateInput.value.trim()) {
            setError("startDateInput", "Please select a start date.");
            isValid = false;
        }

        if (!endDateInput.value.trim()) {
            setError("endDateInput", "Please select an end date.");
            isValid = false;
        }

        if (isValid) {
            console.log("Form is valid, proceeding with submission...");
            // Add submission logic here
        }
    }

    function setError(field, message) {
        if (errorMessages[field]) {
            errorMessages[field].innerHTML = message;
            errorMessages[field].classList.remove("hidden");
        }
    }
    

    function clearError(field) {
        errorMessages[field].textContent = "";
        errorMessages[field].classList.add("hidden");
    }
});
