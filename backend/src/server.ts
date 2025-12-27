import App from './app';
import { createServer } from "http";
import { initializeSocket } from "./config/socket.config";
import { DbConnection } from './database/dbConnection';

const app = new App();
const server = createServer(app.getServer());

async function start() {
  try {
    // Validate required environment variables
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET environment variable is required");
      process.exit(1);
    }

    const port = parseInt(process.env.PORT || '3000');
    const host = process.env.HOST || '0.0.0.0';

    // Ensure database connection established before accepting requests
    try {
      const ds = await DbConnection.createConnection();
      if (!ds) {
        throw new Error('Database connection could not be established');
      }
      console.log('✅ Database connection ready (server will start)');
    } catch (dbError) {
      console.error('❌ Failed to initialize database connection:', dbError);
      // Fail fast in development so the developer can fix DB config
      process.exit(1);
    }

    // Initialize Socket.io
    try {
      initializeSocket(server);

      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Socket.io server ready');
      } else {
        console.log('✅ Socket.io initialized');
      }
    } catch (socketError) {
      console.error("⚠️ Failed to initialize Socket.io:", socketError);
      // Don't exit - Socket.io is not critical for basic API functionality
    }

    // Start server
    server.listen(port, host, () => {
      // Print a friendly URL for developers. Binding to 0.0.0.0 is fine
      // (listen on all interfaces), but `http://0.0.0.0` is not a routable
      // address in browsers — use localhost for clickable link.
      const displayHost = host === '0.0.0.0' ? 'localhost' : host;
      const serverUrl = `http://${displayHost}:${port}`;
      const docsUrl = `${serverUrl}/api-docs`;

      // Server startup info (chỉ trong development)
      if (process.env.NODE_ENV !== 'production') {
        console.log("\n🚀 ========================================");
        console.log(`✅ Server đang chạy tại: ${serverUrl}`);
        console.log(`📚 API Documentation: ${docsUrl}`);
        console.log("🚀 ========================================\n");
      } else {
        // Production logging
        console.log(`✅ Server listening on ${host}:${port}`);
        console.log(`✅ Health check available at /api/health`);
      }
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

start();
