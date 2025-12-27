import { Product } from "@/product/product.entity";
import { Category } from "@/product/categories/category.entity";
import { Role } from "@/role/role.entity";
import { Account } from "@/auth/account/account.entity";
import { ShipperProfile } from "@/auth/shipperProfile.entity";
import { Cart } from "@/cart/cart.entity";
import { CartItem } from "@/cart/cartItem.entity";
import { Order } from "@/order/order.entity";
import { OrderDetail } from "@/order/orderDetail.entity";
import { OrderStatus } from "@/order/dtos/update-order.dto";
import { Feedback } from "@/feedback/feedback.entity";
import { RFQ } from "@/rfq/rfq.entity";
import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hash password helper
 */
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Tạo hoặc lấy roles nếu chưa có
 */
export async function seedRoles(): Promise<Record<string, Role>> {
  const roles: Record<string, Role> = {};

  const roleNames = ["admin", "manager", "staff", "customer", "shipper"];

  for (const roleName of roleNames) {
    let role = await Role.findOne({ where: { slug: roleName } });
    if (!role) {
      role = new Role();
      role.name = roleName;
      role.slug = roleName;
      await role.save();
      console.log(`✅ Created role: ${roleName}`);
    } else {
      console.log(`ℹ️  Role already exists: ${roleName}`);
    }
    roles[roleName] = role;
  }

  return roles;
}

/**
 * Tạo sample accounts cho các roles khác nhau
 */
