// utils/socketManager.ts
import { socketService } from '@/plugins/socket';

class SocketConnectionManager {
  private activeConnections = new Set<string>();
  private connectionPromises = new Map<string, Promise<any>>();
  
  async connectWithRetry(context: string, maxRetries = 3): Promise<void> {
    const key = `${context}_${Date.now()}`;
    
    // If already connecting for this context, wait for existing promise
    if (this.connectionPromises.has(context)) {
      return this.connectionPromises.get(context)!;
    }
    
    const connectPromise = this._connectWithRetry(context, maxRetries);
    this.connectionPromises.set(context, connectPromise);
    
    try {
      await connectPromise;
    } finally {
      this.connectionPromises.delete(context);
    }
  }
  
  private async _connectWithRetry(context: string, maxRetries: number): Promise<void> {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        if (socketService.isConnected) {
          return;
        }
        
        console.log(`[${context}] Connecting socket (attempt ${attempts + 1})...`);
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Connection timeout'));
          }, 10000);
          
          const onConnect = () => {
            clearTimeout(timeout);
            socketService.off('connect', onConnect);
            socketService.off('connect_error', onConnectError);
            resolve(true);
          };
          
          const onConnectError = (error: Error) => {
            clearTimeout(timeout);
            socketService.off('connect', onConnect);
            socketService.off('connect_error', onConnectError);
            reject(error);
          };
          
          socketService.once('connect', onConnect);
          socketService.once('connect_error', onConnectError);
          
          socketService.connect();
        });
        
        console.log(`[${context}] Socket connected successfully`);
        return;
        
      } catch (error) {
        attempts++;
        console.error(`[${context}] Connection failed (attempt ${attempts}):`, error);
        
        if (attempts >= maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.min(1000 * Math.pow(2, attempts), 10000))
        );
      }
    }
  }
  
  disconnectAll(): void {
    this.activeConnections.clear();
    this.connectionPromises.clear();
    socketService.disconnect();
  }
}

export const socketManager = new SocketConnectionManager();