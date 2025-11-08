// src/services/transactionService.ts
import { escrowService } from './escrowService';
import { receiptService, DigitalReceipt, ReceiptItem } from './receiptService';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Transaction Service
 * High-level service that coordinates:
 * - Payment initiation (MoMo/Airtel/Card)
 * - Escrow creation & management
 * - Digital receipt generation
 * - Transaction completion flow
 * 
 * Flow:
 * 1. Farmer initiates payment for cargo
 * 2. Payment processed via MoMo/Airtel/Card
 * 3. Escrow created (holds payment)
 * 4. Digital receipt generated
 * 5. Receipt emailed to both parties
 * 6. Upon delivery: Escrow released to transporter
 * 7. Or on failure: Escrow refunded to farmer
 */

export interface TransactionRequest {
  orderId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerEmail: string;
  farmerLocation?: string;
  
  transporterId: string;
  transporterName: string;
  transporterPhone: string;
  transporterEmail: string;
  transporterVehicleInfo?: string;
  
  cargoDescription: string;
  cargoQuantity: number;
  cargoUnit: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  estimatedDeliveryTime: string;
  
  paymentMethod: 'momo' | 'airtel' | 'card' | 'bank_transfer';
  phoneNumber: string;
  email: string;
  
  items: ReceiptItem[];
  platformFee?: number;
  notes?: string;
}

export interface TransactionResult {
  success: boolean;
  transactionId: string;
  escrowId?: string;
  receiptId?: string;
  paymentStatus: string;
  message: string;
  receiptUrl?: string;
  error?: string;
}

export interface TransactionStatus {
  transactionId: string;
  orderId: string;
  status: 'pending' | 'payment_processing' | 'escrow_held' | 'escrow_released' | 'completed' | 'refunded' | 'disputed';
  escrowId?: string;
  receiptId?: string;
  paymentMethod: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  events: TransactionEvent[];
}

export interface TransactionEvent {
  type: 'payment_initiated' | 'payment_completed' | 'escrow_created' | 'receipt_generated' | 'receipt_emailed' | 'delivery_confirmed' | 'escrow_released' | 'refund_initiated' | 'refund_completed' | 'dispute_raised';
  timestamp: string;
  details?: any;
}

class TransactionServiceClass {
  private storagePrefix = 'transaction_';
  private transactionIndexKey = 'transaction_index';

