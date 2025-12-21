import { Body, BodyParam, Controller, Get, Patch, Post, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { CartService } from "./cart.service";
import { AddToCartDto } from "./dtos/cart.dto";
import { Auth } from "@/middlewares/auth.middleware";
import { AccountDetailsDto } from "@/auth/dtos/account.dto";

@Service()
@Controller("/cart")
export class CartController {
    constructor(
        private readonly cartService: CartService
    ) {}

    @Post("/add")
    @UseBefore(Auth)
    async addToCart(
        @Req() req: any,
        @Body() addToCartDto: AddToCartDto
    ) {
        const user = req.user as AccountDetailsDto;

        
        try {
            const cart = await this.cartService.addToCart(user.username, addToCartDto);

            
            return {
                success: true,
                data: cart,
                message: "Product added to cart successfully"
            };
        } catch (error: any) {

            
            return {
                success: false,
                message: "Failed to add product to cart",
                error: error.message
            };
        }
    }

    @Get("/view")
    @UseBefore(Auth)
    async viewCart(@Req() req: any) {
        const user = req.user as AccountDetailsDto;
        
        try {
            const cart = await this.cartService.viewCart(user.username);
            
            return {
                success: true,
                data: cart,
                message: "Cart retrieved successfully"
            };
        } catch (error: any) {
            return {
                success: false,
                message: "Failed to retrieve cart",
                error: error.message
            };
        }
    }

    @Post("/increase")
    @UseBefore(Auth)
    async increaseQuantity(
        @Req() req: any,
        @BodyParam("productId") productId: string,
        @BodyParam("amount") amount: number = 1
    ) {
        const user = req.user as AccountDetailsDto;
        try {
            const cart = await this.cartService.increaseQuantity(user.username, productId, amount);
            return {
                success: true,
                data: cart,
                message: "Product quantity increased successfully"
            };
        } catch (error: any) {
            return {
                success: false,
                message: "Failed to increase product quantity",
                error: error.message
            };
        }
    }

    @Post("/decrease")
    @UseBefore(Auth)
    async decreaseQuantity(
        @Req() req: any,
        @BodyParam("productId") productId: string,
        @BodyParam("amount") amount: number = 1
    ) {
        const user = req.user as AccountDetailsDto;
        try {
            const cart = await this.cartService.decreaseQuantity(user.username, productId, amount);
            return {
                success: true,
                data: cart,
                message: "Product quantity decreased successfully"
            };
        } catch (error: any) {
            return {
                success: false,
                message: "Failed to decrease product quantity",
                error: error.message
            };
        }
    }

    @Patch("/remove")
    @UseBefore(Auth)
    async removeItem(
        @Req() req: any,
        @BodyParam("productId") productId: string,
    ) {
        const user = req.user as AccountDetailsDto;
        try {
            const cart = await this.cartService.removeItem(user.username, productId);
            return {
                success: true,
                data: cart,
                message: "Product removed from cart successfully"
            };
        } catch (error: any) {
            return {
                success: false,
                message: "Failed to remove product from cart",
                error: error.message
            };
        }
    }

    @Post("/clear")
    @UseBefore(Auth)
    async clearCart(@Req() req: any) {
        const user = req.user as AccountDetailsDto;
        try {
            await this.cartService.clearCart(user.username);
            return {
                success: true,
                message: "Cart cleared successfully"
            };
        } catch (error: any) {
            return {
                success: false,
                message: "Failed to clear cart",
                error: error.message
            };
        }
    }


}