export async function seedAccounts(roles: Record<string, Role>): Promise<Record<string, Account[]>> {
  const accountsByRole: Record<string, Account[]> = {
    admin: [],
    manager: [],
    staff: [],
    customer: [],
    shipper: [],
  };

  // Admin accounts
  const adminAccounts = [
    {
      username: "admin",
      password: "Admin123!@#",
      phone: "0912345678",
      email: "admin@technicalstore.com",
      fullName: "Administrator",
    },
    {
      username: "admin2",
      password: "Admin123!@#",
      phone: "0912345679",
      email: "admin2@technicalstore.com",
      fullName: "Administrator 2",
    },
  ];

  for (const accData of adminAccounts) {
    let account = await Account.findOne({ where: { username: accData.username } });
    if (!account) {
      account = new Account();
      account.username = accData.username;
      account.password = await hashPassword(accData.password);
      account.phone = accData.phone;
      account.email = accData.email;
      account.name = accData.fullName;
      account.isRegistered = true;
      account.role = roles.admin;
      await account.save();
      console.log(`✅ Created admin account: ${accData.username}`);
    } else {
      console.log(`ℹ️  Admin account already exists: ${accData.username}`);
    }
    accountsByRole.admin.push(account);
  }

  // Manager accounts
  const managerAccounts = [
    {
      username: "manager1",
      password: "Manager123!@#",
      phone: "0922345678",
      email: "manager1@technicalstore.com",
      fullName: "Manager One",
    },
    {
      username: "manager2",
      password: "Manager123!@#",
      phone: "0922345679",
      email: "manager2@technicalstore.com",
      fullName: "Manager Two",
    },
  ];

  for (const accData of managerAccounts) {
    let account = await Account.findOne({ where: { username: accData.username } });
    if (!account) {
      account = new Account();
      account.username = accData.username;
      account.password = await hashPassword(accData.password);
      account.phone = accData.phone;
      account.email = accData.email;
      account.name = accData.fullName;
      account.isRegistered = true;
      account.role = roles.manager;
      await account.save();
      console.log(`✅ Created manager account: ${accData.username}`);
    } else {
      console.log(`ℹ️  Manager account already exists: ${accData.username}`);
    }
    accountsByRole.manager.push(account);
  }

  // Staff accounts
  const staffAccounts = [
    {
      username: "staff1",
      password: "Staff123!@#",
      phone: "0932345678",
      email: "staff1@technicalstore.com",
      fullName: "Staff One",
    },
    {
      username: "staff2",
      password: "Staff123!@#",
      phone: "0932345679",
      email: "staff2@technicalstore.com",
      fullName: "Staff Two",
    },
    {
      username: "staff3",
      password: "Staff123!@#",
      phone: "0932345680",
      email: "staff3@technicalstore.com",
      fullName: "Staff Three",
    },
  ];

  for (const accData of staffAccounts) {
    let account = await Account.findOne({ where: { username: accData.username } });
    if (!account) {
      account = new Account();
      account.username = accData.username;
      account.password = await hashPassword(accData.password);
      account.phone = accData.phone;
      account.email = accData.email;
      account.name = accData.fullName;
      account.isRegistered = true;
      account.role = roles.staff;
      await account.save();
      console.log(`✅ Created staff account: ${accData.username}`);
    } else {
      console.log(`ℹ️  Staff account already exists: ${accData.username}`);
    }
    accountsByRole.staff.push(account);
  }

  // Customer accounts
  const customerAccounts = [
    {
      username: "customer1",
      password: "Customer123!@#",
      phone: "0942345678",
      email: "customer1@example.com",
      fullName: "Nguyễn Văn A",
    },
    {
      username: "customer2",
      password: "Customer123!@#",
      phone: "0942345679",
      email: "customer2@example.com",
      fullName: "Trần Thị B",
    },
    {
      username: "customer3",
      password: "Customer123!@#",
      phone: "0942345680",
      email: "customer3@example.com",
      fullName: "Lê Văn C",
    },
    {
      username: "customer4",
      password: "Customer123!@#",
      phone: "0942345681",
      email: "customer4@example.com",
      fullName: "Phạm Thị D",
    },
    {
      username: "customer5",
      password: "Customer123!@#",
      phone: "0942345682",
      email: "customer5@example.com",
      fullName: "Hoàng Văn E",
    },
  ];

  for (const accData of customerAccounts) {
    let account = await Account.findOne({ where: { username: accData.username } });
    if (!account) {
      account = new Account();
      account.username = accData.username;
      account.password = await hashPassword(accData.password);
      account.phone = accData.phone;
      account.email = accData.email;
      account.name = accData.fullName;
      account.isRegistered = true;
      account.role = roles.customer;
      await account.save();
      console.log(`✅ Created customer account: ${accData.username}`);
    } else {
      console.log(`ℹ️  Customer account already exists: ${accData.username}`);
    }
    accountsByRole.customer.push(account);
  }

  // Shipper accounts
  const shipperAccounts = [
    {
      username: "shipper1",
      password: "Shipper123!@#",
      phone: "0952345678",
      email: "shipper1@technicalstore.com",
      fullName: "Shipper One",
      maxOrdersPerDay: 50,
      isAvailable: true,
      priority: 1,
    },
    {
      username: "shipper2",
      password: "Shipper123!@#",
      phone: "0952345679",
      email: "shipper2@technicalstore.com",
      fullName: "Shipper Two",
      maxOrdersPerDay: 40,
      isAvailable: true,
      priority: 2,
    },
    {
      username: "shipper3",
      password: "Shipper123!@#",
      phone: "0952345680",
      email: "shipper3@technicalstore.com",
      fullName: "Shipper Three",
      maxOrdersPerDay: 30,
      isAvailable: false,
      priority: 3,
    },
  ];

  for (const accData of shipperAccounts) {
    let account = await Account.findOne({ where: { username: accData.username } });
    if (!account) {
      account = new Account();
      account.username = accData.username;
      account.password = await hashPassword(accData.password);
      account.phone = accData.phone;
      account.email = accData.email;
      account.name = accData.fullName;
      account.isRegistered = true;
      account.role = roles.shipper;
      await account.save();

      // Create shipper profile
      const shipperProfile = new ShipperProfile();
      shipperProfile.account = account;
      shipperProfile.maxOrdersPerDay = accData.maxOrdersPerDay;
      shipperProfile.currentOrdersToday = 0;
      shipperProfile.isAvailable = accData.isAvailable;
      shipperProfile.priority = accData.priority;
      await shipperProfile.save();

      console.log(`✅ Created shipper account: ${accData.username}`);
    } else {
      console.log(`ℹ️  Shipper account already exists: ${accData.username}`);
      // Ensure shipperProfile relation is loaded for existing accounts
      if (!account.shipperProfile) {
        const reloadedAccount = await Account.findOne({
          where: { id: account.id },
          relations: ["shipperProfile"]
        });
        if (reloadedAccount) {
          account = reloadedAccount;
        }
      }
    }
    accountsByRole.shipper.push(account);
  }

  return accountsByRole;
}