  /**
   * Initiate complete transaction
   * This is the main entry point for farmers to make payments
   */
  async initiateTransaction(
    request: TransactionRequest
  ): Promise<TransactionResult> {
    try {
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Track transaction status
      await this.createTransactionRecord(
        transactionId,
        request,
        'payment_processing'
      );

      // Log event
      await this.addEvent(transactionId, 'payment_initiated', {
        method: request.paymentMethod,
        amount: request.items.reduce((sum, item) => sum + item.total, 0),
      });

      // Step 1: Process payment
      const paymentResult = await this.processPayment(
        transactionId,
        request
      );

      if (!paymentResult.success) {
        await this.updateTransactionStatus(transactionId, 'pending');
        return {
          success: false,
          transactionId,
          paymentStatus: 'failed',
          message: paymentResult.message || 'Payment failed',
          error: paymentResult.error,
        };
      }

      // Log payment completed
      await this.addEvent(transactionId, 'payment_completed', {
        paymentId: paymentResult.paymentId,
        method: request.paymentMethod,
      });

      // Step 2: Create escrow
      const totalAmount = request.items.reduce((sum, item) => sum + item.total, 0) + (request.platformFee || 0);
      
      const escrow = await escrowService.createEscrow(
        transactionId,
        request.orderId,
        request.farmerId,
        request.transporterId,
        totalAmount,
        request.paymentMethod,
        {
          dropoffLocation: request.dropoffLocation,
          estimatedDelivery: request.estimatedDeliveryTime,
          notes: request.notes,
        }
      );

      await this.addEvent(transactionId, 'escrow_created', {
        escrowId: escrow.escrowId,
        amount: escrow.amount,
        status: 'held',
      });

      // Step 3: Generate digital receipt
      const receipt = await receiptService.generateReceipt(
        transactionId,
        request.orderId,
        {
          id: request.farmerId,
          name: request.farmerName,
          phone: request.farmerPhone,
          email: request.farmerEmail,
          location: request.farmerLocation,
        },
        {
          id: request.transporterId,
          name: request.transporterName,
          phone: request.transporterPhone,
          email: request.transporterEmail,
          vehicleInfo: request.transporterVehicleInfo,
        },
        {
          description: request.cargoDescription,
          quantity: request.cargoQuantity,
          unit: request.cargoUnit,
          pickupLocation: request.pickupLocation,
          dropoffLocation: request.dropoffLocation,
          pickupTime: request.pickupTime,
          estimatedDeliveryTime: request.estimatedDeliveryTime,
        },
        request.items,
        request.paymentMethod,
        totalAmount,
        request.platformFee || 0,
        request.notes
      );

      await this.addEvent(transactionId, 'receipt_generated', {
        receiptId: receipt.receiptId,
        receiptNumber: receipt.receiptNumber,
      });

      // Step 4: Email receipt to both parties
      try {
        await receiptService.emailReceipt(receipt.receiptId, request.farmerEmail);
        await receiptService.emailReceipt(receipt.receiptId, request.transporterEmail);
        
        await this.addEvent(transactionId, 'receipt_emailed', {
          emailedTo: [request.farmerEmail, request.transporterEmail],
        });
      } catch (emailError) {
        console.warn('⚠️ Email sending failed, but transaction continues:', emailError);
      }

      // Update transaction status to completed
      await this.updateTransactionStatus(transactionId, 'escrow_held', {
        escrowId: escrow.escrowId,
        receiptId: receipt.receiptId,
      });

      return {
        success: true,
        transactionId,
        escrowId: escrow.escrowId,
        receiptId: receipt.receiptId,
        paymentStatus: 'completed',
        message: `Transaction successful! Payment held in escrow. Receipt: ${receipt.receiptNumber}`,
        receiptUrl: receipt.receiptId,
      };
    } catch (error: any) {
      console.error('❌ Transaction failed:', error);
      return {
        success: false,
        transactionId: '',
        paymentStatus: 'error',
        message: 'Transaction failed: ' + (error.message || 'Unknown error'),
        error: error.message,
      };
    }
  }

  /**
   * Confirm delivery and release escrow
   * Called when transporter completes delivery
   */
  async confirmDeliveryAndReleaseEscrow(
    transactionId: string,
    deliveryProof?: {
      location?: string;
      photo?: string;
      signature?: string;
      timestamp?: string;
    }
  ): Promise<TransactionResult> {
    try {
      const txRecord = await this.getTransactionRecord(transactionId);
      if (!txRecord) {
        return {
          success: false,
          transactionId,
          paymentStatus: 'error',
          message: 'Transaction not found',
        };
      }

      if (!txRecord.escrowId) {
        return {
          success: false,
          transactionId,
          paymentStatus: 'error',
          message: 'No escrow found for this transaction',
        };
      }

      // Release escrow
      const release = await escrowService.releaseEscrow(txRecord.escrowId);

      if (!release) {
        return {
          success: false,
          transactionId,
          paymentStatus: 'error',
          message: 'Failed to release escrow',
        };
      }

      // Update receipt status
      if (txRecord.receiptId) {
        await receiptService.updateReceiptStatus(
          txRecord.receiptId,
          'completed',
          'released',
          new Date().toISOString()
        );
      }

      // Log event
      await this.addEvent(transactionId, 'delivery_confirmed', deliveryProof);
      await this.addEvent(transactionId, 'escrow_released', {
        escrowId: txRecord.escrowId,
        releasedTo: release.releasedTo,
        amount: release.releaseAmount,
      });

      // Update transaction status
      await this.updateTransactionStatus(transactionId, 'completed');

      return {
        success: true,
        transactionId,
        escrowId: txRecord.escrowId,
        receiptId: txRecord.receiptId,
        paymentStatus: 'completed',
        message: 'Delivery confirmed! Payment released to transporter.',
      };
    } catch (error: any) {
      console.error('❌ Failed to confirm delivery:', error);
      return {
        success: false,
        transactionId,
        paymentStatus: 'error',
        message: 'Failed to confirm delivery: ' + error.message,
      };
    }
  }

