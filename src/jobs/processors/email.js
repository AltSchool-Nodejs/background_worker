const JobNames = require('../names');

async function sendWelcomeEmail({ to, name }) {
  console.log(`[worker:email] welcome → ${to} (${name || 'user'})`);
}

async function sendPasswordResetEmail({ to, resetToken }) {
  console.log(`[worker:email] password reset → ${to} (token len ${String(resetToken || '').length})`);
}

async function sendVerificationEmail({ to, verifyUrl }) {
  console.log(`[worker:email] verify → ${to} ${verifyUrl || ''}`);
}

module.exports = {
  [JobNames.SEND_WELCOME_EMAIL]: sendWelcomeEmail,
  [JobNames.PASSWORD_RESET_EMAIL]: sendPasswordResetEmail,
  [JobNames.EMAIL_VERIFICATION]: sendVerificationEmail,
};

// { send_welcome_email: sendWelcomeEmail,
// password_reset_email: sendPasswordResetEmail,
// email_verification: sendVerificationEmail }