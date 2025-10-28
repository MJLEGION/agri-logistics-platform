// src/services/escrowService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Escrow Payment Service
 * Manages payment escrow: hold until delivery confirmed, then release or refund
 * 
 * Workflow:
 * 1. Farmer initiates payment → Escrow HELD
 * 2. Transporter picks up → Status: HELD (Payment in escrow)
 * 3. Delivery confirmed → Escrow RELEASED (to transporter)
 * 4. Dispute → Escrow DISPUTED (pending resolution)
 * 5. Refund needed → Escrow REFUNDED (back to farmer)
 */

export interface EscrowPayment {
  escrowId: string;
  transactionId: string;
  orderId: string;
  farmerId: string;
  transporterId: string;
  amount: number;
  currency: string;
  status: 'held' | 'released' | 'refunded' | 'disputed';
  paymentMethod: 'momo' | 'airtel' | 'card' | 'bank_transfer';
  createdAt: string;
  heldUntil: string;
  releasedAt?: string;
  refundedAt?: string;
  reason?: string;
  dispute?: {
    reason: string;
    initiatedBy: 'farmer' | 'transporter';
    createdAt: string;
    evidence?: string;
  };
  metadata?: {
    dropoffLocation?: string;
    estimatedDelivery?: string;
    notes?: string;
  };
}

export interface EscrowRelease {
  escrowId: string;
  releaseAmount: number;
  releasedTo: string;
  timestamp: string;
  confirmationId?: string;
}

export interface EscrowRefund {
  escrowId: string;
  refundAmount: number;
  refundTo: string;
  reason: string;
  timestamp: string;
  confirmationId?: string;
}

class EscrowServiceClass {
  private storagePrefix = 'escrow_';
  private escrowIndexKey = 'escrow_index';

