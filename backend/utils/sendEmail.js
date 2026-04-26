const transporter = require('../config/mailer');

const sendEmail = async ({ to, subject, otp }) => {
  // Ultra Modern Dark & Red Professional Template
  const htmlTemplate = `
    <div style="background-color: #0a0a0a; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #141414; border: 1px solid #333; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(220, 38, 38, 0.1);">
        
        <div style="background: linear-gradient(90deg, #dc2626 0%, #991b1b 100%); padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">Industrial Platform</h2>
        </div>

        <div style="padding: 40px 32px;">
          <p style="font-size: 16px; color: #e5e5e5; margin-bottom: 24px; line-height: 1.5;">Hello,</p>
          <p style="font-size: 16px; color: #a3a3a3; margin-bottom: 32px; line-height: 1.5;">Your security is our priority. Here is your verification code for registration:</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <div style="display: inline-block; padding: 2px; border-radius: 12px; background: linear-gradient(135deg, #dc2626 0%, #333333 100%);">
              <div style="background-color: #0a0a0a; padding: 16px 32px; border-radius: 10px;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ef4444; text-shadow: 0 0 20px rgba(239, 68, 68, 0.4);">
                  ${otp}
                </span>
              </div>
            </div>
          </div>

          <div style="background-color: rgba(220, 38, 38, 0.05); border-left: 4px solid #dc2626; padding: 16px; margin-top: 32px; border-radius: 0 8px 8px 0;">
            <p style="font-size: 14px; color: #a3a3a3; margin: 0; line-height: 1.5;">
              <strong style="color: #ef4444;">Important:</strong> This OTP is valid for 10 minutes. Please do not share it with anyone.
            </p>
          </div>
        </div>

        <div style="background-color: #0f0f0f; padding: 24px; text-align: center; border-top: 1px solid #262626;">
          <p style="font-size: 12px; color: #525252; margin: 0;">&copy; 2026 Industrial Platform. All rights reserved.</p>
          <p style="font-size: 12px; color: #525252; margin-top: 8px;">If you didn't request this, please ignore this email.</p>
        </div>

      </div>
    </div>
  `;

  const mailOptions = {
    from: `"One Keep" <${process.env.EMAIL_USER}>`,
    to,
    subject: subject || 'Secure OTP Verification - Industrial Platform',
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = sendEmail;