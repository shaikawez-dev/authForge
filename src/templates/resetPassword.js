const resetPasswordTemplate = (name, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin:auto;">
      
      <h2 style="color:#333;">Password Reset Request</h2>

      <p>Hello ${name},</p>

      <p>You requested to reset your password. Use the OTP below to continue:</p>

      <div style="
        font-size:28px;
        font-weight:bold;
        letter-spacing:6px;
        background:#f4f4f4;
        padding:15px;
        text-align:center;
        border-radius:8px;
        margin:20px 0;
      ">
        ${otp}
      </div>

      <p>This OTP is valid for <b>10 minutes</b>.</p>

      <p>If you didn't request a password reset, please ignore this email.</p>

      <br>

      <p style="color:#777;font-size:12px;">
        AuthForge Security Team
      </p>

    </div>
  `;
};

export { resetPasswordTemplate };