/**
 * Tạo carts cho customers
 */
export async function seedCarts(customerAccounts: Account[]): Promise<Cart[]> {
  const carts: Cart[] = [];

  for (const customer of customerAccounts) {
    let cart = await Cart.findOne({
      where: { account: { id: customer.id } },
      relations: ["account"],
    });

    if (!cart) {
      cart = new Cart();
      cart.account = customer;
      cart.totalAmount = 0;
      await cart.save();
      console.log(`✅ Created cart for customer: ${customer.username}`);
    } else {
      console.log(`ℹ️  Cart already exists for customer: ${customer.username}`);
    }
    carts.push(cart);
  }

  return carts;
}

/**
 * Tạo cart items sử dụng products có sẵn
 */
export async function seedCartItems(carts: Cart[]): Promise<CartItem[]> {
  const cartItems: CartItem[] = [];

  // Lấy một số products ngẫu nhiên
  const allProducts = await Product.find({
    where: { isActive: true },
  });

  if (allProducts.length === 0) {
    console.log("⚠️  No products found. Please seed products first.");
    console.log("   Total products in DB:", await Product.count());
    return [];
  }

  console.log(`ℹ️  Found ${allProducts.length} active products`);
  const products = allProducts.slice(0, Math.min(20, allProducts.length));

  // Tạo cart items cho mỗi cart
  for (const cart of carts) {
    // Kiểm tra số items hiện có
    const existingItemsCount = await CartItem.count({
      where: { cart: { id: cart.id } },
    });

    // Chỉ tạo items nếu cart chưa có items hoặc có ít items
    if (existingItemsCount === 0 || existingItemsCount < 3) {
      // Mỗi cart có 1-5 items
      const itemCount = Math.floor(Math.random() * 5) + 1;
      const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
      const selectedProducts = shuffledProducts.slice(0, itemCount);

      for (const product of selectedProducts) {
        // Kiểm tra xem đã có item này chưa
        const existingItem = await CartItem.findOne({
          where: {
            cart: { id: cart.id },
            product: { id: product.id },
          },
          relations: ["cart", "product"],
        });

        if (!existingItem) {
          const cartItem = new CartItem();
          cartItem.cart = cart;
          cartItem.product = product;
          cartItem.quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
          await cartItem.save();
          cartItems.push(cartItem);
          console.log(`✅ Added item ${product.name} to cart ${cart.account?.username}`);
        }
      }
    } else {
      console.log(`ℹ️  Cart ${cart.account?.username} already has ${existingItemsCount} items, skipping...`);
    }

    // Update cart total
    const allItems = await CartItem.find({
      where: { cart: { id: cart.id } },
      relations: ["product"],
    });
    if (allItems.length > 0) {
      cart.totalAmount = allItems.reduce(
        (sum, item) => sum + parseFloat(item.product.price.toString()) * item.quantity,
        0
      );
      await cart.save();
    }
  }

  return cartItems;
}

/**
 * Tạo orders với các status khác nhau
 */
