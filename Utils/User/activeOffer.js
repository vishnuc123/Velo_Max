export const normalizeCategoryTitle = (title) => title.trim().toLowerCase().replace(/\s+/g, "_");


export const applyDiscounts = (product, title, activeOffers) => {


  let finalPrice = product.ListingPrice;
  let discountedAmount = 0;

  let productOfferDetails = null;
  let categoryOfferDetails = null;

  const normalizedTitle = normalizeCategoryTitle(title);

  const productOffer = activeOffers.find(
    (offer) =>
      offer.offerType === "product" &&
      offer.productId?.toString() === product._id.toString()
  );

  const categoryOffer = activeOffers.find(
    (offer) =>
      offer.offerType === "category" &&
      normalizeCategoryTitle(offer.category) === normalizedTitle
  );

  if (productOffer) {
    discountedAmount =
      productOffer.discountType === "percentage"
        ? (finalPrice * productOffer.discountValue) / 100
        : productOffer.discountValue;

    finalPrice -= discountedAmount;
    productOfferDetails = productOffer;
  }

  if (!productOffer && categoryOffer) {
    discountedAmount =
      categoryOffer.discountType === "percentage"
        ? (finalPrice * categoryOffer.discountValue) / 100
        : categoryOffer.discountValue;

    finalPrice -= discountedAmount;
    categoryOfferDetails = categoryOffer;
  }

  finalPrice = Math.max(finalPrice, 0);

  return {
    ...product,
    category: title,
    discountedPrice: finalPrice,
    discountedAmount,
    discountPercentage: (discountedAmount / product.ListingPrice) * 100 || 0,
    productOffer: productOfferDetails,
    categoryOffer: categoryOfferDetails,
  };
};

export default applyDiscounts;