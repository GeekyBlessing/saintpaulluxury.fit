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

/* ---------- Launch offers (delivery + gift) ----------
   Single source of truth for the two current launch offers, so the
   product page, shop page, cart, and WhatsApp messages never drift from
   each other or overstate what's actually on the table.

   Free delivery is real but conditional (Lagos + WhatsApp order only) —
   every surface that mentions it must carry that condition, never just
   the headline. The gift is real but deliberately unspecified: the
   business owner hasn't confirmed what it is yet, so nothing here names
   an item. */
const OFFERS = {
  delivery: {
    headline: "Lagos, we've got your delivery.",
    body: "Your Legacy Sweatshirt, delivered free within Lagos when you order through WhatsApp. Pick your colour, send us a message, and let us handle the rest.",
    badge: "Lagos WhatsApp Orders · Free Delivery",
    disclosure: "Free delivery applies to Lagos addresses ordered through WhatsApp only. Orders outside Lagos, or placed another way, may carry a delivery cost we'll confirm with you directly."
  },
  gift: {
    headline: "Every order deserves a little extra.",
    body: "Your piece of the Legacy comes with a little something extra. Enjoy a complimentary surprise with every order, thoughtfully included by Saint Paul Luxury.",
    badge: "A Little Extra, On Us ✦"
  }
};

/* Loose, forgiving check, not a strict address validator: good enough to
   decide whether a typed city qualifies for the Lagos delivery offer. */
function isLagosCity(city) {
  return !!city && city.trim().toLowerCase().includes("lagos");
}

/* One line about the gift, safe to drop into any WhatsApp message or page
   copy without ever inventing what the gift actually is. */
function giftMessageLine() {
  return "A complimentary gift is included with every order.";
}

/* One line about delivery, worded to match what's actually known at the
   point the message is built:
   - no city yet (product-page enquiry, cart quick-checkout): conditional.
   - a city is known and it's Lagos: asserted.
   - a city is known and it isn't Lagos: the offer doesn't apply, said
     plainly rather than left implied. */
function deliveryMessageLine(city) {
  if (city == null) {
    return "Free delivery applies if this order is for delivery within Lagos, confirmed with you directly over WhatsApp.";
  }
  if (isLagosCity(city)) {
    return "Your delivery is within Lagos, so it's free on this WhatsApp order.";
  }
  return `Free delivery applies to Lagos addresses only, so delivery to ${city} isn't included — we'll confirm that cost with you directly.`;
}

/* Compact two-up card pairing used on the product page and shop page:
   badge + one-line copy for each offer, no headline, for places that
   already have a headline doing the work nearby. */
function offerChipsHtml() {
  return `
    <div class="offer-duo">
      <div class="offer-chip delivery">
        <span class="offer-badge">${OFFERS.delivery.badge}</span>
        <p>Free delivery within Lagos on WhatsApp orders.</p>
      </div>
      <div class="offer-chip gift">
        <span class="offer-badge">${OFFERS.gift.badge}</span>
        <p>${OFFERS.gift.body}</p>
      </div>
    </div>`;
}
