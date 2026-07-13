"use strict";

const fallbackProducts = [
  { id: 1, name: "Wireless Headphones", price: "2999.00", category: "Electronics", image_url: "headphones" },
  { id: 2, name: "Smart Watch", price: "4999.00", category: "Electronics", image_url: "watch" },
  { id: 3, name: "Running Shoes", price: "2499.00", category: "Fashion", image_url: "shoes" },
  { id: 4, name: "Backpack", price: "1499.00", category: "Accessories", image_url: "backpack" },
  { id: 5, name: "Desk Lamp", price: "999.00", category: "Home", image_url: "lamp" },
  { id: 6, name: "Bluetooth Speaker", price: "1999.00", category: "Electronics", image_url: "speaker" }
];

const iconMap = {
  headphones: "🎧",
  watch: "⌚",
  shoes: "👟",
  backpack: "🎒",
  lamp: "💡",
  speaker: "🔊"
};

let products = [];
let usingFallback = false;

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2
});

function productCard(product) {
  const price = Number(product.price);
  const icon = iconMap[product.image_url] || "🛍️";

  return `<article class="product-card">
    <div class="product-image" aria-hidden="true">${icon}</div>
    <h3>${escapeHtml(product.name)}</h3>
    <p class="product-meta">${escapeHtml(product.category)}</p>
    <div class="price">${currencyFormatter.format(price)}</div>
    <div class="rating" aria-label="Five star demo rating">★★★★★ <span>4.8</span></div>
    <button class="add-btn" type="button" data-product="${escapeHtml(product.name)}">Add to Cart</button>
  </article>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showPage(pageId, updateHash = true) {
  const target = document.getElementById(pageId) ? pageId : "home";

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active-page");
  });
  document.getElementById(target).classList.add("active-page");

  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === target);
  });

  if (updateHash) {
    history.replaceState(null, "", `#${target}`);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderFeatured() {
  const element = document.getElementById("featuredProducts");
  element.innerHTML = products.length
    ? products.slice(0, 6).map(productCard).join("")
    : '<div class="empty-state">No products available.</div>';
}

function renderProducts() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const sort = document.getElementById("sortFilter").value;

  const filtered = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search);
      const matchesCategory = category === "all" || product.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((first, second) => {
      if (sort === "low") return Number(first.price) - Number(second.price);
      if (sort === "high") return Number(second.price) - Number(first.price);
      return Number(first.id) - Number(second.id);
    });

  document.getElementById("allProducts").innerHTML = filtered.length
    ? filtered.map(productCard).join("")
    : '<div class="empty-state">No products matched your filters.</div>';
}

function updateApiStatus(connected) {
  const element = document.getElementById("apiStatus");
  element.className = `api-status ${connected ? "connected" : "disconnected"}`;
  element.textContent = connected
    ? "API connected - products loaded from PostgreSQL"
    : "API unavailable - showing the built-in fallback product list";
}

async function loadProducts() {
  document.getElementById("featuredProducts").innerHTML = '<div class="loading-card">Loading products from the backend API...</div>';
  document.getElementById("allProducts").innerHTML = '<div class="loading-card">Loading products from the backend API...</div>';

  try {
    const response = await fetch("/api/products", {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Products response was not an array");
    }

    products = data;
    usingFallback = false;
    updateApiStatus(true);
  } catch (error) {
    console.warn("Using fallback product data:", error);
    products = fallbackProducts;
    usingFallback = true;
    updateApiStatus(false);
  }

  renderFeatured();
  renderProducts();
}

function clearFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("categoryFilter").value = "all";
  document.getElementById("sortFilter").value = "default";
  renderProducts();
}

function showDemoMessage(elementId, message) {
  document.getElementById(elementId).textContent = message;
}

document.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    event.preventDefault();
    showPage(pageButton.dataset.page);
    return;
  }

  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    document.getElementById("categoryFilter").value = categoryButton.dataset.category;
    renderProducts();
    showPage("products");
    return;
  }

  const cartButton = event.target.closest("[data-product]");
  if (cartButton) {
    window.alert(`${cartButton.dataset.product} added to the demo cart.`);
  }
});

document.getElementById("searchInput").addEventListener("input", renderProducts);
document.getElementById("categoryFilter").addEventListener("change", renderProducts);
document.getElementById("sortFilter").addEventListener("change", renderProducts);
document.getElementById("clearFilters").addEventListener("click", clearFilters);

document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  showDemoMessage("loginMessage", "Demo UI submitted. Real authentication was outside the original Project 26 scope.");
});

document.getElementById("registerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const password = document.getElementById("registerPassword").value;
  const confirmation = document.getElementById("confirmPassword").value;

  if (password !== confirmation) {
    showDemoMessage("registerMessage", "Passwords do not match.");
    return;
  }

  showDemoMessage("registerMessage", "Demo registration UI submitted successfully.");
});

window.addEventListener("hashchange", () => {
  showPage(window.location.hash.slice(1) || "home", false);
});

showPage(window.location.hash.slice(1) || "home", false);
loadProducts();