  /**
   * Refund escrow payment to farmer
   * Called on delivery failure or dispute resolution
   */
  async refundTransaction(
    transactionId: string,
    reason: string
  ): Promise<TransactionResult> {
    try {
      const txRecord = await this.getTransactionRecord(transactionId);
      if (!txRecord) {
        return {
          success: false,
          transactionId,
          paymentStatus: 'error',
          message: 'Transaction not found',
        };
      }

      if (!txRecord.escrowId) {
        return {
          success: false,
          transactionId,
          paymentStatus: 'error',
          message: 'No escrow found for refund',
        };
      }

      // Refund escrow
      const refund = await escrowService.refundEscrow(txRecord.escrowId, reason);

      if (!refund) {
        return {
          success: false,
          transactionId,
          paymentStatus: 'error',
          message: 'Failed to process refund',
        };
      }

      // Update receipt status
      if (txRecord.receiptId) {
        await receiptService.updateReceiptStatus(
          txRecord.receiptId,
          'refunded',
          'refunded'
        );
      }

      // Log event
      await this.addEvent(transactionId, 'refund_initiated', {
        escrowId: txRecord.escrowId,
        reason,
      });
      await this.addEvent(transactionId, 'refund_completed', {
        amount: refund.refundAmount,
        refundTo: refund.refundTo,
      });

      // Update transaction status
      await this.updateTransactionStatus(transactionId, 'refunded');

      return {
        success: true,
        transactionId,
        escrowId: txRecord.escrowId,
        receiptId: txRecord.receiptId,
        paymentStatus: 'refunded',
        message: `Refund processed successfully. Reason: ${reason}`,
      };
    } catch (error: any) {
      console.error('❌ Failed to refund transaction:', error);
      return {
        success: false,
        transactionId,
        paymentStatus: 'error',
        message: 'Failed to process refund: ' + error.message,
      };
    }
  }

