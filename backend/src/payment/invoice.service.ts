import { Service } from "typedi";
import { DbConnection } from "@/database/dbConnection";
import { Invoice, InvoiceStatus } from "./invoice.entity";
import { Order } from "@/order/order.entity";
import { Payment } from "./payment.entity";

@Service()
export class InvoiceService {
  
  /**
   * Generate unique invoice number
   */
  private generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    // Add random component to prevent collisions
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `INV${year}${month}${day}${hours}${minutes}${seconds}${random}`;
  }

  /**
   * Create invoice for COD order
   */
  async createInvoiceForOrder(orderId: string, paymentMethod: string = 'COD'): Promise<Invoice> {
    console.log('[Debug] InvoiceService.createInvoiceForOrder called:', {
      orderId,
      paymentMethod
    });

    return await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {
      // Find order
      const order = await transactionalEntityManager.findOne(Order, {
        where: { id: orderId }
      });

      if (!order) {
        console.error('[Error] Order not found:', orderId);
        throw new Error('Order not found');
      }

      console.log('[Debug] Order found:', {
        orderId: order.id,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        requireInvoice: order.requireInvoice
      });

      // Check if invoice already exists for this order
      const existingInvoice = await transactionalEntityManager.findOne(Invoice, {
        where: { order: { id: orderId } }
      });

      if (existingInvoice) {
        console.log('[Debug] Invoice already exists:', {
          invoiceId: existingInvoice.id,
          invoiceNumber: existingInvoice.invoiceNumber,
          paymentMethod: existingInvoice.paymentMethod
        });
        return existingInvoice;
      }

      // Create new invoice
      const invoice = new Invoice();
      invoice.order = order;
      invoice.invoiceNumber = this.generateInvoiceNumber();
      invoice.totalAmount = order.totalAmount;
      invoice.paymentMethod = paymentMethod;
      invoice.status = paymentMethod === 'COD' ? InvoiceStatus.UNPAID : InvoiceStatus.PAID;
      invoice.notes = `Invoice created for order ${orderId}`;

      console.log('[Debug] Creating new invoice:', {
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        paymentMethod: invoice.paymentMethod,
        status: invoice.status,
        notes: invoice.notes
      });

      // If it's VNPay and there's a payment, link it
      if (paymentMethod === 'VNPAY') {
        const payment = await transactionalEntityManager.findOne(Payment, {
          where: { order: { id: orderId } }
        });
        if (payment) {
          invoice.payment = payment;
          invoice.status = InvoiceStatus.PAID;
          invoice.paidAt = new Date();
          console.log('[Debug] Linked VNPay payment to invoice');
        }
      }

      const savedInvoice = await transactionalEntityManager.save(invoice);

      console.log('[Debug] Invoice saved successfully:', {
        id: savedInvoice.id,
        invoiceNumber: savedInvoice.invoiceNumber,
        paymentMethod: savedInvoice.paymentMethod,
        totalAmount: savedInvoice.totalAmount,
        status: savedInvoice.status
      });

      return savedInvoice;
    });
  }

  /**
   * Mark invoice as paid (for COD when delivered)
   */
  async markInvoiceAsPaid(invoiceId: string): Promise<Invoice> {
    return await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {
      const invoice = await transactionalEntityManager.findOne(Invoice, {
        where: { id: invoiceId },
        relations: ['order']
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status === InvoiceStatus.PAID) {
        throw new Error('Invoice is already paid');
      }

      invoice.status = InvoiceStatus.PAID;
      invoice.paidAt = new Date();
      invoice.notes = (invoice.notes || '') + ` | Marked as paid on ${new Date().toISOString()}`;

      await transactionalEntityManager.save(invoice);

      return invoice;
    });
  }

  /**
   * Get invoice by order ID
   */
  async getInvoiceByOrderId(orderId: string): Promise<Invoice | null> {
    return await DbConnection.appDataSource.manager.findOne(Invoice, {
      where: { order: { id: orderId } },
      relations: ['order', 'order.customer', 'payment']
    });
  }

  /**
   * Get invoice by invoice number
   */
  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    return await DbConnection.appDataSource.manager.findOne(Invoice, {
      where: { invoiceNumber },
      relations: ['order', 'order.customer', 'payment']
    });
  }

  /**
   * Get all invoices for a customer
   */
  async getInvoicesByCustomer(username: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [invoices, total] = await DbConnection.appDataSource.manager.findAndCount(Invoice, {
      where: { order: { customer: { username } } },
      relations: ['order', 'order.customer', 'payment'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    });

    return {
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Cancel invoice
   */
  async cancelInvoice(invoiceId: string, reason?: string): Promise<Invoice> {
    return await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {
      const invoice = await transactionalEntityManager.findOne(Invoice, {
        where: { id: invoiceId }
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status === InvoiceStatus.PAID) {
        throw new Error('Cannot cancel paid invoice');
      }

      invoice.status = InvoiceStatus.CANCELLED;
      invoice.notes = (invoice.notes || '') + ` | Cancelled: ${reason || 'No reason provided'}`;

      await transactionalEntityManager.save(invoice);

      return invoice;
    });
  }
} 