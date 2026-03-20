const verifyEmailTemplate = (name, verificationUrl) => {
  return `
    <div style="font-family:sans-serif">
      <h2>Email Verification</h2>
      <p>Hello ${name},</p>
      <p>Please verify your email by clicking the button below.</p>

      <a href="${verificationUrl}" 
      style="
        display:inline-block;
        padding:10px 20px;
        background:#4CAF50;
        color:white;
        text-decoration:none;
        border-radius:5px;
      ">
        Verify Email
      </a>

      <p>If you didn't create this account, ignore this email.</p>
    </div>
  `;
};

export { verifyEmailTemplate };
