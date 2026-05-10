import nodemailer from 'nodemailer';
import { type Order, type OrderItem, type Product } from '@shared/schema';

// Setup transporter based on environment variables
const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email SMTP variables not configured. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendOrderConfirmation = async (
  order: Order, 
  items: (OrderItem & { product: Product })[]
) => {
  if (!order.customerEmail) return;

  const transporter = getTransporter();
  if (!transporter) return;

  const orderNumber = order.id.toString().padStart(5, '0');
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">
        <strong>${item.product.name}</strong><br>
        <small style="color: #666;">
          ${item.size ? `Size: ${item.size} | ` : ''}
          ${item.color ? `Color: ${item.color}` : ''}
        </small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.price} EGP</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #d4af37; margin: 0;">AMAS</h1>
        <p style="color: #666; margin: 5px 0 0 0;">Luxury Jewel Boutique</p>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
        <h2 style="margin-top: 0;">Order Confirmation</h2>
        <p>Dear ${order.customerName},</p>
        <p>Thank you for shopping with AMAS. Your order <strong>#${orderNumber}</strong> has been received successfully.</p>
        
        <h3 style="margin-top: 30px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #ddd;">Item</th>
              <th style="text-align: center; padding: 10px; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="text-align: right; padding: 10px; border-bottom: 2px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align: right; padding: 15px 10px; font-weight: bold;">Total (Including Shipping)</td>
              <td style="text-align: right; padding: 15px 10px; font-weight: bold; color: #d4af37;">${order.totalAmount} EGP</td>
            </tr>
          </tfoot>
        </table>

        <h3 style="margin-top: 30px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Shipping Details</h3>
        <p>
          <strong>Address:</strong> ${order.customerAddress}<br>
          <strong>Phone:</strong> ${order.customerPhone}<br>
          <strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
        <p>If you have any questions, please reply to this email or contact our support.</p>
        <p>&copy; ${new Date().getFullYear()} AMAS Store. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"AMAS Store" <noreply@amasstore.com>',
      to: order.customerEmail,
      subject: `Order Confirmation #${orderNumber} - AMAS Store`,
      html: html,
    });
    console.log(`Order confirmation email sent for order #${order.id}`);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
};
