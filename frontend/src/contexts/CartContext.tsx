import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cartService } from '../services/cartService';
import type { CartItem } from '../services/cartService';
import { guestCartService, type GuestCartItem } from '../services/guestCartService';
import { productService } from '../services/productService';

// Updated interfaces to match backend
interface CartState {
    items: CartItem[];
    selectedItems: Set<string>; // Track selected item IDs for checkout
    totalAmount: number;
    loading: boolean;
    operationLoading: boolean; // Separate loading for cart operations (add/update/remove)
    activeOperations: Set<string>; // Track operations per product
    error: string | null;
    isInitialized: boolean;
}

type CartAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_OPERATION_LOADING'; payload: boolean }
    | { type: 'ADD_OPERATION'; payload: string }
    | { type: 'REMOVE_OPERATION'; payload: string }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_CART'; payload: { items: CartItem[]; totalAmount: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'SET_INITIALIZED'; payload: boolean }
    | { type: 'TOGGLE_ITEM_SELECTION'; payload: string }
    | { type: 'SELECT_ALL_ITEMS'; payload: boolean }
    | { type: 'SET_SELECTED_ITEMS'; payload: Set<string> };

interface CartContextType extends CartState {
    addToCart: (productId: string, quantity: number) => Promise<void>;
    increaseQuantity: (productId: string, amount?: number) => Promise<void>;
    decreaseQuantity: (productId: string, amount?: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    getItemQuantity: (productId: string) => number;
    isGuest: boolean;
    migrateGuestCart: () => Promise<void>;
    toggleItemSelection: (itemId: string) => void;
    selectAllItems: (selected: boolean) => void;
    getSelectedSubtotal: () => number;
}

// Define proper types for API responses
interface CartApiResponse {
    success: boolean;
    data?: unknown; // Make flexible to handle different wrapping structures
    message?: string;
    error?: string;
}

type ApiResponse = CartApiResponse;

interface ApiError {
    response?: {
        status?: number;
        data?: {
            message?: string;
            error?: string;
        };
    };
    message?: string;
}

const initialState: CartState = {
    items: [],
    selectedItems: new Set<string>(),
    totalAmount: 0,
    loading: false,
    operationLoading: false,
    activeOperations: new Set<string>(),
    error: null,
    isInitialized: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_OPERATION_LOADING':
            return { ...state, operationLoading: action.payload };
        case 'ADD_OPERATION': {
            const newOperations = new Set(state.activeOperations);
            newOperations.add(action.payload);
            return { 
                ...state, 
                activeOperations: newOperations,
                operationLoading: newOperations.size > 0 
            };
        }
        case 'REMOVE_OPERATION': {
            const newOperations = new Set(state.activeOperations);
            newOperations.delete(action.payload);
            return { 
                ...state, 
                activeOperations: newOperations,
                operationLoading: newOperations.size > 0 
            };
        }
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false, operationLoading: false };
        case 'SET_CART': {
            // Auto-select all items when cart is loaded
            const newSelectedItems = new Set<string>();
            action.payload.items.forEach(item => {
                const itemId = item.product?.id || item.id;
                if (itemId) {
                    newSelectedItems.add(itemId);
                }
            });
            return {
                ...state,
                items: action.payload.items,
                selectedItems: newSelectedItems,
                totalAmount: action.payload.totalAmount,
                loading: false,
                operationLoading: false,
                error: null,
                isInitialized: true,
            };
        }
        case 'CLEAR_CART':
            return {
                ...state,
                items: [],
                selectedItems: new Set<string>(),
                totalAmount: 0,
                loading: false,
                operationLoading: false,
                activeOperations: new Set<string>(),
                error: null,
            };
        case 'TOGGLE_ITEM_SELECTION': {
            const newSelectedItems = new Set(state.selectedItems);
            if (newSelectedItems.has(action.payload)) {
                newSelectedItems.delete(action.payload);
            } else {
                newSelectedItems.add(action.payload);
            }
            return { ...state, selectedItems: newSelectedItems };
        }
        case 'SELECT_ALL_ITEMS': {
            const newSelectedItems = new Set<string>();
            if (action.payload) {
                // Select all items
                state.items.forEach(item => {
                    const itemId = item.product?.id || item.id;
                    if (itemId) {
                        newSelectedItems.add(itemId);
                    }
                });
            }
            // If false, newSelectedItems remains empty (deselect all)
            return { ...state, selectedItems: newSelectedItems };
        }
        case 'SET_SELECTED_ITEMS':
            return { ...state, selectedItems: action.payload };
        case 'SET_INITIALIZED':
            return { ...state, isInitialized: action.payload };
        default:
            return state;
    }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Helper function to check if user is authenticated
    const isAuthenticated = (): boolean => {
        return !!localStorage.getItem('authToken');
    };

    // Helper function to convert GuestCartItem to CartItem format
    const convertGuestCartToCartItems = (guestItems: GuestCartItem[]): CartItem[] => {
        try {
            return guestItems.map(guestItem => {
                // Validation để tránh lỗi
                if (!guestItem.productId || !guestItem.name) {
                    console.warn('Invalid guest cart item:', guestItem);
                    return null;
                }
                
                return {
                    id: `guest-${guestItem.productId}`,
                    quantity: Math.max(1, guestItem.quantity), // Đảm bảo quantity >= 1
                    product: {
                        id: guestItem.productId,
                        name: guestItem.name,
                        slug: '',
                        price: Math.max(0, guestItem.price), // Đảm bảo price >= 0
                        stock: Math.max(0, guestItem.stock), // Đảm bảo stock >= 0
                        isActive: true,
                        images: guestItem.image ? [{ id: '1', url: guestItem.image }] : [],
                        category: guestItem.category || ''
                    }
                };
            }).filter(Boolean) as CartItem[]; // Loại bỏ null items
        } catch (error) {
            console.error('Error converting guest cart items:', error);
            return [];
        }
    };

    // Helper function to handle API responses
    const handleApiResponse = (response: ApiResponse, operation: string) => {
        
        if (!response.success) {
            const errorMessage = response.message || response.error || 'Unknown error occurred';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            throw new Error(errorMessage);
        }

        // Handle response structure safely
        try {
            let cartData = null;
            
                        // Try to extract cart data from response  
            if (response.data && typeof response.data === 'object') {
                // Check if it's the cart entity directly
                // @ts-expect-error - Dynamic response structure from backend API
                if (response.data.cartItems !== undefined) {
                    cartData = response.data;
                }

                // Check if it's wrapped (response.data.data.data) - 3 levels for interceptor
                // @ts-expect-error - Nested data structure from API interceptor
                else if (response.data.data && response.data.data.data && response.data.data.data.cartItems !== undefined) {
                    // @ts-expect-error - Accessing nested cart data from interceptor wrapper
                    cartData = response.data.data.data;
                }
                // Check if it's wrapped (response.data.data) - 2 levels fallback

                // Check if it's wrapped (response.data.data)

                // @ts-expect-error - Alternative nested data structure from API
                else if (response.data.data && response.data.data.cartItems !== undefined) {
                    // @ts-expect-error - Accessing nested cart data from API wrapper
                    cartData = response.data.data;
                }
            }
            
            if (cartData && cartData.cartItems !== undefined) {
                const cartItems = Array.isArray(cartData.cartItems) ? cartData.cartItems : [];
                dispatch({
                    type: 'SET_CART',
                    payload: {
                        items: cartItems,
                        totalAmount: Number(cartData.totalAmount) || 0,
                    },
                });
            } else if (operation === 'CLEAR_CART') {
                dispatch({ type: 'CLEAR_CART' });
            } else {
                // Don't auto-refresh to avoid infinite loops
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to process cart response' });
        }
    };

    // Helper function to handle API errors
    const handleApiError = (error: unknown) => {
        
        const apiError = error as ApiError;
        let errorMessage = 'An error occurred';
        
        // Extract error message from various sources
        if (apiError.message) {
            errorMessage = apiError.message;
        } else if (apiError.response?.data?.message) {
            errorMessage = apiError.response.data.message;
        } else if (apiError.response?.data?.error) {
            errorMessage = apiError.response.data.error;
        }
        
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        
        // Don't throw authentication errors to avoid breaking UX
        if (apiError.response?.status === 401) {
            dispatch({ type: 'CLEAR_CART' });
            return;
        }
        
        throw error;
    };

    const addToCart = async (productId: string, quantity: number): Promise<void> => {
        // Only prevent if the same product is already being processed
        if (state.activeOperations.has(`add-${productId}`)) {
            return;
        }

        const operationId = `add-${productId}`;
        dispatch({ type: 'ADD_OPERATION', payload: operationId });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            if (isAuthenticated()) {
                // Authenticated user - use API
                const response = await cartService.addToCart(productId, quantity);
                handleApiResponse(response, 'ADD_TO_CART');
            } else {
                // Guest user - use sessionStorage
                const product = await productService.getProductById(productId);
                if (!product) {
                    throw new Error('Product not found');
                }

                const guestCart = guestCartService.addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images && product.images.length > 0 ? product.images[0].url : undefined,
                    category: product.category?.name,
                    stock: product.stock
                }, quantity);

                // Update context state with guest cart data and validate sync
                const cartItems = convertGuestCartToCartItems(guestCart.items);
                if (cartItems.length !== guestCart.items.length) {
                    console.warn('Cart sync warning: Some items failed to convert');
                }
                
                dispatch({ 
                    type: 'SET_CART', 
                    payload: { 
                        items: cartItems, 
                        totalAmount: guestCart.totalAmount 
                    } 
                });
            }
        } catch (error) {
            if (isAuthenticated()) {
                handleApiError(error);
            } else {
                // Handle guest cart errors
                const errorMessage = error instanceof Error ? error.message : 'Failed to add product to cart';
                dispatch({ type: 'SET_ERROR', payload: errorMessage });
            }
        } finally {
            dispatch({ type: 'REMOVE_OPERATION', payload: operationId });
        }
    };

    const increaseQuantity = async (productId: string, amount: number = 1): Promise<void> => {
        // Only prevent if the same product is already being processed
        if (state.activeOperations.has(`increase-${productId}`)) {
            return;
        }

        const operationId = `increase-${productId}`;
        dispatch({ type: 'ADD_OPERATION', payload: operationId });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            if (isAuthenticated()) {
                // Authenticated user - use API
                const response = await cartService.increaseQuantity(productId, amount);
                handleApiResponse(response, 'INCREASE_QUANTITY');
            } else {
                // Guest user - use sessionStorage
                const guestCart = guestCartService.increaseQuantity(productId, amount);
                const cartItems = convertGuestCartToCartItems(guestCart.items);
                dispatch({ 
                    type: 'SET_CART', 
                    payload: { 
                        items: cartItems, 
                        totalAmount: guestCart.totalAmount 
                    } 
                });
            }
        } catch (error) {
            if (isAuthenticated()) {
                handleApiError(error);
            } else {
                const errorMessage = error instanceof Error ? error.message : 'Failed to increase quantity';
                dispatch({ type: 'SET_ERROR', payload: errorMessage });
            }
        } finally {
            dispatch({ type: 'REMOVE_OPERATION', payload: operationId });
        }
    };

    const decreaseQuantity = async (productId: string, amount: number = 1): Promise<void> => {
        // Only prevent if the same product is already being processed
        if (state.activeOperations.has(`decrease-${productId}`)) {
            return;
        }

        const operationId = `decrease-${productId}`;
        dispatch({ type: 'ADD_OPERATION', payload: operationId });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            if (isAuthenticated()) {
                // Authenticated user - use API
                const response = await cartService.decreaseQuantity(productId, amount);
                handleApiResponse(response, 'DECREASE_QUANTITY');
            } else {
                // Guest user - use sessionStorage
                const guestCart = guestCartService.decreaseQuantity(productId, amount);
                const cartItems = convertGuestCartToCartItems(guestCart.items);
                dispatch({ 
                    type: 'SET_CART', 
                    payload: { 
                        items: cartItems, 
                        totalAmount: guestCart.totalAmount 
                    } 
                });
            }
        } catch (error) {
            if (isAuthenticated()) {
                handleApiError(error);
            } else {
                const errorMessage = error instanceof Error ? error.message : 'Failed to decrease quantity';
                dispatch({ type: 'SET_ERROR', payload: errorMessage });
            }
        } finally {
            dispatch({ type: 'REMOVE_OPERATION', payload: operationId });
        }
    };

    const removeItem = async (productId: string): Promise<void> => {
        // Only prevent if the same product is already being processed
        if (state.activeOperations.has(`remove-${productId}`)) {
            return;
        }

        const operationId = `remove-${productId}`;
        dispatch({ type: 'ADD_OPERATION', payload: operationId });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            if (isAuthenticated()) {
                // Authenticated user - use API
                const response = await cartService.removeItem(productId);
                handleApiResponse(response, 'REMOVE_ITEM');
            } else {
                // Guest user - use sessionStorage
                const guestCart = guestCartService.removeItem(productId);
                const cartItems = convertGuestCartToCartItems(guestCart.items);
                dispatch({ 
                    type: 'SET_CART', 
                    payload: { 
                        items: cartItems, 
                        totalAmount: guestCart.totalAmount 
                    } 
                });
            }
        } catch (error) {
            if (isAuthenticated()) {
                handleApiError(error);
            } else {
                const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
                dispatch({ type: 'SET_ERROR', payload: errorMessage });
            }
        } finally {
            dispatch({ type: 'REMOVE_OPERATION', payload: operationId });
        }
    };

    const clearCart = async (): Promise<void> => {
        if (state.operationLoading) {
            return;
        }

        // Brief loading state to prevent spam clicks, but no UI loading shown
        dispatch({ type: 'SET_OPERATION_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            if (isAuthenticated()) {
                // Authenticated user - use API
                const response = await cartService.clearCart();
                handleApiResponse(response, 'CLEAR_CART');
            } else {
                // Guest user - clear sessionStorage
                guestCartService.clearCart();
                dispatch({ type: 'CLEAR_CART' });
            }
        } catch (error) {
            if (isAuthenticated()) {
                handleApiError(error);
            } else {
                dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
            }
        }
    };

    const refreshCart = async (): Promise<void> => {
        // Don't show loading for refresh operations
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await cartService.viewCart();
            handleApiResponse(response, 'REFRESH_CART');
        } catch (error) {
            // Handle auth errors silently for refresh
            const apiError = error as ApiError;
            if (apiError.response?.status === 401) {
                dispatch({ type: 'CLEAR_CART' });
                dispatch({ type: 'SET_INITIALIZED', payload: true });
                return;
            }
            // Don't throw errors for refresh
            dispatch({ type: 'SET_INITIALIZED', payload: true });
        }
    };

    const getItemQuantity = (productId: string): number => {
        if (isAuthenticated()) {
            const item = state.items.find(item => item.product.id === productId);
            return item ? item.quantity : 0;
        } else {
            return guestCartService.getItemQuantity(productId);
        }
    };

    // Migrate guest cart to authenticated cart when user logs in
    const migrateGuestCart = async (): Promise<void> => {
        if (!isAuthenticated()) {
            return;
        }

        try {
            const guestCart = guestCartService.getCart();
            if (guestCart.items.length === 0) {
                return;
            }

            // Get current authenticated cart to check for duplicates
            let currentAuthCart = null;
            try {
                const cartResponse = await cartService.viewCart();
                if (cartResponse.success && cartResponse.data) {
                    // Handle nested response structure
                    const responseData = cartResponse.data as { data?: { cartItems?: CartItem[] } } | { cartItems?: CartItem[] };
                    currentAuthCart = ('data' in responseData ? responseData.data : responseData) as { cartItems?: CartItem[] };
                }
            } catch (error) {
                console.warn('Could not fetch current cart for migration check:', error);
            }

            const migrationResults = {
                success: 0,
                failed: 0,
                skipped: 0
            };

            // Add each guest cart item to authenticated cart
            for (const guestItem of guestCart.items) {
                try {
                    // Check if item already exists in authenticated cart
                    const existsInAuthCart = currentAuthCart?.cartItems?.some(
                        (item: CartItem) => item.product.id === guestItem.productId
                    );
                    
                    if (existsInAuthCart) {
                        console.log(`Skipping migration of ${guestItem.name} - already in authenticated cart`);
                        migrationResults.skipped++;
                        continue;
                    }

                    await cartService.addToCart(guestItem.productId, guestItem.quantity);
                    migrationResults.success++;
                } catch (error) {
                    console.error(`Failed to migrate item ${guestItem.productId}:`, error);
                    migrationResults.failed++;
                }
            }

            // Clear guest cart only if at least some items were migrated successfully
            if (migrationResults.success > 0 || migrationResults.skipped > 0) {
                guestCartService.clearCart();
            }
            
            // Refresh authenticated cart
            await refreshCart();

            // Log migration results
            console.log('Cart migration completed:', migrationResults);
        } catch (error) {
            console.error('Failed to migrate guest cart:', error);
        }
    };

    // Initialize cart on mount and auth changes
    useEffect(() => {
        const initializeCart = async () => {
            const authToken = localStorage.getItem('authToken');
            
            if (!authToken) {
                // Load guest cart from sessionStorage
                const guestCart = guestCartService.getCart();
                if (guestCart.items.length > 0) {
                    const cartItems = convertGuestCartToCartItems(guestCart.items);
                    dispatch({ 
                        type: 'SET_CART', 
                        payload: { 
                            items: cartItems, 
                            totalAmount: guestCart.totalAmount 
                        } 
                    });
                } else {
                    dispatch({ type: 'CLEAR_CART' });
                }
                dispatch({ type: 'SET_INITIALIZED', payload: true });
                return;
            }

            // Set initialized immediately to prevent loading screen
            dispatch({ type: 'SET_INITIALIZED', payload: true });
            // Then refresh cart in background
            await refreshCart();
        };

        initializeCart();
    }, []);

    // Listen for auth changes
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'authToken') {
                if (e.newValue) {
                    // User logged in - migrate guest cart then refresh
                    const handleLogin = async () => {
                        try {
                            await migrateGuestCart();
                            await refreshCart();
                        } catch (error) {
                            console.error('Error handling login cart migration:', error);
                            await refreshCart(); // Fallback to just refresh
                        }
                    };
                    handleLogin();
                } else {
                    // User logged out - clear cart and load guest cart
                    dispatch({ type: 'CLEAR_CART' });
                    const guestCart = guestCartService.getCart();
                    if (guestCart.items.length > 0) {
                        const cartItems = convertGuestCartToCartItems(guestCart.items);
                        dispatch({ 
                            type: 'SET_CART', 
                            payload: { 
                                items: cartItems, 
                                totalAmount: guestCart.totalAmount 
                            } 
                        });
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [migrateGuestCart, refreshCart]); // Add dependencies

    // Cart selection functions
    const toggleItemSelection = (itemId: string): void => {
        dispatch({ type: 'TOGGLE_ITEM_SELECTION', payload: itemId });
    };

    const selectAllItems = (selected: boolean): void => {
        dispatch({ type: 'SELECT_ALL_ITEMS', payload: selected });
    };

    const getSelectedSubtotal = (): number => {
        return state.items
            .filter(item => {
                const itemId = item.product?.id || item.id;
                return itemId && state.selectedItems.has(itemId);
            })
            .reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
    };

    const contextValue: CartContextType = {
        ...state,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        clearCart,
        refreshCart,
        getItemQuantity,
        isGuest: !isAuthenticated(),
        migrateGuestCart,
        toggleItemSelection,
        selectAllItems,
        getSelectedSubtotal,
    };

    return (
        <div data-provider="cart">
            <CartContext.Provider value={contextValue}>
                {children}
            </CartContext.Provider>
        </div>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 