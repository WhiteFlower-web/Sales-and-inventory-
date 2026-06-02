// POS Logic for the Vanilla Version
document.addEventListener('DOMContentLoaded', () => {
    // Start Lucide
    if (window.lucide) lucide.createIcons();

    // The Global 'pos' object
    window.pos = {
        cart: [],
        
        // Simulation: Handle Barcode Input via Keyboard
        initBarcodeListener: function() {
            let barcodeBuffer = "";
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (barcodeBuffer.length > 3) {
                        console.log("Scanned Barcode:", barcodeBuffer);
                        this.handleBarcodeScan(barcodeBuffer);
                    }
                    barcodeBuffer = "";
                } else {
                    if (e.key.length === 1) barcodeBuffer += e.key;
                }
            });
        },

        handleBarcodeScan: function(code) {
            // In real app, fetch product by barcode from api.php
            alert("Scanned: " + code + ". Fetching from local DB...");
        },

        addToCart: function(product) {
            const existing = this.cart.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity < product.stock) {
                    existing.quantity++;
                    this.renderCart();
                } else {
                    alert("Out of stock!");
                }
            } else {
                this.cart.push({ ...product, quantity: 1 });
                this.renderCart();
            }
        },

        updateQty: function(id, delta) {
            const item = this.cart.find(i => i.id === id);
            if (!item) return;

            if (delta > 0 && item.quantity < item.stock) {
                item.quantity++;
            } else if (delta < 0 && item.quantity > 1) {
                item.quantity--;
            } else if (delta < 0 && item.quantity === 1) {
                this.cart = this.cart.filter(i => i.id !== id);
            }
            this.renderCart();
        },

        removeFromCart: function(id) {
            this.cart = this.cart.filter(item => item.id !== id);
            this.renderCart();
        },

        clearCart: function() {
            this.cart = [];
            this.renderCart();
        },

        renderCart: function() {
            const container = document.getElementById('cart-container');
            if (!container) return; // If not on pos.php

            if (this.cart.length === 0) {
                container.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full opacity-20 text-center grayscale">
                        <i data-lucide="shopping-bag" class="w-16 h-16 mb-4"></i>
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">Scanning terminal active... Add products to punch sale</p>
                    </div>
                `;
                document.getElementById('sale-btn').disabled = true;
                document.getElementById('cart-total').innerText = '₱0.00';
                document.getElementById('cart-subtotal').innerText = '₱0.00';
                lucide.createIcons();
                return;
            }

            container.innerHTML = this.cart.map(item => `
                <div class="bg-slate-50 p-4 rounded-2xl group flex items-center justify-between border border-transparent hover:border-emerald-500/20 transition-all">
                    <div class="flex-1 min-w-0 pr-4">
                        <h4 class="text-[11px] font-black text-slate-800 uppercase truncate leading-none mb-1">${item.name}</h4>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">₱${item.price.toFixed(2)} x ${item.quantity}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="flex border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                            <button onclick="pos.updateQty(${item.id}, -1)" class="w-6 h-6 flex items-center justify-center hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all text-[10px] font-black">-</button>
                            <div class="w-7 h-6 flex items-center justify-center text-[10px] font-black text-slate-800 bg-slate-50/50">${item.quantity}</div>
                            <button onclick="pos.updateQty(${item.id}, 1)" class="w-6 h-6 flex items-center justify-center hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 transition-all text-[10px] font-black">+</button>
                        </div>
                        <button onclick="pos.removeFromCart(${item.id})" class="text-slate-200 hover:text-rose-500 transition-all ml-2">
                            <i data-lucide="circle-x" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            document.getElementById('cart-subtotal').innerText = `₱${total.toFixed(2)}`;
            document.getElementById('cart-total').innerText = `₱${total.toFixed(2)}`;
            document.getElementById('sale-btn').disabled = false;
            
            lucide.createIcons();
        },

        processSale: function() {
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // In a real PHP app, you would send this to api.php via fetch()
            // Example: 
            /*
            fetch('api.php?action=save_sale', {
                method: 'POST',
                body: JSON.stringify(this.cart)
            });
            */
            
            document.getElementById('final-total').innerText = `₱${total.toFixed(2)}`;
            document.getElementById('receipt-modal').classList.remove('hidden');
            document.getElementById('receipt-modal').classList.add('flex');
            
            this.clearCart();
        },

        printThermalReceipt: function() {
            console.log("Sending RAW ESC/POS data to Thermal Printer...");
            alert("Sent to Thermal Printer: JJ JUDEJUSH POS v1.0\n----------------------\nSale Punched Successfully!");
        }
    };

    window.inventory = {
        openModal: function(id) {
            document.getElementById('product-modal-backdrop').classList.remove('hidden');
            document.getElementById('product-modal-backdrop').classList.add('flex');
            
            // Hide all modals internally first
            ['product-modal', 'damage-modal', 'delete-modal'].forEach(m => document.getElementById(m).classList.add('hidden'));
            
            if (id === 'add-product-modal') {
                document.getElementById('modal-title').innerText = 'ADD NEW PRODUCT';
                document.getElementById('product-id').value = '';
                document.getElementById('product-form').reset();
                document.getElementById('product-modal').classList.remove('hidden');
            }
        },

        editProduct: function(product) {
            this.openModal('add-product-modal');
            document.getElementById('modal-title').innerText = 'EDIT PRODUCT';
            document.getElementById('product-id').value = product.id;
            document.getElementById('p-name').value = product.name;
            document.getElementById('p-category').value = product.category;
            document.getElementById('p-price').value = product.price;
            document.getElementById('p-stock').value = product.stock;
            document.getElementById('p-barcode').value = product.barcode || product.sku;
        },

        openDamageModal: function(id, name) {
            document.getElementById('product-modal-backdrop').classList.remove('hidden');
            document.getElementById('product-modal-backdrop').classList.add('flex');
            
            ['product-modal', 'damage-modal', 'delete-modal'].forEach(m => document.getElementById(m).classList.add('hidden'));
            
            document.getElementById('damage-modal').classList.remove('hidden');
            document.getElementById('damage-product-id').value = id;
            document.getElementById('damage-item-name').innerText = name;
        },

        confirmDelete: function(id) {
            document.getElementById('product-modal-backdrop').classList.remove('hidden');
            document.getElementById('product-modal-backdrop').classList.add('flex');
            
            ['product-modal', 'damage-modal', 'delete-modal'].forEach(m => document.getElementById(m).classList.add('hidden'));
            
            document.getElementById('delete-modal').classList.remove('hidden');
            document.getElementById('delete-product-id').value = id;
        },

        closeModal: function() {
            document.getElementById('product-modal-backdrop').classList.add('hidden');
            document.getElementById('product-modal-backdrop').classList.remove('flex');
        },

        openUserModal: function() {
            document.getElementById('user-modal-backdrop').classList.remove('hidden');
            document.getElementById('user-modal-backdrop').classList.add('flex');
            document.getElementById('user-modal-title').innerText = 'PROVISION NEW USER';
            document.getElementById('user-form').reset();
            document.getElementById('staff-id').value = '';
        },

        editUser: function(user) {
            this.openUserModal();
            document.getElementById('user-modal-title').innerText = 'MANAGE STAFF ACCESS';
            document.getElementById('staff-id').value = user.id || '';
            document.getElementById('staff-name').value = user.name;
            document.getElementById('staff-email').value = user.email;
            document.getElementById('staff-role').value = user.role;
            document.getElementById('staff-pass').placeholder = 'Enter new or keep current';
        },

        closeUserModal: function() {
            document.getElementById('user-modal-backdrop').classList.add('hidden');
            document.getElementById('user-modal-backdrop').classList.remove('flex');
        },

        generateBarcode: function() {
            const code = 'JJ' + Math.floor(100000000 + Math.random() * 900000000);
            document.getElementById('p-barcode').value = code;
        },

        initQRScanner: function() {
            const reader = document.getElementById('qr-reader');
            if (reader) {
                reader.addEventListener('click', () => {
                    reader.classList.add('bg-emerald-50');
                    alert("Scanning QR Identity... Identity Verified!");
                    window.location.href = 'index.php';
                });
            }
        }
    };

    pos.initBarcodeListener();
    inventory.initQRScanner();
});