export async function seedOrders(
  customerAccounts: Account[],
  shipperAccounts: Account[]
): Promise<Order[]> {
  const orders: Order[] = [];

  // Lấy products
  const allProducts = await Product.find({
    where: { isActive: true },
  });

  if (allProducts.length === 0) {
    console.log("⚠️  No products found. Please seed products first.");
    console.log("   Total products in DB:", await Product.count());
    return [];
  }

  console.log(`ℹ️  Found ${allProducts.length} active products for orders`);
  const products = allProducts.slice(0, Math.min(30, allProducts.length));

  const statuses: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.ASSIGNED,
    OrderStatus.CONFIRMED,
    OrderStatus.SHIPPING,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

  const addresses = [
    "123 Nguyễn Huệ, Quận 1, TP.HCM",
    "456 Lê Lợi, Quận 3, TP.HCM",
    "789 Võ Văn Tần, Quận 3, TP.HCM",
    "321 Trần Hưng Đạo, Quận 5, TP.HCM",
    "654 Nguyễn Trãi, Quận 5, TP.HCM",
  ];

  const paymentMethods = ["VNPay", "COD"];

  // Tạo orders cho mỗi customer
  for (const customer of customerAccounts) {
    // Kiểm tra số orders hiện có
    const existingOrdersCount = await Order.count({
      where: { customer: { id: customer.id } },
    });

    // Mỗi customer có ít nhất 2-5 orders (nếu chưa có hoặc có ít hơn 3)
    let orderCount = 0;
    if (existingOrdersCount === 0) {
      orderCount = Math.floor(Math.random() * 4) + 2; // 2-5 orders
    } else if (existingOrdersCount < 3) {
      orderCount = Math.floor(Math.random() * 3) + 1; // 1-3 orders để đạt tối thiểu
    } else {
      console.log(`ℹ️  Customer ${customer.username} already has ${existingOrdersCount} orders, skipping...`);
      continue;
    }

    for (let i = 0; i < orderCount; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30)); // Orders trong 30 ngày qua

      const order = new Order();
      order.customer = customer;
      order.orderDate = orderDate;
      order.status = status;
      order.shippingAddress = addresses[Math.floor(Math.random() * addresses.length)];
      order.paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      order.requireInvoice = Math.random() > 0.5;
      if (Math.random() > 0.7) {
        order.note = `Ghi chú đơn hàng ${i + 1}`;
      }

      // Assign shipper nếu status >= ASSIGNED và có shipper available
      if (
        status !== OrderStatus.PENDING &&
        status !== OrderStatus.CANCELLED &&
        shipperAccounts.length > 0
      ) {
        const availableShippers = shipperAccounts.filter((s) => s.shipperProfile?.isAvailable);
        if (availableShippers.length > 0) {
          order.shipper =
            availableShippers[Math.floor(Math.random() * availableShippers.length)];
        }
      }

      if (status === OrderStatus.CANCELLED) {
        order.cancelReason = "Khách hàng yêu cầu hủy đơn hàng";
      }

      // Tạo order details trước
      const orderDetailCount = Math.floor(Math.random() * 5) + 1; // 1-5 items
      const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
      const selectedProducts = shuffledProducts.slice(0, orderDetailCount);

      let totalAmount = 0;
      const orderDetails: OrderDetail[] = [];

      for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = parseFloat(product.price.toString());
        totalAmount += price * quantity;

        const orderDetail = new OrderDetail();
        orderDetail.product = product;
        orderDetail.quantity = quantity;
        orderDetail.price = price;
        orderDetails.push(orderDetail);
      }

      order.totalAmount = totalAmount;
      await order.save();

      // Save order details
      for (const orderDetail of orderDetails) {
        orderDetail.order = order;
        await orderDetail.save();
      }

      orders.push(order);
      console.log(
        `✅ Created order ${order.id.substring(0, 8)}... for customer ${customer.username} with status ${status}`
      );
    }
  }

  return orders;
}

/**
 * Tạo feedbacks từ customers về products
 */
