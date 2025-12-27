import { Service } from "typedi";
import { Cart } from "./cart.entity";
import { CartItem } from "./cartItem.entity";
import { Product } from "@/product/product.entity";
import { Account } from "@/auth/account/account.entity";
import { DbConnection } from "@/database/dbConnection";
import { EntityNotFoundException } from "@/exceptions/http-exceptions";

@Service()
export class CartService {
    async getCart(username: string): Promise<any | null> {
        if (!DbConnection.appDataSource) throw new Error("Database not initialized");

        const cartRepository = DbConnection.appDataSource.getRepository(Cart);
        const cart = await cartRepository.findOne({
            where: { customer: { username } },
            relations: ['items', 'items.product']
        });

        return cart;
    }

    async addToCart(username: string, productId: string, quantity: number): Promise<any> {
        if (!DbConnection.appDataSource) throw new Error("Database not initialized");

        const cartRepository = DbConnection.appDataSource.getRepository(Cart);
        const cartItemRepository = DbConnection.appDataSource.getRepository(CartItem);

        // Find or create cart
        let cart = await cartRepository.findOne({
            where: { customer: { username } },
            relations: ['items']
        });

        if (!cart) {
            const customer = await DbConnection.appDataSource.getRepository(Account).findOne({
                where: { username }
            });
            if (!customer) throw new EntityNotFoundException("Customer not found");

            cart = cartRepository.create({
                customer,
                items: []
            });
            await cartRepository.save(cart);
        }

        // Check if product exists
        const product = await DbConnection.appDataSource.getRepository(Product).findOne({
            where: { id: productId }
        });
        if (!product) throw new EntityNotFoundException("Product not found");

        // Find existing cart item or create new
        let cartItem = cart.items.find(item => item.product.id === productId);
        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItemRepository.save(cartItem);
        } else {
            cartItem = cartItemRepository.create({
                cart,
                product,
                quantity
            });
            await cartItemRepository.save(cartItem);
        }

        return this.getCart(username) as Promise<Cart>;
    }

    async updateCartItem(username: string, itemId: string, quantity: number): Promise<any> {
        if (!DbConnection.appDataSource) throw new Error("Database not initialized");

        const cartItemRepository = DbConnection.appDataSource.getRepository(CartItem);

        const cartItem = await cartItemRepository.findOne({
            where: { id: itemId, cart: { customer: { username } } },
            relations: ['cart']
        });

        if (!cartItem) throw new EntityNotFoundException("Cart item not found");

        if (quantity <= 0) {
            await cartItemRepository.remove(cartItem);
        } else {
            cartItem.quantity = quantity;
            await cartItemRepository.save(cartItem);
        }

        return this.getCart(username) as Promise<Cart>;
    }

    async removeFromCart(username: string, itemId: string): Promise<any> {
        if (!DbConnection.appDataSource) throw new Error("Database not initialized");

        const cartItemRepository = DbConnection.appDataSource.getRepository(CartItem);

        const cartItem = await cartItemRepository.findOne({
            where: { id: itemId, cart: { customer: { username } } }
        });

        if (!cartItem) throw new EntityNotFoundException("Cart item not found");

        await cartItemRepository.remove(cartItem);

        return this.getCart(username) as Promise<Cart>;
    }

    async clearCart(username: string): Promise<void> {
        if (!DbConnection.appDataSource) throw new Error("Database not initialized");

        const cartRepository = DbConnection.appDataSource.getRepository(Cart);

        const cart = await cartRepository.findOne({
            where: { customer: { username } },
            relations: ['items']
        });

        if (cart) {
            await DbConnection.appDataSource.getRepository(CartItem).remove(cart.items);
        }
    }
}
