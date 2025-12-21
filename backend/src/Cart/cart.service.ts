import { Cart } from './cart.entity';
import { CartItem } from './cartItem.entity';
import { Account } from '@/auth/account/account.entity';
import { Product } from '@/product/product.entity';
import { AddToCartDto } from './dtos/cart.dto';
import { Service } from 'typedi';
import { DbConnection } from '@/database/dbConnection';
import { EntityNotFoundException, BadRequestException } from '@/exceptions/http-exceptions';

@Service()
export class CartService {
  private validateQuantity(quantity: number, action: 'increase' | 'decrease'): void {
    if (!Number.isInteger(quantity)) {
      throw new BadRequestException('Quantity must be an integer');
    }
    
    if (quantity <= 0) {
      throw new BadRequestException(`${action === 'increase' ? 'Increase' : 'Decrease'} quantity must be greater than 0`);
    }
  }

  private async validateQuantityAgainstStock(quantity: number, product: Product, action: 'increase' | 'decrease'): Promise<void> {
    if (!product.isActive) {
      throw new BadRequestException('This product is currently unavailable');
    }

    if (quantity > product.stock) {
      throw new BadRequestException(`${action === 'increase' ? 'Increase' : 'Decrease'} quantity (${quantity}) cannot exceed available stock (${product.stock})`);
    }
  }

  private async getOrCreateCart(username: string): Promise<Cart> {
    try {
      const account = await Account.findOne({ where: { username } });
      if (!account) throw new EntityNotFoundException('Account');
      
      const cart = await Cart.findOne({
        where: { account: { id: account.id } },
        relations: ['cartItems', 'cartItems.product', 'cartItems.product.images', 'account']
      });

      if (cart) return cart;

      const newCart = new Cart();
      newCart.account = account;
      newCart.totalAmount = 0;
      await newCart.save();
      return newCart;
    } catch (error) {
      throw error;
    }
  }

  private async calculateTotalAmount(cart: Cart): Promise<number> {
    try {
      let total = 0;

      if (!cart.cartItems || cart.cartItems.length === 0) {
        return Number(total.toFixed(2));
      }

      for (const item of cart.cartItems) {
        const product = await Product.findOne({ where: { id: item.product.id } });
        
        // Skip invalid items but don't remove them - preserve for user review
        if (!product || !product.isActive || !product.price || product.price <= 0 || product.stock < item.quantity) {
          continue;
        }
        
        total += product.price * item.quantity;
      }

      return Number(total.toFixed(2));
    } catch (error) {
      throw error;
    }
  }

  private async calculateTotalAmountInTransaction(cart: Cart, transactionalEntityManager: any): Promise<number> {
    try {
      let total = 0;

      if (!cart.cartItems || cart.cartItems.length === 0) {
        return Number(total.toFixed(2));
      }

      for (const item of cart.cartItems) {
        const product = await transactionalEntityManager.findOne(Product, { where: { id: item.product.id } });
        
        // Skip invalid items but don't remove them - preserve for user review
        if (!product || !product.isActive || !product.price || product.price <= 0 || product.stock < item.quantity) {
          continue;
        }
        
        total += product.price * item.quantity;
      }

      return Number(total.toFixed(2));
    } catch (error) {
      throw error;
    }
  }

  private async updateCartTotals(cart: Cart): Promise<Cart> {
    try {
      cart.totalAmount = await this.calculateTotalAmount(cart);
      await cart.save();
      return cart;
    } catch (error) {
      throw error;
    }
  }