export async function seedFeedbacks(
  customerAccounts: Account[],
  products: Product[]
): Promise<Feedback[]> {
  const feedbacks: Feedback[] = [];

  const feedbackContents = [
    "Sản phẩm rất tốt, đúng như mô tả!",
    "Giao hàng nhanh, đóng gói cẩn thận.",
    "Sản phẩm chất lượng tốt, giá cả hợp lý.",
    "Hài lòng với sản phẩm, sẽ mua lại.",
    "Đúng với kỳ vọng, recommend!",
    "Sản phẩm ổn, nhưng có thể tốt hơn.",
    "Giá hơi cao nhưng chất lượng tốt.",
    "Phục vụ tốt, sản phẩm đúng như hình.",
  ];

  // Mỗi customer tạo 2-5 feedbacks
  for (const customer of customerAccounts) {
    // Kiểm tra số feedbacks hiện có
    const existingFeedbacksCount = await Feedback.count({
      where: { account: { id: customer.id } },
    });

    // Chỉ tạo feedbacks mới nếu chưa có hoặc có ít
    if (existingFeedbacksCount < 5) {
      const feedbackCount = Math.floor(Math.random() * 4) + 2;
      const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
      const selectedProducts = shuffledProducts.slice(0, feedbackCount);

      for (const product of selectedProducts) {
        // Kiểm tra xem đã có feedback chưa
        const existingFeedback = await Feedback.findOne({
          where: {
            account: { id: customer.id },
            product: { id: product.id },
          },
          relations: ["account", "product"],
        });

        if (!existingFeedback) {
          const feedback = new Feedback();
          feedback.account = customer;
          feedback.product = product;
          feedback.content =
            feedbackContents[Math.floor(Math.random() * feedbackContents.length)];
          await feedback.save();
          feedbacks.push(feedback);
          console.log(
            `✅ Created feedback from ${customer.username} for product ${product.name}`
          );
        }
      }
    } else {
      console.log(`ℹ️  Customer ${customer.username} already has ${existingFeedbacksCount} feedbacks, skipping...`);
    }
  }

  return feedbacks;
}

/**
 * Tạo RFQs (Request For Quotation)
 */
export async function seedRFQs(customerAccounts: Account[]): Promise<RFQ[]> {
  const rfqs: RFQ[] = [];

  // Lấy products
  const allProducts = await Product.find({
    where: { isActive: true },
  });

  if (allProducts.length === 0) {
    console.log("⚠️  No products found. Please seed products first.");
    console.log("   Total products in DB:", await Product.count());
    return [];
  }

  console.log(`ℹ️  Found ${allProducts.length} active products for RFQs`);
  const products = allProducts.slice(0, Math.min(50, allProducts.length));

  // Mỗi customer có 0-3 RFQs
  for (const customer of customerAccounts) {
    // Kiểm tra số RFQs hiện có
    const existingRFQsCount = await RFQ.count({
      where: { account: { id: customer.id } },
    });

    // Chỉ tạo RFQs mới nếu chưa có hoặc có ít
    const targetRFQCount = existingRFQsCount === 0 ? Math.floor(Math.random() * 4) : 0;
    const rfqCount = targetRFQCount;

    for (let i = 0; i < rfqCount; i++) {
      const rfq = new RFQ();
      rfq.account = customer;

      // Chọn 3-10 products ngẫu nhiên
      const productCount = Math.floor(Math.random() * 8) + 3;
      const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
      rfq.products = shuffledProducts.slice(0, productCount);

      // Tính tổng amount (giả sử mỗi product quantity = 1)
      rfq.amount = rfq.products.reduce(
        (sum, p) => sum + parseFloat(p.price.toString()),
        0
      );

      rfq.fulfilled = Math.random() > 0.6; // 40% fulfilled

      await rfq.save();
      rfqs.push(rfq);
      console.log(
        `✅ Created RFQ ${rfq.id.substring(0, 8)}... for customer ${customer.username} with ${rfq.products.length} products`
      );
    }
  }

  return rfqs;
}

/**
 * Main function để seed tất cả data
 */
