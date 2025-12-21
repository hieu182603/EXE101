import { Service } from "typedi";
import { DbConnection } from "@/database/dbConnection";
import { Payment } from "./payment.entity";
import { Order } from "@/order/order.entity";
import { Account } from "@/auth/account/account.entity";
import {
  PaymentStatusDto,
} from "./dtos/payment.dto";
import { OrderStatus } from "@/order/dtos/update-order.dto";
import { CartService } from "@/Cart/cart.service";

@Service()
export class PaymentService {

  /**
   * Get payment status by order ID
   */
  async getPaymentStatus(
    orderId: string,
    username: string
  ): Promise<PaymentStatusDto> {
    // Build query conditions based on whether it's an authenticated user or guest order
    let whereCondition: any = { order: { id: orderId } };
    
    if (username) {
      // For authenticated users, ensure they can only access their own orders
      whereCondition.order.customer = { username };
    } else {
      // For guest orders, ensure the order has no customer (is a guest order)
      whereCondition.order.customer = null;
    }

    const payment = await DbConnection.appDataSource.manager.findOne(Payment, {
      where: whereCondition,
      relations: ["order", "order.customer"],
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    return {
      orderId: payment.order.id,
      status: payment.status,
      amount: payment.amount,
      transactionId: payment.id,
      paymentMethod: payment.method,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(
    username: string,
    page: number = 1,
    limit: number = 10
  ) {
    // Payment history is only available for authenticated users
    if (!username) {
      throw new Error("Payment history is only available for authenticated users");
    }

    const skip = (page - 1) * limit;

    const [payments, total] =
      await DbConnection.appDataSource.manager.findAndCount(Payment, {
        where: { order: { customer: { username } } },
        relations: ["order", "order.customer"],
        order: { createdAt: "DESC" },
        skip,
        take: limit,
      });

    return {
      payments: payments.map((payment) => ({
        id: payment.id,
        orderId: payment.order.id,
        status: payment.status,
        amount: payment.amount,
        method: payment.method,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      })),
      total,
    };
  }

  /**
   * Update payment and order status
   */
  async updatePaymentStatus(
    orderId: string,
    status: string,
    amount: string
  ): Promise<void> {
    await DbConnection.appDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        // Find order
        const order = await transactionalEntityManager.findOne(Order, {
          where: { id: orderId },
        });

        if (!order) {
          throw new Error("Order not found");
        }

        // Create or update payment record
        let payment = await transactionalEntityManager.findOne(Payment, {
          where: { order: { id: orderId } },
        });

        if (!payment) {
          payment = new Payment();
          payment.order = order;
          payment.method = "Card";
        }

        payment.amount = parseFloat(amount) / 100; // Convert from VND (divide by 100)
        payment.status = status;
        await transactionalEntityManager.save(payment);

        // Update order status
        if (status === "completed") {
          order.status = OrderStatus.SHIPPING;
          order.paymentMethod = "Card";
          await transactionalEntityManager.save(order);
          if (!order.customer) return;
          await new CartService().clearCart(order.customer.username);
        }
      }
    );
    console.log("Payment status updated successfully");
  }

  /**
   * Sort object by keys
   */
  private sortObject(obj: any): any {
    const sorted: any = {};
    const str = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (const key of str) {
      sorted[key] = obj[key];
    }
    return sorted;
  }
}
