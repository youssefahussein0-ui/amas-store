import nodemailer from 'nodemailer';
import { type Order, type OrderItem, type Product, orders } from '@shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';

// Setup transporter based on environment variables or Hostinger SMTP defaults
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.SMTP_PORT || '465');
  const user = process.env.SMTP_USER || 'admin@amas-store.com';
  const pass = process.env.SMTP_PASS || '~Xd67rdLF';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

export const sendOrderConfirmation = async (
  order: Order, 
  items: (OrderItem & { product: Product })[]
) => {
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
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f8f8f8;">
        <h1 style="color: #d4af37; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; letter-spacing: 2px;">AMAS</h1>
        <p style="color: #888; margin: 5px 0 0 0; text-transform: uppercase; font-size: 10px; letter-spacing: 3px;">Luxury Jewel Boutique</p>
      </div>
      
      <div style="padding: 20px 0;">
        <h2 style="color: #333; font-size: 20px; font-weight: normal; margin-top: 0;">Order Confirmation</h2>
        <p>Dear <strong>${order.customerName}</strong>,</p>
        <p>Thank you for shopping with AMAS. Your order <strong>#${orderNumber}</strong> has been received successfully and is currently being processed.</p>
        
        <h3 style="margin-top: 30px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 8px; color: #d4af37;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 12px; color: #888; text-transform: uppercase;">Item</th>
              <th style="text-align: center; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 12px; color: #888; text-transform: uppercase; width: 60px;">Qty</th>
              <th style="text-align: right; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 12px; color: #888; text-transform: uppercase; width: 100px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align: right; padding: 15px 0; font-weight: bold; font-size: 14px;">Total Amount</td>
              <td style="text-align: right; padding: 15px 0; font-weight: bold; color: #d4af37; font-size: 16px;">${order.totalAmount} EGP</td>
            </tr>
          </tfoot>
        </table>

        <h3 style="margin-top: 30px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 8px; color: #d4af37;">Shipping Details</h3>
        <div style="background-color: #fafafa; padding: 15px; border-radius: 6px; font-size: 13px; line-height: 1.6;">
          <strong>Address:</strong> ${order.customerAddress}<br>
          <strong>Phone:</strong> ${order.customerPhone}<br>
          <strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; font-size: 11px; color: #999; margin-top: 30px;">
        <p>If you have any questions or require custom specifications, please reply to this email.</p>
        <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} AMAS Store. All rights reserved.</p>
      </div>
    </div>
  `;

  // Save the generated HTML first
  await db.update(orders).set({ emailHtml: html }).where(eq(orders.id, order.id));

  if (!order.customerEmail) {
    console.log(`No customer email provided for order #${order.id}. Stored preview HTML.`);
    return;
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"AMAS Store" <admin@amas-store.com>',
      to: order.customerEmail,
      subject: `Order Confirmation #${orderNumber} - AMAS Store`,
      html: html,
    });
    console.log(`Order confirmation email sent for order #${order.id}`);
    
    // Update DB with success status
    await db.update(orders).set({ emailSent: true }).where(eq(orders.id, order.id));
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    // Explicitly update as false just in case
    await db.update(orders).set({ emailSent: false }).where(eq(orders.id, order.id));
  }
};
