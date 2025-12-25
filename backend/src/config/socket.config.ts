import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Account } from "../auth/account/account.entity";

let io: Server | null = null;

// Extend Socket interface to include our custom properties
declare module "socket.io" {
    interface Socket {
        accountId?: string;
        account?: Account;
    }
}

/**
 * Initialize Socket.io server
 */
export function initializeSocket(server: any) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true,
    });

    // Log khi socket.io được khởi tạo
    if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Socket.io initialized');
    }

    // Authentication middleware for Socket.io
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");

            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret") as any;
            // Note: In EXE101, Account entity is used instead of User
            // Assuming the JWT payload contains accountId
            const account = await Account.findOne({
                where: { id: decoded.accountId || decoded.userId },
                relations: ['role']
            });

            if (!account || !account.isRegistered) {
                return next(new Error("Authentication error: Account not found or not registered"));
            }

            socket.accountId = account.id.toString();
            socket.account = account;
            next();
        } catch (error) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        // Join user's personal room
        socket.join(`account:${socket.accountId}`);

        if (process.env.NODE_ENV !== 'production') {
            console.log(`🔌 User ${socket.accountId} connected to Socket.IO`);
        }
    });

    return io;
}

/**
 * Get Socket.io instance
 */
export function getIO(): Server {
    if (!io) {
        throw new Error("Socket.io not initialized. Call initializeSocket first.");
    }
    return io;
}

/**
 * Emit notification to a specific account
 */
export function emitNotification(accountId: string, notification: any) {
    const socketIO = getIO();
    socketIO.to(`account:${accountId}`).emit("notification", notification);

    if (process.env.NODE_ENV !== 'production') {
        console.log(`📤 Notification sent to account ${accountId}`);
    }
}

/**
 * Emit notification to multiple accounts
 */
export function emitNotificationToAccounts(accountIds: string[], notification: any) {
    const socketIO = getIO();
    accountIds.forEach((accountId) => {
        socketIO.to(`account:${accountId}`).emit("notification", notification);
    });

    if (process.env.NODE_ENV !== 'production') {
        console.log(`📤 Notification sent to ${accountIds.length} accounts`);
    }
}

/**
 * Emit order update event to a specific account
 */
export function emitOrderUpdate(accountId: string, orderData: any) {
    const socketIO = getIO();
    socketIO.to(`account:${accountId}`).emit("order-update", orderData);

    if (process.env.NODE_ENV !== 'production') {
        console.log(`📦 Order update sent to account ${accountId}`);
    }
}

/**
 * Emit payment update event to a specific account
 */
export function emitPaymentUpdate(accountId: string, paymentData: any) {
    const socketIO = getIO();
    socketIO.to(`account:${accountId}`).emit("payment-update", paymentData);

    if (process.env.NODE_ENV !== 'production') {
        console.log(`💳 Payment update sent to account ${accountId}`);
    }
}

/**
 * Emit shipping update event to a specific account
 */
export function emitShippingUpdate(accountId: string, shippingData: any) {
    const socketIO = getIO();
    socketIO.to(`account:${accountId}`).emit("shipping-update", shippingData);

    if (process.env.NODE_ENV !== 'production') {
        console.log(`🚚 Shipping update sent to account ${accountId}`);
    }
}

/**
 * Emit feedback update event (for admins)
 */
export function emitFeedbackUpdate(feedbackData: any) {
    const socketIO = getIO();
    // Emit to admin room (can be enhanced with role-based rooms)
    socketIO.to("admins").emit("new-feedback", feedbackData);

    if (process.env.NODE_ENV !== 'production') {
        console.log(`💬 New feedback notification sent to admins`);
    }
}

/**
 * Emit RFQ update event (for admins)
 */
export function emitRFQUpdate(rfqData: any) {
    const socketIO = getIO();
    // Emit to admin room (can be enhanced with role-based rooms)
    socketIO.to("admins").emit("new-rfq", rfqData);

    if (process.env.NODE_ENV !== 'production') {
        console.log(`📋 New RFQ notification sent to admins`);
    }
}

/**
 * Emit data update event (generic for any entity type)
 */
export function emitDataUpdate(accountId: string, entityType: string, data: any) {
    const socketIO = getIO();
    socketIO.to(`account:${accountId}`).emit("data-updated", {
        entityType,
        data,
    });

    if (process.env.NODE_ENV !== 'production') {
        console.log(`🔄 Data update (${entityType}) sent to account ${accountId}`);
    }
}
