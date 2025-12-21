import { useState } from 'react';

export const useNavigation = (initialView = 'cart') => {
    const [currentView, setCurrentView] = useState(initialView);

    const goToCart = () => setCurrentView('cart');
    const goToCheckout = () => setCurrentView('checkout');
    const goToOrderHistory = () => setCurrentView('history');

    const navigateTo = (view) => setCurrentView(view);

    return {
        currentView,
        goToCart,
        goToCheckout,
        goToOrderHistory,
        navigateTo,
    };
}; 