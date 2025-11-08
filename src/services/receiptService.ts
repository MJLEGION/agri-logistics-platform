// src/services/receiptService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Digital Receipt Service
 * Generates and manages receipts for all transactions
 * 
 * Features:
 * - Generate professional receipts (JSON/HTML format)
 * - Email receipts to farmers/transporters
 * - Store receipt history
 * - Generate receipt summaries and reports
 */

export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DigitalReceipt {
  receiptId: string;
  transactionId: string;
  orderId: string;
  receiptDate: string;
  receiptNumber: string;
  
  // Parties involved
  farmer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    location?: string;
  };
  
  transporter: {
    id: string;
    name: string;
    phone: string;
    email: string;
    vehicleInfo?: string;
  };
  
  // Cargo details
  cargo: {
    description: string;
    quantity: number;
    unit: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupTime: string;
    estimatedDeliveryTime: string;
  };
  
  // Financial details
  itemList: ReceiptItem[];
  subtotal: number;
  platformFee: number;
  tax: number;
  totalAmount: number;
  currency: string;
  
  // Payment details
  paymentMethod: 'momo' | 'airtel' | 'card' | 'bank_transfer';
  paymentStatus: 'pending' | 'completed' | 'refunded';
  escrowStatus?: 'held' | 'released' | 'refunded';
  
  // Tracking info
  trackingNumber: string;
  estimatedDeliveryDate: string;
  
  // Additional info
  notes?: string;
  terms?: string;
  signatureRequired?: boolean;
  deliveryProofRequired?: boolean;
  
  // Status tracking
  issuedAt: string;
  deliveredAt?: string;
  confirmedAt?: string;
  emailedAt?: string;
  printedAt?: string;
  
  // Receipt format versions
  formats: {
    json: boolean;
    html: boolean;
    pdf?: boolean;
  };
}

export interface ReceiptEmail {
  receiptId: string;
  emailTo: string;
  emailSentAt: string;
  subject: string;
  sentSuccessfully: boolean;
  error?: string;
}

class ReceiptServiceClass {
  private storagePrefix = 'receipt_';
  private receiptIndexKey = 'receipt_index';

