// API URLs
const PRODUCT_API = "https://srijon23.github.io/API/product.json";
const REVIEW_API = "https://srijon23.github.io/API/Review.json";

const slidesContainer = document.getElementById("product-slides");
const cart = [];

const updateSummary = () => {
  const count = cart.length;
  const price = cart.reduce((sum, p) => sum + p.price, 0);

  document.getElementById("product-count").innerText = count;
  document.getElementById("product-price").innerText = price.toFixed(2);

  const delivery = price * 0.02;
  const tax = price * 0.25;
  const shipping = price * 0.01;
  const total = price + delivery + tax + shipping;

  document.getElementById("delivery-charge").innerText = delivery.toFixed(2);
  document.getElementById("tax").innerText = tax.toFixed(2);
  document.getElementById("shipping").innerText = shipping.toFixed(2);
  document.getElementById("total").innerText = total.toFixed(2);
};

const createSlide = (products) => {
  const slide = document.createElement("div");
  slide.className = "flex space-x-6 overflow-hidden group relative";
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className =
      "product-card w-1/3 p-4 bg-white rounded-xl shadow-md flex flex-col space-y-2";

    card.innerHTML = `
      <img src="${product.image}" alt="${
      product.name
    }" class="w-full h-40 object-cover rounded-md">
      <h3 class="text-lg font-bold">${product.name}</h3>
      <p class="text-sm text-gray-500">${product.brand}</p>
      <p class="text-gray-600 text-sm">${product.description}</p>
      <p class="text-purple-600 font-semibold">$${product.price.toFixed(2)}</p>
      <p class="text-yellow-500">Rating: ${product.rating}⭐</p>
      <div class="flex space-x-2">
        <button class="add-to-cart px-2 py-1 bg-green-500 text-white rounded" data-price="${
          product.price
        }">Add</button>
        <button class="remove-from-cart px-2 py-1 bg-red-500 text-white rounded" data-price="${
          product.price
        }">Remove</button>
        <button class="view-review px-2 py-1 bg-blue-500 text-white rounded" data-name="${
          product.name
        }">Review</button>
      </div>
      <div class="reviews space-y-1 mt-2 hidden"></div>
    `;
    slide.appendChild(card);
  });
  return slide;
};

const loadProducts = async () => {
  const res = await fetch(PRODUCT_API);
  const data = await res.json();
  const slides = [];
  for (let i = 0; i < data.products.length; i += 3) {
    const chunk = data.products.slice(i, i + 3);
    const slide = createSlide(chunk);
    slides.push(slide);
  }
  slides.forEach((s) => slidesContainer.appendChild(s));
};

const handleEvents = async () => {
  slidesContainer.addEventListener("click", async (e) => {
    if (e.target.classList.contains("add-to-cart")) {
      const card = e.target.closest(".product-card");
      const product = {
        id: card.querySelector(".view-review").dataset.name,
        name: card.querySelector("h3").innerText,
        price: parseFloat(e.target.dataset.price),
      };
      cart.push(product);
      updateSummary();
    } else if (e.target.classList.contains("remove-from-cart")) {
      const card = e.target.closest(".product-card");
      const id = card.querySelector(".view-review").dataset.name;

      const idx = cart.findIndex((p) => p.id === id);
      if (idx !== -1) {
        cart.splice(idx, 1);
        updateSummary();
      }
    } else if (e.target.classList.contains("view-review")) {
      const reviewBox = e.target.parentElement.nextElementSibling;
      if (!reviewBox.classList.contains("hidden")) {
        reviewBox.classList.add("hidden");
        reviewBox.innerHTML = "";
        return;
      }
      const res = await fetch(REVIEW_API);
      const reviews = await res.json();
      const filtered = reviews.reviews.slice(0, 2);
      reviewBox.innerHTML = filtered
        .map(
          (r) => `
        <div class="p-2 border rounded">
          <p class="text-sm font-semibold">${r.name}</p>
          <p class="text-sm italic">${r.review}</p>
        </div>
      `
        )
        .join("");
      reviewBox.classList.remove("hidden");
    }
  });
};
let discountApplied = false;

document.addEventListener("DOMContentLoaded", () => {
  const discountBtn = document.getElementById("discount-btn");
  if (discountBtn) {
    discountBtn.addEventListener("click", () => {
      if (discountApplied) return;

      const price = cart.reduce((sum, p) => sum + p.price, 0);
      const delivery = price * 0.02;
      const tax = price * 0.25;
      const shipping = price * 0.01;
      const total = price + delivery + tax + shipping;
      const discountedTotal = total * 0.9;

      document.getElementById("total").innerText = discountedTotal.toFixed(2);

      discountBtn.innerText = "✅ Discount Applied!";
      discountBtn.disabled = true;
      discountBtn.classList.add("opacity-60", "cursor-not-allowed");

      discountApplied = true;
    });
  }
});

loadProducts();
handleEvents();
