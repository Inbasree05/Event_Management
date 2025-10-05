import nodemailer from 'nodemailer';

// Create transporter using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS  // Your Gmail App Password
    }
  });
};

// Send a consolidated order confirmation email for the entire booking
export const sendOrderConfirmation = async (email, order) => {
  try {
    const transporter = createTransporter();

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const itemsRows = (order.items || []).map((it, idx) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px;">${idx + 1}</td>
        <td style="padding: 10px;">${it.name}</td>
        <td style="padding: 10px;">${it.location || 'N/A'}</td>
        <td style="padding: 10px;">${it.type || 'service'}</td>
        <td style="padding: 10px;">${Number(it.price).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
        <td style="padding: 10px; text-align:center;">${it.quantity || 1}</td>
        <td style="padding: 10px;">${(Number(it.price) * (it.quantity || 1)).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your Booking Confirmation - ${order.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; color: #333;">WeddingVista</h1>
            <p style="margin: 4px 0; color: #666;">Thank you for your booking!</p>
          </div>

          <div style="background: #f8f9fa; padding: 16px 20px; border-radius: 10px; margin-bottom: 20px;">
            <p style="margin: 6px 0; color: #333;"><strong>Booking ID:</strong> ${order.bookingId}</p>
            <p style="margin: 6px 0; color: #333;"><strong>Name:</strong> ${order.name}</p>
            <p style="margin: 6px 0; color: #333;"><strong>Phone:</strong> ${order.phone}</p>
            <p style="margin: 6px 0; color: #333;"><strong>Event Date:</strong> ${formatDate(order.date)}</p>
          </div>

          <h3 style="color:#333;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; background: #fff;">
            <thead>
              <tr style="background:#fafafa; border-bottom: 1px solid #eee; text-align: left;">
                <th style="padding: 10px;">#</th>
                <th style="padding: 10px;">Service</th>
                <th style="padding: 10px;">Location</th>
                <th style="padding: 10px;">Type</th>
                <th style="padding: 10px;">Price</th>
                <th style="padding: 10px; text-align:center;">Qty</th>
                <th style="padding: 10px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows || `<tr><td colspan="7" style="padding: 12px; text-align:center; color:#666;">No items found</td></tr>`}
            </tbody>
          </table>

          <div style="margin-top: 16px; text-align: right;">
            <p style="font-size: 16px; color:#333;">
              <strong>Total:</strong> ${Number(order.totalAmount || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            </p>
          </div>

          <div style="margin-top: 20px; padding: 14px; background: #e8f5e9; border-radius: 8px; color: #2e7d32;">
            <p style="margin: 0;">Our team will contact you within 24 hours with next steps. For any questions, reply to this email.</p>
          </div>

          <p style="text-align:center; color:#999; font-size: 12px; margin-top: 24px;">This is an automated message from WeddingVista.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
// Send booking confirmation email
export const sendBookingConfirmation = async (email, bookingDetails) => {
  try {
    const transporter = createTransporter();
    
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Booking Confirmation - ${bookingDetails.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">WeddingVista</h1>
            <h2 style="color: #666; font-weight: normal;">Booking Confirmation</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Thank you for your booking! Here are your booking details:
            </p>
            
            <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #4CAF50;">
              <h3 style="margin-top: 0; color: #333;">${bookingDetails.serviceName}</h3>
              <p style="margin: 5px 0; color: #555;">
                <strong>Booking ID:</strong> ${bookingDetails.bookingId}
              </p>
              <p style="margin: 5px 0; color: #555;">
                <strong>Event Date:</strong> ${formatDate(bookingDetails.eventDate)}
              </p>
              <p style="margin: 5px 0; color: #555;">
                <strong>Location:</strong> ${bookingDetails.location || 'N/A'}
              </p>
              <p style="margin: 5px 0; color: #555;">
                <strong>Amount Paid:</strong> ₹${bookingDetails.amount.toLocaleString('en-IN')}
              </p>
            </div>
            
            <div style="margin-top: 25px; padding: 15px; background-color: #e8f5e9; border-radius: 8px;">
              <h4 style="margin-top: 0; color: #2e7d32;">What's Next?</h4>
              <p style="margin: 5px 0; color: #1b5e20;">
                1. Our team will review your booking and contact you within 24 hours.<br>
                2. Please keep this email for your records.<br>
                3. For any queries, reply to this email or contact our support.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>Thank you for choosing WeddingVista!</p>
            <p>This is an automated email, please do not reply directly.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
};

export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - WeddingVista',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">WeddingVista</h1>
            <h2 style="color: #666; font-weight: normal;">Password Reset Request</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h3 style="color: #333; margin-bottom: 20px;">Your OTP Code</h3>
            <div style="background-color: #007bff; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #666; margin-top: 20px;">
              This OTP is valid for <strong>10 minutes</strong> only.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #fff3cd; border-radius: 8px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. 
              Your account remains secure.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>This is an automated message from WeddingVista. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    return { success: false, error: error.message };
  }
};
