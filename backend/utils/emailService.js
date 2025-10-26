import nodemailer from "nodemailer";

// Create transporter using Mailtrap configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp, studentName, courseTitle) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@edulearn.com",
      to: email,
      subject: "🔐 Payment OTP Verification - EduLearn",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎓 EduLearn</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Payment Verification</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${studentName}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You are about to make a payment for the course: <strong>${courseTitle}</strong>
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              To complete your payment, please use the following OTP (One-Time Password):
            </p>
            
            <div style="background: #fff; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px;">
              <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 5px; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ Important:</strong> This OTP will expire in 5 minutes. Do not share this code with anyone.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you didn't request this payment, please ignore this email or contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2024 EduLearn. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return { success: false, error: error.message };
  }
};

// Send payment confirmation email
export const sendPaymentConfirmationEmail = async (email, studentName, courseTitle, amount) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@edulearn.com",
      to: email,
      subject: "✅ Payment Confirmed - EduLearn",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎓 EduLearn</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Payment Confirmed</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="background: #28a745; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px;">
                ✅
              </div>
            </div>
            
            <h2 style="color: #333; margin-top: 0; text-align: center;">Payment Successful!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hello <strong>${studentName}</strong>,
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your payment has been successfully processed. You are now enrolled in:
            </p>
            
            <div style="background: #fff; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Course Details</h3>
              <p style="color: #666; margin: 5px 0;"><strong>Course:</strong> ${courseTitle}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Amount Paid:</strong> Rs. ${amount}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #155724; margin: 0; font-size: 14px;">
                <strong>🎉 Congratulations!</strong> You now have full access to your course materials and can start learning immediately.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you have any questions or need assistance, please don't hesitate to contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2024 EduLearn. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Payment confirmation email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    return { success: false, error: error.message };
  }
};