export async function seedAllData(): Promise<void> {
  console.log("🌱 Starting data seeding process...\n");

  try {
    // Kiểm tra products trước
    const totalProducts = await Product.count();
    const activeProducts = await Product.count({ where: { isActive: true } });
    console.log(`📦 Products check: ${totalProducts} total, ${activeProducts} active\n`);
    
    if (activeProducts === 0) {
      console.log("⚠️  WARNING: No active products found!");
      console.log("   Please seed products first before running this script.\n");
      console.log("   You can use products-script.ts to seed products.\n");
    }
    // 1. Seed roles
    console.log("📋 Step 1: Seeding roles...");
    const roles = await seedRoles();
    console.log("✅ Roles seeded successfully\n");

    // 2. Seed accounts
    console.log("👥 Step 2: Seeding accounts...");
    const accountsByRole = await seedAccounts(roles);
    console.log("✅ Accounts seeded successfully\n");

    // 3. Seed carts
    console.log("🛒 Step 3: Seeding carts...");
    const carts = await seedCarts(accountsByRole.customer);
    console.log("✅ Carts seeded successfully\n");

    // 4. Seed cart items
    console.log("🛍️  Step 4: Seeding cart items...");
    const cartItems = await seedCartItems(carts);
    if (cartItems.length === 0) {
      console.log("⚠️  Warning: No cart items were created. Check if products exist.\n");
    } else {
      console.log(`✅ Cart items seeded successfully (${cartItems.length} items)\n`);
    }

    // 5. Seed orders
    console.log("📦 Step 5: Seeding orders...");
    const orders = await seedOrders(accountsByRole.customer, accountsByRole.shipper);
    if (orders.length === 0) {
      console.log("⚠️  Warning: No orders were created. Check if products exist.\n");
    } else {
      console.log(`✅ Orders seeded successfully (${orders.length} orders)\n`);
    }

    // 6. Seed feedbacks
    console.log("💬 Step 6: Seeding feedbacks...");
    const productsForFeedback = await Product.find({ where: { isActive: true }, take: 50 });
    let feedbacks: Feedback[] = [];
    if (productsForFeedback.length === 0) {
      console.log("⚠️  Warning: No products found for feedbacks. Check if products exist.\n");
    } else {
      feedbacks = await seedFeedbacks(accountsByRole.customer, productsForFeedback);
      console.log(`✅ Feedbacks seeded successfully (${feedbacks.length} feedbacks)\n`);
    }

    // 7. Seed RFQs
    console.log("📋 Step 7: Seeding RFQs...");
    const rfqs = await seedRFQs(accountsByRole.customer);
    if (rfqs.length === 0) {
      console.log("⚠️  Warning: No RFQs were created. Check if products exist.\n");
    } else {
      console.log(`✅ RFQs seeded successfully (${rfqs.length} RFQs)\n`);
    }

    console.log("🎉 Data seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Products: ${totalProducts} total, ${activeProducts} active`);
    console.log(`   - Roles: ${Object.keys(roles).length}`);
    console.log(`   - Admin accounts: ${accountsByRole.admin.length}`);
    console.log(`   - Manager accounts: ${accountsByRole.manager.length}`);
    console.log(`   - Staff accounts: ${accountsByRole.staff.length}`);
    console.log(`   - Customer accounts: ${accountsByRole.customer.length}`);
    console.log(`   - Shipper accounts: ${accountsByRole.shipper.length}`);
    console.log(`   - Carts: ${carts.length}`);
    console.log(`   - Cart items: ${cartItems.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Feedbacks: ${feedbacks.length}`);
    console.log(`   - RFQs: ${rfqs.length}`);
    
    if (activeProducts === 0) {
      console.log("\n⚠️  NOTE: No active products found. Some data (cart items, orders, feedbacks, RFQs) may not be created.");
      console.log("   Please seed products first to get complete data.");
    }
  } catch (error) {
    console.error("❌ Error during data seeding:", error);
    throw error;
  }
}

