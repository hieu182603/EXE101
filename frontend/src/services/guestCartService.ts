export interface GuestCartItem {
    productId: string;
    quantity: number;
    price: number;
    name: string;
    image?: string;
    category?: string;
    stock: number;
}

export interface GuestCart {
    items: GuestCartItem[];
    totalAmount: number;
}

const GUEST_CART_KEY = 'guestCart';

export const guestCartService = {
    // Get cart from sessionStorage
    getCart(): GuestCart {
        try {
            const cartData = sessionStorage.getItem(GUEST_CART_KEY);
            if (cartData) {
                return JSON.parse(cartData);
            }
        } catch (error) {
            console.error('Error loading guest cart:', error);
        }
        return { items: [], totalAmount: 0 };
    },

    // Save cart to sessionStorage
    saveCart(cart: GuestCart): void {
        try {
            sessionStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving guest cart:', error);
        }
    },

    // Add product to cart
    addToCart(product: { id: string; name: string; price: number; image?: string; category?: string; stock: number }, quantity: number = 1): GuestCart {
        // Validation
        if (quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }
        if (product.price < 0) {
            throw new Error('Product price cannot be negative');
        }
        if (product.stock < 0) {
            throw new Error('Product stock cannot be negative');
        }

        const cart = this.getCart();
        
        // Check cart items limit (max 50 different products)
        if (cart.items.length >= 50 && !cart.items.find(item => item.productId === product.id)) {
            throw new Error('Cart is full. Maximum 50 different products allowed');
        }
        
        const existingItem = cart.items.find(item => item.productId === product.id);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stock) {
                throw new Error(`Cannot add. Total quantity (${newQuantity}) exceeds stock quantity (${product.stock})`);
            }
            existingItem.quantity = newQuantity;
        } else {
            if (quantity > product.stock) {
                throw new Error(`Cannot add. Quantity (${quantity}) exceeds stock quantity (${product.stock})`);
            }
            cart.items.push({
                productId: product.id,
                quantity,
                price: product.price,
                name: product.name,
                image: product.image,
                category: product.category,
                stock: product.stock
            });
        }

        cart.totalAmount = this.calculateTotal(cart.items);
        this.saveCart(cart);
        return cart;
    },

    // Update quantity
    updateQuantity(productId: string, quantity: number): GuestCart {
        const cart = this.getCart();
        const item = cart.items.find(item => item.productId === productId);

        if (!item) {
            throw new Error('Product not found in cart');
        }

        if (quantity <= 0) {
            return this.removeItem(productId);
        }

        if (quantity > item.stock) {
            throw new Error(`Cannot update. Quantity (${quantity}) exceeds stock quantity (${item.stock})`);
        }

        item.quantity = quantity;
        cart.totalAmount = this.calculateTotal(cart.items);
        this.saveCart(cart);
        return cart;
    },

    // Increase quantity
    increaseQuantity(productId: string, amount: number = 1): GuestCart {
        const cart = this.getCart();
        const item = cart.items.find(item => item.productId === productId);

        if (!item) {
            throw new Error('Product not found in cart');
        }

        const newQuantity = item.quantity + amount;
        if (newQuantity > item.stock) {
            throw new Error(`Cannot increase quantity. Only ${item.stock} products left in stock`);
        }

        item.quantity = newQuantity;
        cart.totalAmount = this.calculateTotal(cart.items);
        this.saveCart(cart);
        return cart;
    },

    // Decrease quantity
    decreaseQuantity(productId: string, amount: number = 1): GuestCart {
        const cart = this.getCart();
        const item = cart.items.find(item => item.productId === productId);

        if (!item) {
            throw new Error('Product not found in cart');
        }

        const newQuantity = item.quantity - amount;
        if (newQuantity <= 0) {
            return this.removeItem(productId);
        }

        item.quantity = newQuantity;
        cart.totalAmount = this.calculateTotal(cart.items);
        this.saveCart(cart);
        return cart;
    },

    // Remove item from cart
    removeItem(productId: string): GuestCart {
        const cart = this.getCart();
        cart.items = cart.items.filter(item => item.productId !== productId);
        cart.totalAmount = this.calculateTotal(cart.items);
        this.saveCart(cart);
        return cart;
    },

    // Clear cart
    clearCart(): GuestCart {
        const emptyCart = { items: [], totalAmount: 0 };
        this.saveCart(emptyCart);
        return emptyCart;
    },

    // Calculate total amount
    calculateTotal(items: GuestCartItem[]): number {
        const total = items.reduce((total, item) => {
            // Validation để tránh lỗi tính toán
            if (item.price < 0 || item.quantity <= 0) {
                console.warn(`Invalid item in cart: ${item.name} - price: ${item.price}, quantity: ${item.quantity}`);
                return total;
            }
            return total + (item.price * item.quantity);
        }, 0);
        
        // Đảm bảo kết quả không âm và giới hạn precision
        return Math.max(0, Number(total.toFixed(2)));
    },

    // Get item quantity
    getItemQuantity(productId: string): number {
        const cart = this.getCart();
        const item = cart.items.find(item => item.productId === productId);
        return item ? item.quantity : 0;
    },

    // Check if cart has items
    hasItems(): boolean {
        const cart = this.getCart();
        return cart.items.length > 0;
    },

    // Get cart items count
    getItemsCount(): number {
        const cart = this.getCart();
        return cart.items.reduce((count, item) => count + item.quantity, 0);
    }
}; 