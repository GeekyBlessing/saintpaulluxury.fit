/* Saint Paul Luxury — product data
   Single source of truth for shop grid, product pages, and cart.
   To add a product: add an object here. No other file needs to change. */

const PRODUCTS = [
  {
    slug: "legacy-sweatshirt",
    name: "The Legacy Sweatshirt",
    category: "Sweatshirts",
    price: 75000,
    preorder: false,
    description: "An oversized crewneck carrying the balloon boy graphic on the front and the Saint Paul Luxury wordmark on the back. Printed in small runs, never restocked to the letter.",
    fabric: "Heavyweight cotton fleece, garment washed for a broken in feel from the first wear.",
    fit: "Oversized. True to size, size down for a closer fit.",
    care: "Machine wash cold, inside out. Do not tumble dry. Do not iron directly on the print.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    unavailableSizes: [],
    variants: [
      {
        color: "Cocoa",
        images: [
          "assets/images/sweatshirt-cocoa-front.jpg",
          "assets/images/sweatshirt-cocoa-back.jpg"
        ]
      },
      {
        color: "Cream",
        images: [
          "assets/images/sweatshirt-cream-front.jpg",
          "assets/images/sweatshirt-cream-back.jpg"
        ]
      }
    ]
  },
  {
    slug: "spl-acid-wash-cap",
    name: "The SPL Acid Wash Cap",
    category: "Headwear",
    price: 35000,
    preorder: false,
    description: "A six panel cap in an acid washed sandstone cotton, with the SPL monogram embroidered on the crown and Saint Paul Luxury on the strap.",
    fabric: "Acid washed cotton twill, contrast brim and buckle.",
    fit: "One size. Adjustable strap at the back.",
    care: "Spot clean only. Do not machine wash.",
    sizes: ["One size"],
    unavailableSizes: [],
    variants: [
      {
        color: "Sandstone",
        images: [
          "assets/images/cap-front.jpg",
          "assets/images/cap-back.jpg"
        ]
      }
    ]
  },
  {
    slug: "legacy-cargo-shorts",
    name: "The Legacy Cargo Shorts",
    category: "Shorts",
    price: 60000,
    preorder: false,
    description: "Khaki cargo shorts with embroidered pocket details, built for warm days that still call for a considered outfit.",
    fabric: "Cotton twill.",
    fit: "Regular fit through the seat and thigh.",
    care: "Machine wash cold. Do not bleach.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    unavailableSizes: [],
    variants: [
      {
        color: "Khaki",
        images: [
          "assets/images/shorts.jpg"
        ]
      }
    ]
  }
];

function getProductBySlug(slug) {
  return PRODUCTS.find(p => p.slug === slug);
}

function formatNaira(amount) {
  return "\u20A6" + amount.toLocaleString("en-NG");
}
