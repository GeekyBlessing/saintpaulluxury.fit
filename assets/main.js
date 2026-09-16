/* Saint Paul Luxury — shared behavior
   Cart is client-side only (localStorage). There is no payment backend here
   by design, checkout hands off a clean order summary to WhatsApp. This file
   is the seam where a real payment provider would plug in later: see
   checkout() at the bottom. */

const WHATSAPP_NUMBER = "2347046672338";
const CART_KEY = "spl_cart";

/* Payment integration point. No payment provider is connected yet, so this
   stays false and the checkout UI reflects that honestly (disabled "Pay now",
   WhatsApp offered as the working alternative). To go live: wire this to
   Paystack/Flutterwave/Stripe, set PAYMENT_PROVIDER_CONFIGURED to true, and
   implement processPayment() to actually call the provider and only resolve
   success on a real confirmed transaction. Nothing else in the checkout flow
   needs to change. */
const PAYMENT_PROVIDER_CONFIGURED = false;

async function processPayment(order) {
  if (!PAYMENT_PROVIDER_CONFIGURED) {
    throw new Error("No payment provider is configured yet.");
  }
  // Real integration goes here once a provider is connected. Must return
  // only on a genuine confirmed transaction, never assume success.
  throw new Error("processPayment() has not been implemented for a real provider yet.");
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(
    c => c.slug === item.slug && c.color === item.color && c.size === item.size
  );
  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  showToast(item.name + " added to your bag");
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  if (typeof renderCartPage === "function") renderCartPage();
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function cartTotal() {
  return getCart().reduce((sum, item) => sum + item.qty * item.price, 0);
}

function updateCartCount() {
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = cartCount();
  });
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

/* Checkout: builds a readable order summary and opens WhatsApp with it
   pre-filled. This is the integration seam, swap this function's body for
   a real payment redirect once a provider (Paystack, Flutterwave, etc.) is
   wired up. Nothing else in the site needs to change. */
function checkout() {
  const cart = getCart();
  if (cart.length === 0) return;
  let lines = ["Hi Saint Paul Luxury, I'd like to order:"];
  cart.forEach(item => {
    lines.push(`- ${item.name} (${item.color}, size ${item.size}) x${item.qty} - ${formatNaira(item.price * item.qty)}`);
  });
  lines.push(`Total: ${formatNaira(cartTotal())}`);
  lines.push("My delivery city:");
  const text = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
}

/* Used from checkout.html once a customer has filled in their details and
   delivery address. This is the real, working purchase path today, WhatsApp
   confirmation, while processPayment() above is not yet wired to a provider. */
function placeOrderViaWhatsApp(customer, delivery, cart) {
  let lines = ["Hi Saint Paul Luxury, I'd like to place an order.", ""];
  lines.push("Order:");
  cart.forEach(item => {
    const preorderNote = item.preorder ? " (preorder)" : "";
    lines.push(`- ${item.name}${preorderNote} (${item.color}, size ${item.size}) x${item.qty} - ${formatNaira(item.price * item.qty)}`);
  });
  lines.push(`Total: ${formatNaira(cartTotal())}`);
  lines.push("");
  lines.push("Customer details:");
  lines.push(`Name: ${customer.name}`);
  lines.push(`Phone: ${customer.phone}`);
  if (customer.email) lines.push(`Email: ${customer.email}`);
  lines.push("");
  lines.push("Delivery details:");
  lines.push(`Address: ${delivery.address}`);
  lines.push(`City: ${delivery.city}`);
  lines.push(`State: ${delivery.state}`);
  if (delivery.notes) lines.push(`Notes: ${delivery.notes}`);
  const text = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
}

/* ---------- shared page chrome ---------- */
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (typeof IntersectionObserver === "function") {
      const io = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealEls.forEach(el => io.observe(el));
    } else {
      // No IntersectionObserver support: reveal content immediately rather
      // than leaving it permanently hidden. Content over animation.
      revealEls.forEach(el => el.classList.add("is-visible"));
    }
  }
});
