/**
 * Teryak Platform - Centralized Shopping Cart Core Engine
 * Supports standard methods: getItems, getCart, addItem, addToCart, removeItem, updateQuantity, getTotal, getTotalPrice, getCount, clearCart
 */

(function () {
  'use strict';

  let lastAddTimestamp = 0;

  const Cart = {
    // Retrieve all items currently in cart
    getCart: function () {
      try {
        const raw = localStorage.getItem('cart');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('Error loading cart data from localStorage', e);
        return [];
      }
    },

    // Alias for getCart
    getItems: function () {
      return this.getCart();
    },

    // Save cart state and dispatch global events
    saveCart: function (cart) {
      try {
        localStorage.setItem('cart', JSON.stringify(cart));
      } catch (e) {
        console.error('Error saving cart to localStorage', e);
      }
      try {
        window.dispatchEvent(new CustomEvent('teryak:cart-change', { detail: { cart } }));
      } catch (e) {}
      this.updateBadges();
    },

    // Add item to cart with quantity deduplication
    addToCart: function (product) {
      if (!product || !product.name) return this.getCart();

      let cart = this.getCart();
      const cleanName = String(product.name).trim();
      let existingItem = cart.find(
        (item) => String(item.name).trim() === cleanName || (product.id && item.id === product.id)
      );

      // Parse price to clean numeric float
      let numericPrice = typeof product.price === 'number'
        ? product.price
        : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 25.0;

      const qtyToAdd = Number(product.quantity) || 1;
      const productImg = product.image || product.img || '../../assets/images/parst.jpg';

      if (existingItem) {
        existingItem.quantity = (Number(existingItem.quantity) || 1) + qtyToAdd;
        if (numericPrice) existingItem.price = numericPrice;
        if (productImg && (!existingItem.image || existingItem.image.includes('undefined'))) {
          existingItem.image = productImg;
          existingItem.img = productImg;
        }
      } else {
        cart.push({
          id: product.id || `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          medicineId: product.medicineId || product._id || product.id || undefined,
          name: cleanName,
          price: numericPrice,
          image: productImg,
          img: productImg,
          quantity: qtyToAdd,
          pharmacy: product.pharmacy || 'صيدلية ترياق المعتمدة',
          pharmacyId: product.pharmacyId || undefined
        });
      }

      this.saveCart(cart);
      return cart;
    },

    // Alias for addToCart
    addItem: function (product) {
      return this.addToCart(product);
    },

    // Update quantity of an item
    updateQuantity: function (identifier, delta) {
      let cart = this.getCart();
      let itemIndex = cart.findIndex(
        (item) => item.id === identifier || String(item.name).trim() === String(identifier).trim()
      );

      if (itemIndex > -1) {
        const newQty = (Number(cart[itemIndex].quantity) || 1) + Number(delta);
        if (newQty <= 0) {
          cart.splice(itemIndex, 1);
        } else {
          cart[itemIndex].quantity = newQty;
        }
      }

      this.saveCart(cart);
      return cart;
    },

    // Remove single item from cart
    removeItem: function (identifier) {
      let cart = this.getCart().filter(
        (item) => item.id !== identifier && String(item.name).trim() !== String(identifier).trim()
      );
      this.saveCart(cart);
      return cart;
    },

    // Clear entire cart
    clearCart: function () {
      try {
        localStorage.removeItem('cart');
      } catch (e) {}
      this.saveCart([]);
    },

    // Get total items count (sum of quantities)
    getCount: function () {
      const cart = this.getCart();
      return cart.reduce((total, item) => total + (Number(item.quantity) || 1), 0);
    },

    // Get total price of all items in cart
    getTotalPrice: function () {
      const cart = this.getCart();
      return cart.reduce((total, item) => {
        let num = typeof item.price === 'number'
          ? item.price
          : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
        return total + num * (Number(item.quantity) || 1);
      }, 0);
    },

    // Alias for getTotalPrice
    getTotal: function () {
      return this.getTotalPrice();
    },

    // Update all navbar/floating cart counters
    updateBadges: function () {
      const count = this.getCount();
      const badges = document.querySelectorAll('#count, #counter, .cart-counter-badge');
      badges.forEach((badge) => {
        badge.textContent = count;
        if (count > 0) {
          badge.style.display = 'flex';
        }
      });
    },

    // Global click listener for fallback static .addCart buttons
    initGlobalListeners: function () {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.addCart, .btn-add-cart');
        if (btn) {
          // If event already handled or explicitly prevented, do nothing
          if (btn.dataset.handledByPage === 'true' || e.defaultPrevented) return;

          // Throttle duplicate rapid clicks (within 350ms)
          const now = Date.now();
          if (now - lastAddTimestamp < 350) return;
          lastAddTimestamp = now;

          const card = btn.closest('.card, .medicine-card, .medicine-item, .sec') || document;
          const titleEl = card.querySelector('.card-title, .title, .NameOfMedicine, h1, h2');
          const priceEl = card.querySelector('.parg, .PriceOfMedicine, .price');
          const imgEl = card.querySelector('.card-img-top, img');

          if (titleEl) {
            const name = titleEl.textContent.trim();
            const price = priceEl ? priceEl.textContent.trim() : '25.00 ج.م';
            const img = imgEl ? imgEl.src : '';

            this.addToCart({ name, price, img });

            if (window.Toast) {
              window.Toast.success(`تمت إضافة (${name}) إلى سلة المشتريات`, 'سلة المشتريات', 3500);
            }
          }
        }
      });

      this.updateBadges();
    },
  };

  // Expose globally immediately
  window.Cart = Cart;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Cart.initGlobalListeners());
  } else {
    Cart.initGlobalListeners();
  }
})();