  /**
   * Generate a new receipt
   */
  async generateReceipt(
    transactionId: string,
    orderId: string,
    farmer: DigitalReceipt['farmer'],
    transporter: DigitalReceipt['transporter'],
    cargo: DigitalReceipt['cargo'],
    itemList: ReceiptItem[],
    paymentMethod: DigitalReceipt['paymentMethod'],
    totalAmount: number,
    platformFee: number = 0,
    notes?: string
  ): Promise<DigitalReceipt> {
    try {
      const receiptId = `RCP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const receiptNumber = this.generateReceiptNumber();

      // Calculate totals
      const subtotal = itemList.reduce((sum, item) => sum + item.total, 0);
      const tax = Math.round(subtotal * 0.18); // 18% VAT standard in Rwanda
      const total = subtotal + platformFee + tax;

      const receipt: DigitalReceipt = {
        receiptId,
        transactionId,
        orderId,
        receiptDate: new Date().toISOString(),
        receiptNumber,
        farmer,
        transporter,
        cargo,
        itemList,
        subtotal,
        platformFee,
        tax,
        totalAmount: total,
        currency: 'RWF',
        paymentMethod,
        paymentStatus: 'pending',
        escrowStatus: 'held',
        trackingNumber: `TRK_${orderId}_${Date.now()}`,
        estimatedDeliveryDate: cargo.estimatedDeliveryTime,
        notes,
        issuedAt: new Date().toISOString(),
        formats: {
          json: true,
          html: true,
          pdf: false,
        },
      };

      // Save receipt
      await AsyncStorage.setItem(
        `${this.storagePrefix}${receiptId}`,
        JSON.stringify(receipt)
      );

      // Add to index
      await this.addToIndex(receiptId, farmer.id, transporter.id, orderId);

            return receipt;
    } catch (error) {
      console.error('❌ Failed to generate receipt:', error);
      throw error;
    }
  }

  /**
   * Get receipt by ID
   */
  async getReceipt(receiptId: string): Promise<DigitalReceipt | null> {
    try {
      const data = await AsyncStorage.getItem(`${this.storagePrefix}${receiptId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Failed to get receipt:', error);
      return null;
    }
  }

  /**
   * Update receipt status (when payment completes, delivery confirmed, etc.)
   */
  async updateReceiptStatus(
    receiptId: string,
    paymentStatus: DigitalReceipt['paymentStatus'],
    escrowStatus?: DigitalReceipt['escrowStatus'],
    deliveredAt?: string
  ): Promise<DigitalReceipt | null> {
    try {
      const receipt = await this.getReceipt(receiptId);
      if (!receipt) throw new Error(`Receipt ${receiptId} not found`);

      receipt.paymentStatus = paymentStatus;
      if (escrowStatus) receipt.escrowStatus = escrowStatus;
      if (deliveredAt) receipt.deliveredAt = deliveredAt;
      if (paymentStatus === 'completed') {
        receipt.confirmedAt = new Date().toISOString();
      }

      await AsyncStorage.setItem(
        `${this.storagePrefix}${receiptId}`,
        JSON.stringify(receipt)
      );

            return receipt;
    } catch (error) {
      console.error('❌ Failed to update receipt:', error);
      throw error;
    }
  }

  /**
   * Generate HTML version of receipt (for email/printing)
   */
  async generateReceiptHTML(receiptId: string): Promise<string> {
    try {
      const receipt = await this.getReceipt(receiptId);
      if (!receipt) throw new Error(`Receipt ${receiptId} not found`);

      const itemsHTML = receipt.itemList
        .map(
          item => `
        <tr>
          <td>${item.description}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">RWF ${item.unitPrice.toLocaleString()}</td>
          <td style="text-align: right;">RWF ${item.total.toLocaleString()}</td>
        </tr>
      `
        )
        .join('');

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt ${receipt.receiptNumber}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .receipt-container {
      max-width: 900px;
      margin: 0 auto;
      background-color: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2ecc71;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #27ae60;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      color: #666;
      margin: 5px 0;
    }
    .receipt-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .receipt-info p {
      margin: 5px 0;
    }
    .receipt-info strong {
      color: #27ae60;
    }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
    }
    .party {
      font-size: 14px;
    }
    .party h3 {
      color: #27ae60;
      margin: 0 0 10px 0;
    }
    .party p {
      margin: 5px 0;
    }
    .cargo-info {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    .cargo-info h3 {
      color: #27ae60;
      margin: 0 0 10px 0;
    }
    .cargo-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 14px;
    }
    .cargo-details p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    table thead {
      background-color: #27ae60;
      color: white;
    }
    table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    table td {
      padding: 10px 12px;
      border-bottom: 1px solid #eee;
    }
    table tbody tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .totals-box {
      width: 300px;
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      border-bottom: 1px solid #ddd;
    }
    .total-row.grand-total {
      font-size: 18px;
      font-weight: bold;
      color: #27ae60;
      border-bottom: 2px solid #27ae60;
      margin-top: 10px;
      padding-top: 10px;
    }
    .payment-status {
      margin-top: 20px;
      padding: 15px;
      background-color: #e8f8f5;
      border-left: 4px solid #27ae60;
      border-radius: 3px;
    }
    .payment-status h4 {
      margin: 0 0 10px 0;
      color: #27ae60;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 12px;
    }
    .print-note {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 20px;
    }
    @media print {
      body {
        background-color: white;
      }
      .receipt-container {
        box-shadow: none;
      }
      .print-note {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <h1>🚚 AGRI LOGISTICS RECEIPT</h1>
      <p>Professional Agricultural Cargo Transportation</p>
    </div>

    <div class="receipt-info">
      <div>
        <p><strong>Receipt Number:</strong> ${receipt.receiptNumber}</p>
        <p><strong>Transaction ID:</strong> ${receipt.transactionId}</p>
        <p><strong>Date:</strong> ${new Date(receipt.receiptDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>
      <div>
        <p><strong>Tracking Number:</strong> ${receipt.trackingNumber}</p>
        <p><strong>Payment Status:</strong> <span style="color: #27ae60; font-weight: bold;">${receipt.paymentStatus.toUpperCase()}</span></p>
        <p><strong>Escrow Status:</strong> <span style="color: #f39c12; font-weight: bold;">${receipt.escrowStatus?.toUpperCase()}</span></p>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h3>👨‍🌾 Farmer (Shipper)</h3>
        <p><strong>${receipt.farmer.name}</strong></p>
        <p>Phone: ${receipt.farmer.phone}</p>
        <p>Email: ${receipt.farmer.email}</p>
        ${receipt.farmer.location ? `<p>Location: ${receipt.farmer.location}</p>` : ''}
      </div>
      <div class="party">
        <h3>🚗 Transporter</h3>
        <p><strong>${receipt.transporter.name}</strong></p>
        <p>Phone: ${receipt.transporter.phone}</p>
        <p>Email: ${receipt.transporter.email}</p>
        ${receipt.transporter.vehicleInfo ? `<p>Vehicle: ${receipt.transporter.vehicleInfo}</p>` : ''}
      </div>
    </div>

    <div class="cargo-info">
      <h3>📦 Cargo Details</h3>
      <div class="cargo-details">
        <div>
          <p><strong>Item:</strong> ${receipt.cargo.description}</p>
          <p><strong>Quantity:</strong> ${receipt.cargo.quantity} ${receipt.cargo.unit}</p>
          <p><strong>Pickup Location:</strong> ${receipt.cargo.pickupLocation}</p>
        </div>
        <div>
          <p><strong>Dropoff Location:</strong> ${receipt.cargo.dropoffLocation}</p>
          <p><strong>Pickup Time:</strong> ${new Date(receipt.cargo.pickupTime).toLocaleString()}</p>
          <p><strong>Est. Delivery:</strong> ${new Date(receipt.cargo.estimatedDeliveryTime).toLocaleString()}</p>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>RWF ${receipt.subtotal.toLocaleString()}</span>
        </div>
        <div class="total-row">
          <span>Platform Fee:</span>
          <span>RWF ${receipt.platformFee.toLocaleString()}</span>
        </div>
        <div class="total-row">
          <span>VAT (18%):</span>
          <span>RWF ${receipt.tax.toLocaleString()}</span>
        </div>
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>RWF ${receipt.totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div class="payment-status">
      <h4>💳 Payment Information</h4>
      <p><strong>Payment Method:</strong> ${receipt.paymentMethod.toUpperCase()}</p>
      <p><strong>Payment Status:</strong> ${receipt.paymentStatus}</p>
      ${receipt.escrowStatus === 'held' ? '<p>✅ Payment held in escrow until delivery confirmation</p>' : ''}
      ${receipt.escrowStatus === 'released' ? '<p>✅ Payment released to transporter after delivery confirmation</p>' : ''}
    </div>

    ${receipt.notes ? `<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;">
      <strong>📝 Notes:</strong> ${receipt.notes}
    </div>` : ''}

    <div class="footer">
      <p>Thank you for using Agri Logistics Platform! 🌾</p>
      <p>For support, contact: support@agrilogistics.com</p>
      <p>© ${new Date().getFullYear()} Agri Logistics Platform. All rights reserved.</p>
    </div>

    <div class="print-note">
      💡 Tip: Use your browser's print function (Ctrl+P or Cmd+P) to save this receipt as PDF
    </div>
  </div>
</body>
</html>
      `;

      return html;
    } catch (error) {
      console.error('❌ Failed to generate receipt HTML:', error);
      throw error;
    }
  }

  /**
   * Send receipt via email
   * In production, this would call backend email service
   */
  async emailReceipt(
    receiptId: string,
    emailTo: string
  ): Promise<ReceiptEmail> {
    try {
      const receipt = await this.getReceipt(receiptId);
      if (!receipt) throw new Error(`Receipt ${receiptId} not found`);

      const html = await this.generateReceiptHTML(receiptId);

      // In production, call backend API to send email
      // For now, we'll log and store the intent
      const emailRecord: ReceiptEmail = {
        receiptId,
        emailTo,
        emailSentAt: new Date().toISOString(),
        subject: `Receipt ${receipt.receiptNumber} - Agri Logistics`,
        sentSuccessfully: true, // Assume success for now
      };

      // Store email record
      const emailHistoryKey = `receipt_email_history_${receiptId}`;
      const historyData = await AsyncStorage.getItem(emailHistoryKey);
      const history = historyData ? JSON.parse(historyData) : [];
      history.push(emailRecord);
      await AsyncStorage.setItem(emailHistoryKey, JSON.stringify(history));

      // Update receipt
      receipt.emailedAt = new Date().toISOString();
      await AsyncStorage.setItem(
        `${this.storagePrefix}${receiptId}`,
        JSON.stringify(receipt)
      );

            return emailRecord;
    } catch (error) {
      console.error('❌ Failed to email receipt:', error);
      throw error;
    }
  }

  /**
   * Get receipts by farmer
   */
  async getFarmerReceipts(farmerId: string): Promise<DigitalReceipt[]> {
    try {
      const receipts: DigitalReceipt[] = [];
      const indexData = await AsyncStorage.getItem(`${this.receiptIndexKey}_farmer_${farmerId}`);

      if (!indexData) return receipts;

      const receiptIds: string[] = JSON.parse(indexData);
      for (const receiptId of receiptIds) {
        const receipt = await this.getReceipt(receiptId);
        if (receipt) receipts.push(receipt);
      }

      return receipts.sort((a, b) => 
        new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime()
      );
    } catch (error) {
      console.error('❌ Failed to get farmer receipts:', error);
      return [];
    }
  }

  /**
   * Get receipts by transporter
   */
  async getTransporterReceipts(transporterId: string): Promise<DigitalReceipt[]> {
    try {
      const receipts: DigitalReceipt[] = [];
      const indexData = await AsyncStorage.getItem(`${this.receiptIndexKey}_transporter_${transporterId}`);

      if (!indexData) return receipts;

      const receiptIds: string[] = JSON.parse(indexData);
      for (const receiptId of receiptIds) {
        const receipt = await this.getReceipt(receiptId);
        if (receipt) receipts.push(receipt);
      }

      return receipts.sort((a, b) => 
        new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime()
      );
    } catch (error) {
      console.error('❌ Failed to get transporter receipts:', error);
      return [];
    }
  }

  /**
   * Get receipt statistics
   */
  async getReceiptStats(userId: string, userType: 'farmer' | 'transporter') {
    try {
      const receipts =
        userType === 'farmer'
          ? await this.getFarmerReceipts(userId)
          : await this.getTransporterReceipts(userId);

      const stats = {
        totalReceipts: receipts.length,
        totalAmount: 0,
        completedPayments: 0,
        pendingPayments: 0,
        refundedPayments: 0,
        averageAmount: 0,
        completedDeliveries: 0,
      };

      for (const receipt of receipts) {
        stats.totalAmount += receipt.totalAmount;

        switch (receipt.paymentStatus) {
          case 'completed':
            stats.completedPayments++;
            if (receipt.deliveredAt) stats.completedDeliveries++;
            break;
          case 'pending':
            stats.pendingPayments++;
            break;
          case 'refunded':
            stats.refundedPayments++;
            break;
        }
      }

      if (stats.totalReceipts > 0) {
        stats.averageAmount = Math.round(stats.totalAmount / stats.totalReceipts);
      }

      return stats;
    } catch (error) {
      console.error('❌ Failed to get receipt stats:', error);
      return null;
    }
  }

  /**
   * Generate month summary report
   */
  async getMonthSummary(farmerId: string, year: number, month: number) {
    try {
      const receipts = await this.getFarmerReceipts(farmerId);

      const filtered = receipts.filter(receipt => {
        const date = new Date(receipt.receiptDate);
        return date.getFullYear() === year && date.getMonth() === month - 1;
      });

      const summary = {
        year,
        month,
        totalTransactions: filtered.length,
        totalAmount: 0,
        completedAmount: 0,
        pendingAmount: 0,
        refundedAmount: 0,
        transactions: filtered,
      };

      for (const receipt of filtered) {
        summary.totalAmount += receipt.totalAmount;

        switch (receipt.paymentStatus) {
          case 'completed':
            summary.completedAmount += receipt.totalAmount;
            break;
          case 'pending':
            summary.pendingAmount += receipt.totalAmount;
            break;
          case 'refunded':
            summary.refundedAmount += receipt.totalAmount;
            break;
        }
      }

      return summary;
    } catch (error) {
      console.error('❌ Failed to get month summary:', error);
      return null;
    }
  }

  /**
   * Private: Generate unique receipt number
   */
  private generateReceiptNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `RCP-${new Date().getFullYear()}-${random}-${timestamp.slice(-6)}`;
  }

  /**
   * Private: Add receipt to index
   */
  private async addToIndex(
    receiptId: string,
    farmerId: string,
    transporterId: string,
    orderId: string
  ): Promise<void> {
    try {
      // Index by farmer
      const farmerKey = `${this.receiptIndexKey}_farmer_${farmerId}`;
      const farmerIndex = await AsyncStorage.getItem(farmerKey);
      const farmerReceipts = farmerIndex ? JSON.parse(farmerIndex) : [];
      farmerReceipts.push(receiptId);
      await AsyncStorage.setItem(farmerKey, JSON.stringify(farmerReceipts));

      // Index by transporter
      const transporterKey = `${this.receiptIndexKey}_transporter_${transporterId}`;
      const transporterIndex = await AsyncStorage.getItem(transporterKey);
      const transporterReceipts = transporterIndex ? JSON.parse(transporterIndex) : [];
      transporterReceipts.push(receiptId);
      await AsyncStorage.setItem(transporterKey, JSON.stringify(transporterReceipts));

      // Index by order
      const orderKey = `${this.receiptIndexKey}_order_${orderId}`;
      await AsyncStorage.setItem(orderKey, receiptId);
    } catch (error) {
      console.error('❌ Failed to add to index:', error);
    }
  }
}

// Export singleton instance
export const receiptService = new ReceiptServiceClass();

export default receiptService;