  async addToCart(username: string, addToCartDto: AddToCartDto): Promise<Cart> {
    try {
      this.validateQuantity(addToCartDto.quantity, 'increase');

      return await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {
        // Get cart within transaction to ensure we have the latest cart items
        const account = await transactionalEntityManager.findOne(Account, { where: { username } });
        if (!account) throw new EntityNotFoundException('Account');
        
        let cart = await transactionalEntityManager.findOne(Cart, {
          where: { account: { id: account.id } },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.images', 'account']
        });

        if (!cart) {
          cart = new Cart();
          cart.account = account;
          cart.totalAmount = 0;
          cart = await transactionalEntityManager.save(cart);
        }

        // Validate max cart items (50 items limit like OrderService)
        if (cart.cartItems && cart.cartItems.length >= 50) {
          throw new BadRequestException('Cart is full. Maximum 50 items allowed');
        }
        
        // Lock the product row for update
        const product = await transactionalEntityManager
          .createQueryBuilder(Product, 'product')
          .setLock('pessimistic_write')
          .where('product.id = :id', { id: addToCartDto.productId })
          .getOne();

        if (!product) {
          throw new EntityNotFoundException('Product');
        }

        if (!product.isActive) {
          throw new BadRequestException('This product is currently unavailable');
        }

        const existingItem = cart.cartItems?.find(
          item => item.product?.id === addToCartDto.productId
        );

        if (existingItem) {
          const newQuantity = existingItem.quantity + addToCartDto.quantity;
          await this.validateQuantityAgainstStock(newQuantity, product, 'increase');
          existingItem.quantity = newQuantity;
          await transactionalEntityManager.save(existingItem);
        } else {
          await this.validateQuantityAgainstStock(addToCartDto.quantity, product, 'increase');
          const newItem = new CartItem();
          newItem.quantity = addToCartDto.quantity;
          newItem.cart = cart;
          newItem.product = product;
          await transactionalEntityManager.save(newItem);
        }

        // Reload cart with updated items within transaction to get fresh data
        const updatedCart = await transactionalEntityManager.findOne(Cart, {
          where: { id: cart.id },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'cartItems.product.images', 'account']
        });
        
        if (!updatedCart) {
          throw new Error('Failed to reload cart after update');
        }

        // Calculate total with fresh cart items - use optimized method
        updatedCart.totalAmount = await this.calculateTotalAmountInTransaction(updatedCart, transactionalEntityManager);
        await transactionalEntityManager.save(updatedCart);
        
        return updatedCart;
      });
    } catch (error) {
      throw error;
    }
  }

  async viewCart(username: string): Promise<Cart> {
    const account = await Account.findOne({ where: { username } });
    if (!account) {
      throw new EntityNotFoundException('Account');
    }

    const cart = await Cart.findOne({
      where: { account: { id: account.id } },
      relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'cartItems.product.images', 'account']
    });

    if (!cart) {
      throw new EntityNotFoundException('Cart');
    }
    
    const updatedCart = await this.updateCartTotals(cart);
    
    return updatedCart;
  }

  async increaseQuantity(username: string, productId: string, amount: number = 1): Promise<Cart> {
    try {
      this.validateQuantity(amount, 'increase');

      return await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {
        // Get cart within transaction to ensure we have the latest cart items
        const account = await transactionalEntityManager.findOne(Account, { where: { username } });
        if (!account) throw new EntityNotFoundException('Account');
        
        const cart = await transactionalEntityManager.findOne(Cart, {
          where: { account: { id: account.id } },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'cartItems.product.images', 'account']
        });
        
        if (!cart) throw new EntityNotFoundException('Cart');
        
        const item = cart.cartItems?.find(item => item.product?.id === productId);
        
        if (!item) {
          throw new BadRequestException('Product not found in cart');
        }
        
        // Lock the product row for update
        const product = await transactionalEntityManager
          .createQueryBuilder(Product, 'product')
          .setLock('pessimistic_write')
          .where('product.id = :id', { id: item.product.id })
          .getOne();

        if (!product) throw new EntityNotFoundException('Product');
        if (!product.isActive) throw new BadRequestException('This product is currently unavailable');

        // Validate against stock for the new total quantity
        const newQuantity = item.quantity + amount;
        await this.validateQuantityAgainstStock(newQuantity, product, 'increase');
        
        item.quantity += amount;
        await transactionalEntityManager.save(item);
        
        // Reload cart with fresh data after updating
        const reloadedCart = await transactionalEntityManager.findOne(Cart, {
          where: { id: cart.id },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'cartItems.product.images', 'account']
        });
        
        if (!reloadedCart) {
          throw new Error('Failed to reload cart after increase');
        }
        
        // Calculate total with optimized method
        reloadedCart.totalAmount = await this.calculateTotalAmountInTransaction(reloadedCart, transactionalEntityManager);
        await transactionalEntityManager.save(reloadedCart);
        
        return reloadedCart;
      });
    } catch (error) {
      throw error;
    }
  }

  async decreaseQuantity(username: string, productId: string, amount: number = 1): Promise<Cart> {
    try {
      this.validateQuantity(amount, 'decrease');

      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new Error('Database connection not available');
      }

      return dataSource.transaction(async transactionalEntityManager => {
        // Get cart within transaction to ensure we have the latest cart items
        const account = await transactionalEntityManager.findOne(Account, { where: { username } });
        if (!account) throw new EntityNotFoundException('Account');
        
        const cart = await transactionalEntityManager.findOne(Cart, {
          where: { account: { id: account.id } },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'cartItems.product.images', 'account']
        });
        
        if (!cart) throw new EntityNotFoundException('Cart');
        
        const item = cart.cartItems?.find(item => item.product?.id === productId);
        
        if (!item) {
          throw new BadRequestException('Product not found in cart');
        }
        
        if (item.quantity < amount) {
          throw new BadRequestException(`Cannot decrease quantity. Current quantity: ${item.quantity}, trying to decrease: ${amount}`);
        }
        
        item.quantity -= amount;
        if (item.quantity <= 0) {
          await transactionalEntityManager.remove(item);
        } else {
          await transactionalEntityManager.save(item);
        }
        
        // Reload cart with fresh data after updating
        const reloadedCart = await transactionalEntityManager.findOne(Cart, {
          where: { id: cart.id },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'cartItems.product.images', 'account']
        });
        
        if (!reloadedCart) {
          throw new Error('Failed to reload cart after decrease');
        }
        
        // Calculate total with fresh cart items
        let total = 0;
        if (reloadedCart.cartItems) {
          for (const cartItem of reloadedCart.cartItems) {
            const product = await transactionalEntityManager.findOne(Product, { where: { id: cartItem.product.id } });
            if (product && product.isActive) {
              total += product.price * cartItem.quantity;
            }
          }
        }
        
        reloadedCart.totalAmount = Number(total.toFixed(2));
        await transactionalEntityManager.save(reloadedCart);
        
        return reloadedCart;
      });
    } catch (error) {
      throw error;
    }
  }

  async removeItem(username: string, productId: string): Promise<Cart> {
    try {
      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new Error('Database connection not available');
      }

      return dataSource.transaction(async transactionalEntityManager => {
        // Get cart within transaction to ensure we have the latest cart items
        const account = await transactionalEntityManager.findOne(Account, { where: { username } });
        if (!account) throw new EntityNotFoundException('Account');
        
        const cart = await transactionalEntityManager.findOne(Cart, {
          where: { account: { id: account.id } },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'cartItems.product.images', 'account']
        });
        
        if (!cart) throw new EntityNotFoundException('Cart');
        
        const item = cart.cartItems?.find(item => item.product?.id === productId);
        
        if (!item) {
          throw new BadRequestException('Product not found in cart');
        }
        
        await transactionalEntityManager.remove(item);
        
        // Reload cart with fresh data after removing item
        const reloadedCart = await transactionalEntityManager.findOne(Cart, {
          where: { id: cart.id },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'cartItems.product.images', 'account']
        });
        
        if (!reloadedCart) {
          throw new Error('Failed to reload cart after removing item');
        }
        
        // Calculate total with fresh cart items
        let total = 0;
        if (reloadedCart.cartItems) {
          for (const cartItem of reloadedCart.cartItems) {
            const product = await transactionalEntityManager.findOne(Product, { where: { id: cartItem.product.id } });
            if (product && product.isActive) {
              total += product.price * cartItem.quantity;
            }
          }
        }
        
        reloadedCart.totalAmount = Number(total.toFixed(2));
        await transactionalEntityManager.save(reloadedCart);
        
        return reloadedCart;
      });
    } catch (error) {
      throw error;
    }
  }

  async clearCart(username: string): Promise<void> {
    try {
      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new Error('Database connection not available');
      }

      return dataSource.transaction(async transactionalEntityManager => {
        // Get cart within transaction to ensure we have the latest cart items
        const account = await transactionalEntityManager.findOne(Account, { where: { username } });
        if (!account) throw new EntityNotFoundException('Account');
        
        const cart = await transactionalEntityManager.findOne(Cart, {
          where: { account: { id: account.id } },
          relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'cartItems.product.images', 'account']
        });
        
        if (!cart) throw new EntityNotFoundException('Cart');
        
        if (cart.cartItems) {
          await transactionalEntityManager.remove(cart.cartItems);
        }
        
        cart.totalAmount = 0;
        await transactionalEntityManager.save(cart);
      });
    } catch (error) {
      throw error;
    }
  }



  async validateCartPrices(username: string): Promise<{
    hasChanges: boolean;
    updatedCart?: Cart;
  }> {
    try {
      const cart = await this.viewCart(username);
      let hasChanges = false;

      for (const item of cart.cartItems) {
        const product = await Product.findOne({ where: { id: item.product.id } });
        if (product && product.price !== item.product.price) {
          hasChanges = true;
          item.product.price = product.price;
          await item.save();
        }
      }

      if (hasChanges) {
        const updatedCart = await this.updateCartTotals(cart);

        return { hasChanges: true, updatedCart };
      }

      return { hasChanges: false };
    } catch (error) {

      throw error;
    }
  }
}