  /**
   * Raise dispute on transaction
   */
  async raiseDispute(
    transactionId: string,
    reason: string,
    initiatedBy: 'farmer' | 'transporter',
    evidence?: string
  ): Promise<TransactionResult> {
    try {
      const txRecord = await this.getTransactionRecord(transactionId);
      if (!txRecord) {
        return {
          success: false,
          transactionId,
          paymentStatus: 'error',
          message: 'Transaction not found',
        };
      }

      if (!txRecord.escrowId) {
        return {
          success: false,
          transactionId,
          paymentStatus: 'error',
          message: 'No escrow found for dispute',
        };
      }

      // Mark escrow as disputed
      const escrow = await escrowService.disputeEscrow(
        txRecord.escrowId,
        reason,
        initiatedBy,
        evidence
      );

      if (!escrow) {
        return {
          success: false,
          transactionId,
          paymentStatus: 'error',
          message: 'Failed to raise dispute',
        };
      }

      // Log event
      await this.addEvent(transactionId, 'dispute_raised', {
        escrowId: txRecord.escrowId,
        reason,
        initiatedBy,
        evidence,
      });

      // Update transaction status
      await this.updateTransactionStatus(transactionId, 'disputed');

      return {
        success: true,
        transactionId,
        escrowId: txRecord.escrowId,
        receiptId: txRecord.receiptId,
        paymentStatus: 'disputed',
        message: `Dispute raised successfully. Our team will review and contact you within 24 hours.`,
      };
    } catch (error: any) {
      console.error('❌ Failed to raise dispute:', error);
      return {
        success: false,
        transactionId,
        paymentStatus: 'error',
        message: 'Failed to raise dispute: ' + error.message,
      };
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<TransactionStatus | null> {
    try {
      const data = await AsyncStorage.getItem(`${this.storagePrefix}${transactionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Failed to get transaction status:', error);
      return null;
    }
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(userId: string, userType: 'farmer' | 'transporter') {
    try {
      const indexKey =
        userType === 'farmer'
          ? `${this.transactionIndexKey}_farmer_${userId}`
          : `${this.transactionIndexKey}_transporter_${userId}`;

      const indexData = await AsyncStorage.getItem(indexKey);
      if (!indexData) return [];

      const transactionIds: string[] = JSON.parse(indexData);
      const transactions = [];

      for (const txId of transactionIds) {
        const tx = await this.getTransactionStatus(txId);
        if (tx) transactions.push(tx);
      }

      return transactions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('❌ Failed to get user transactions:', error);
      return [];
    }
  }

  /**
   * Private: Process payment through appropriate gateway
   */
  private async processPayment(
    transactionId: string,
    request: TransactionRequest
  ): Promise<{ success: boolean; paymentId?: string; message?: string; error?: string }> {
    try {
      // In production, this would call the actual payment gateway
      // For now, we'll simulate successful payment
      
      // Calculate total amount
      const subtotal = request.items.reduce((sum, item) => sum + item.total, 0);
      const total = subtotal + (request.platformFee || 0);

      // Mock payment processing
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // In production:
      // const response = await api.post('/payments/process', {
      //   transactionId,
      //   amount: total,
      //   method: request.paymentMethod,
      //   phone: request.phoneNumber,
      //   email: request.email,
      // });

            return {
        success: true,
        paymentId,
      };
    } catch (error: any) {
      console.error('❌ Payment processing failed:', error);
      return {
        success: false,
        message: 'Payment processing failed',
        error: error.message,
      };
    }
  }

  /**
   * Private: Create transaction record
   */
  private async createTransactionRecord(
    transactionId: string,
    request: TransactionRequest,
    status: TransactionStatus['status']
  ): Promise<void> {
    try {
      const amount = request.items.reduce((sum, item) => sum + item.total, 0) + (request.platformFee || 0);

      const record: TransactionStatus = {
        transactionId,
        orderId: request.orderId,
        status,
        paymentMethod: request.paymentMethod,
        amount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        events: [],
      };

      await AsyncStorage.setItem(`${this.storagePrefix}${transactionId}`, JSON.stringify(record));

      // Add to farmer index
      const farmerIndexKey = `${this.transactionIndexKey}_farmer_${request.farmerId}`;
      const farmerIndex = await AsyncStorage.getItem(farmerIndexKey);
      const farmerTxs = farmerIndex ? JSON.parse(farmerIndex) : [];
      farmerTxs.push(transactionId);
      await AsyncStorage.setItem(farmerIndexKey, JSON.stringify(farmerTxs));

      // Add to transporter index
      const transporterIndexKey = `${this.transactionIndexKey}_transporter_${request.transporterId}`;
      const transporterIndex = await AsyncStorage.getItem(transporterIndexKey);
      const transporterTxs = transporterIndex ? JSON.parse(transporterIndex) : [];
      transporterTxs.push(transactionId);
      await AsyncStorage.setItem(transporterIndexKey, JSON.stringify(transporterTxs));
    } catch (error) {
      console.error('❌ Failed to create transaction record:', error);
    }
  }

  /**
   * Private: Update transaction status
   */
  private async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus['status'],
    additionalData?: any
  ): Promise<void> {
    try {
      const record = await this.getTransactionRecord(transactionId);
      if (record) {
        record.status = status;
        record.updatedAt = new Date().toISOString();
        if (additionalData) {
          Object.assign(record, additionalData);
        }
        await AsyncStorage.setItem(`${this.storagePrefix}${transactionId}`, JSON.stringify(record));
      }
    } catch (error) {
      console.error('❌ Failed to update transaction status:', error);
    }
  }

  /**
   * Private: Add event to transaction
   */
  private async addEvent(
    transactionId: string,
    type: TransactionEvent['type'],
    details?: any
  ): Promise<void> {
    try {
      const record = await this.getTransactionRecord(transactionId);
      if (record) {
        const event: TransactionEvent = {
          type,
          timestamp: new Date().toISOString(),
          details,
        };
        record.events.push(event);
        await AsyncStorage.setItem(`${this.storagePrefix}${transactionId}`, JSON.stringify(record));
      }
    } catch (error) {
      console.error('❌ Failed to add event:', error);
    }
  }

  /**
   * Private: Get transaction record
   */
  private async getTransactionRecord(transactionId: string): Promise<TransactionStatus | null> {
    try {
      const data = await AsyncStorage.getItem(`${this.storagePrefix}${transactionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
export const transactionService = new TransactionServiceClass();

export default transactionService;