  /**
   * Create new escrow payment
   * Status: HELD - Payment is locked until delivery confirmed
   */
  async createEscrow(
    transactionId: string,
    orderId: string,
    farmerId: string,
    transporterId: string,
    amount: number,
    paymentMethod: 'momo' | 'airtel' | 'card' | 'bank_transfer',
    metadata?: EscrowPayment['metadata']
  ): Promise<EscrowPayment> {
    try {
      const escrowId = `ESCROW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Hold payment for 24 hours default (can be adjusted based on delivery time)
      const heldUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const escrow: EscrowPayment = {
        escrowId,
        transactionId,
        orderId,
        farmerId,
        transporterId,
        amount,
        currency: 'RWF',
        status: 'held',
        paymentMethod,
        createdAt: new Date().toISOString(),
        heldUntil,
        metadata,
      };

      // Save escrow
      await AsyncStorage.setItem(
        `${this.storagePrefix}${escrowId}`,
        JSON.stringify(escrow)
      );

      // Add to index
      await this.addToIndex(escrowId, farmerId, transporterId, orderId);

      console.log('✅ Escrow created:', { escrowId, amount, status: 'held' });

      return escrow;
    } catch (error) {
      console.error('❌ Failed to create escrow:', error);
      throw error;
    }
  }

  /**
   * Get escrow payment details
   */
  async getEscrow(escrowId: string): Promise<EscrowPayment | null> {
    try {
      const data = await AsyncStorage.getItem(`${this.storagePrefix}${escrowId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Failed to get escrow:', error);
      return null;
    }
  }

  /**
   * Release escrow payment to transporter
   * Called when delivery is confirmed
   */
  async releaseEscrow(
    escrowId: string,
    confirmationId?: string
  ): Promise<EscrowRelease | null> {
    try {
      const escrow = await this.getEscrow(escrowId);
      if (!escrow) {
        throw new Error(`Escrow ${escrowId} not found`);
      }

      if (escrow.status !== 'held') {
        throw new Error(`Cannot release escrow with status: ${escrow.status}`);
      }

      // Update escrow status
      escrow.status = 'released';
      escrow.releasedAt = new Date().toISOString();

      await AsyncStorage.setItem(
        `${this.storagePrefix}${escrowId}`,
        JSON.stringify(escrow)
      );

      const release: EscrowRelease = {
        escrowId,
        releaseAmount: escrow.amount,
        releasedTo: escrow.transporterId,
        timestamp: new Date().toISOString(),
        confirmationId,
      };

      // Log release
      await this.logTransaction(release, 'release');

      console.log('✅ Escrow released:', { escrowId, amount: escrow.amount, releasedTo: escrow.transporterId });

      return release;
    } catch (error) {
      console.error('❌ Failed to release escrow:', error);
      throw error;
    }
  }

  /**
   * Refund escrow payment to farmer
   * Called when delivery fails or dispute resolved in farmer's favor
   */
  async refundEscrow(
    escrowId: string,
    reason: string,
    confirmationId?: string
  ): Promise<EscrowRefund | null> {
    try {
      const escrow = await this.getEscrow(escrowId);
      if (!escrow) {
        throw new Error(`Escrow ${escrowId} not found`);
      }

      if (!['held', 'disputed'].includes(escrow.status)) {
        throw new Error(`Cannot refund escrow with status: ${escrow.status}`);
      }

      // Update escrow status
      escrow.status = 'refunded';
      escrow.refundedAt = new Date().toISOString();
      escrow.reason = reason;

      await AsyncStorage.setItem(
        `${this.storagePrefix}${escrowId}`,
        JSON.stringify(escrow)
      );

      const refund: EscrowRefund = {
        escrowId,
        refundAmount: escrow.amount,
        refundTo: escrow.farmerId,
        reason,
        timestamp: new Date().toISOString(),
        confirmationId,
      };

      // Log refund
      await this.logTransaction(refund, 'refund');

      console.log('✅ Escrow refunded:', { escrowId, amount: escrow.amount, reason });

      return refund;
    } catch (error) {
      console.error('❌ Failed to refund escrow:', error);
      throw error;
    }
  }

  /**
   * Mark escrow as disputed
   * When farmer or transporter disputes the delivery
   */
  async disputeEscrow(
    escrowId: string,
    reason: string,
    initiatedBy: 'farmer' | 'transporter',
    evidence?: string
  ): Promise<EscrowPayment | null> {
    try {
      const escrow = await this.getEscrow(escrowId);
      if (!escrow) {
        throw new Error(`Escrow ${escrowId} not found`);
      }

      // Update escrow status
      escrow.status = 'disputed';
      escrow.dispute = {
        reason,
        initiatedBy,
        createdAt: new Date().toISOString(),
        evidence,
      };

      await AsyncStorage.setItem(
        `${this.storagePrefix}${escrowId}`,
        JSON.stringify(escrow)
      );

      console.log('⚠️ Escrow disputed:', { escrowId, reason, initiatedBy });

      return escrow;
    } catch (error) {
      console.error('❌ Failed to dispute escrow:', error);
      throw error;
    }
  }

  /**
   * Get escrows by farmer
   */
  async getFarmerEscrows(farmerId: string): Promise<EscrowPayment[]> {
    try {
      const escrows: EscrowPayment[] = [];
      const indexData = await AsyncStorage.getItem(`${this.escrowIndexKey}_farmer_${farmerId}`);
      
      if (!indexData) return escrows;

      const escrowIds: string[] = JSON.parse(indexData);
      for (const escrowId of escrowIds) {
        const escrow = await this.getEscrow(escrowId);
        if (escrow) escrows.push(escrow);
      }

      return escrows;
    } catch (error) {
      console.error('❌ Failed to get farmer escrows:', error);
      return [];
    }
  }

  /**
   * Get escrows by transporter
   */
  async getTransporterEscrows(transporterId: string): Promise<EscrowPayment[]> {
    try {
      const escrows: EscrowPayment[] = [];
      const indexData = await AsyncStorage.getItem(`${this.escrowIndexKey}_transporter_${transporterId}`);
      
      if (!indexData) return escrows;

      const escrowIds: string[] = JSON.parse(indexData);
      for (const escrowId of escrowIds) {
        const escrow = await this.getEscrow(escrowId);
        if (escrow) escrows.push(escrow);
      }

      return escrows;
    } catch (error) {
      console.error('❌ Failed to get transporter escrows:', error);
      return [];
    }
  }

  /**
   * Get escrow statistics for a farmer
   */
  async getFarmerEscrowStats(farmerId: string) {
    try {
      const escrows = await this.getFarmerEscrows(farmerId);
      
      const stats = {
        totalEscrows: escrows.length,
        totalHeld: 0,
        totalReleased: 0,
        totalRefunded: 0,
        totalDisputed: 0,
        amountHeld: 0,
        amountReleased: 0,
        amountRefunded: 0,
      };

      for (const escrow of escrows) {
        switch (escrow.status) {
          case 'held':
            stats.totalHeld++;
            stats.amountHeld += escrow.amount;
            break;
          case 'released':
            stats.totalReleased++;
            stats.amountReleased += escrow.amount;
            break;
          case 'refunded':
            stats.totalRefunded++;
            stats.amountRefunded += escrow.amount;
            break;
          case 'disputed':
            stats.totalDisputed++;
            break;
        }
      }

      return stats;
    } catch (error) {
      console.error('❌ Failed to get escrow stats:', error);
      return null;
    }
  }

  /**
   * Check if any escrows are overdue
   * Escrows held longer than 24 hours should be addressed
   */
  async checkOverdueEscrows(farmerId: string): Promise<EscrowPayment[]> {
    try {
      const escrows = await this.getFarmerEscrows(farmerId);
      const now = new Date();

      return escrows.filter(escrow => {
        if (escrow.status !== 'held') return false;
        const heldTime = new Date(escrow.heldUntil);
        return now > heldTime;
      });
    } catch (error) {
      console.error('❌ Failed to check overdue escrows:', error);
      return [];
    }
  }

  /**
   * Private: Add escrow to index
   */
  private async addToIndex(
    escrowId: string,
    farmerId: string,
    transporterId: string,
    orderId: string
  ): Promise<void> {
    try {
      // Index by farmer
      const farmerKey = `${this.escrowIndexKey}_farmer_${farmerId}`;
      const farmerIndex = await AsyncStorage.getItem(farmerKey);
      const farmerEscrows = farmerIndex ? JSON.parse(farmerIndex) : [];
      farmerEscrows.push(escrowId);
      await AsyncStorage.setItem(farmerKey, JSON.stringify(farmerEscrows));

      // Index by transporter
      const transporterKey = `${this.escrowIndexKey}_transporter_${transporterId}`;
      const transporterIndex = await AsyncStorage.getItem(transporterKey);
      const transporterEscrows = transporterIndex ? JSON.parse(transporterIndex) : [];
      transporterEscrows.push(escrowId);
      await AsyncStorage.setItem(transporterKey, JSON.stringify(transporterEscrows));

      // Index by order
      const orderKey = `${this.escrowIndexKey}_order_${orderId}`;
      await AsyncStorage.setItem(orderKey, escrowId);
    } catch (error) {
      console.error('❌ Failed to add to index:', error);
    }
  }

  /**
   * Private: Log transaction (release or refund)
   */
  private async logTransaction(
    transaction: EscrowRelease | EscrowRefund,
    type: 'release' | 'refund'
  ): Promise<void> {
    try {
      const logKey = `escrow_${type}_log`;
      const logsData = await AsyncStorage.getItem(logKey);
      const logs = logsData ? JSON.parse(logsData) : [];
      logs.push({
        ...transaction,
        type,
        timestamp: new Date().toISOString(),
      });
      await AsyncStorage.setItem(logKey, JSON.stringify(logs));
    } catch (error) {
      console.error('❌ Failed to log transaction:', error);
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(limit: number = 50): Promise<any[]> {
    try {
      const releaseLogsData = await AsyncStorage.getItem('escrow_release_log');
      const refundLogsData = await AsyncStorage.getItem('escrow_refund_log');

      const releaseLogs = releaseLogsData ? JSON.parse(releaseLogsData) : [];
      const refundLogs = refundLogsData ? JSON.parse(refundLogsData) : [];

      // Combine and sort by timestamp (newest first)
      const allTransactions = [...releaseLogs, ...refundLogs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return allTransactions.slice(0, limit);
    } catch (error) {
      console.error('❌ Failed to get transaction history:', error);
      return [];
    }
  }
}

// Export singleton instance
export const escrowService = new EscrowServiceClass();

export default escrowService;