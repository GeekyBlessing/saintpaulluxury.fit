/* Saint Paul Luxury — shared behavior
   Cart is client-side only (localStorage). There is no payment backend here
   by design, checkout hands off a clean order summary to WhatsApp. This file
   is the seam where a real payment provider would plug in later: see
   checkout() at the bottom. */

const WHATSAPP_NUMBER = "2347046672338";
const CART_KEY = "spl_cart";

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
  }
});
