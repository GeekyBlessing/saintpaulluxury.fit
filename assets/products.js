/* Saint Paul Luxury — product data
   Single source of truth for shop grid, product pages, and cart.
   To add a product: add an object here. No other file needs to change. */

const PRODUCTS = [
  {
    slug: "legacy-sweatshirt",
    name: "The Legacy Sweatshirt",
    category: "Sweatshirts",
    price: 70000,
    compareAtPrice: 100000,
    preorder: false,
    tagline: "Made for your own lane. Designed to stand out.",
    description: "An oversized crewneck carrying the Saint Paul Luxury wordmark above the balloon boy graphic. Printed in small runs, never restocked to the letter.",
    fabric: "Heavyweight cotton fleece, garment washed for a broken in feel from the first wear.",
    fit: "Oversized. True to size, size down for a closer fit.",
    care: "Machine wash cold, inside out. Do not tumble dry. Do not iron directly on the print.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    unavailableSizes: [],
    /* Only a front shot exists for each of these three colourways (no
       back-of-garment shot yet) — single-image galleries render fine, add
       a second path to any variant's images array once a back photo
       exists, nothing else needs to change. */
    variants: [
      {
        color: "Black",
        images: [
          "assets/images/sweatshirt-black-front.jpg"
        ]
      },
      {
        color: "Olive",
        images: [
          "assets/images/sweatshirt-olive-front.jpg"
        ]
      },
      {
        color: "Cream",
        images: [
          "assets/images/sweatshirt-cream-front.jpg"
        ]
      },
      {
        color: "Slate Blue",
        images: [
          "assets/images/sweatshirt-slate-front.jpg"
        ]
      }
    ]
  }
  /* The SPL Acid Wash Cap and The Legacy Cargo Shorts have been removed:
     the client confirmed the sweatshirt (Black, Olive, Cream) is the only
     collection currently available. Their data is still in git history if
     the client rejoins the catalogue with them later. */
];

function getProductBySlug(slug) {
  return PRODUCTS.find(p => p.slug === slug);
}

function formatNaira(amount) {
  return "₦" + amount.toLocaleString("en-NG");
}

function discountPercent(product) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
  return Math.round((1 - product.price / product.compareAtPrice) * 100);
}

/* Shared price markup used on the shop grid, homepage, and product page,
   so the strike-through/sale/discount-badge treatment stays identical
   everywhere a price is shown. */
function priceHtml(product, size) {
  size = size || "md";
  /* data-ngn carries the real, authoritative NGN price. assets/currency.js
     reads it to append a converted estimate for visitors outside Nigeria,
     entirely independently of this function, products.js doesn't need to
     know currency.js exists, and the NGN price still renders correctly if
     currency.js fails to load or its APIs are unreachable. */
  const pct = discountPercent(product);
  if (!pct) {
    return `<p class="price${size === "lg" ? " pdp-price" : ""}" data-ngn="${product.price}">${formatNaira(product.price)}</p>`;
  }
  return `
    <p class="price-row${size === "lg" ? " pdp-price" : ""}" data-ngn="${product.price}">
      <span class="price-sale">${formatNaira(product.price)}</span>
      <span class="price-compare">${formatNaira(product.compareAtPrice)}</span>
      <span class="discount-badge">${pct}% off</span>
    </p>`;
}

/* Shared card-info markup (category/colour, name, one-line tagline, price,
   "Get Yours" affordance) used by the homepage, shop grid, and product
   page's related grid, so card copy and price formatting stay identical
   everywhere a product is listed. The whole card is already an <a>, so
   the CTA here is a styled span, not a nested link. */
function cardInfoHtml(product, variant) {
  return `
    <p class="cat">${product.category} / ${variant.color}</p>
    <h3>${product.name}</h3>
    ${product.tagline ? `<p class="card-tagline">${product.tagline}</p>` : ""}
    ${priceHtml(product)}
    <span class="card-cta">Get Yours</span>`;
}
