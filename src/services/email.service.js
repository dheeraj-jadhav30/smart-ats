import dotenv from 'dotenv'
dotenv.config()

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});




// Function to send email
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"SMART-ATS" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


export const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to SmartATS! 🚀';
  const text = `Hi ${name},\n\nWelcome to SmartATS! Your account has been created successfully.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Welcome to SmartATS, ${name}! 🚀</h2>
      <p>Your account has been created successfully.</p>
      <p>You can now upload your resume, match it against real job descriptions, and get AI-powered recommendations.</p>
    </div>
  `;
  return sendEmail(email, subject, text, html);
};

export const sendResumeReportEmail = async (email, name, report) => {
  const subject = `SmartATS Report: ${report.jobTitle} at ${report.companyName} (${report.matchScore}% Match)`

  // Determine score badge color
  const scoreColor = report.matchScore >= 75 ? '#10b981' : report.matchScore >= 50 ? '#f59e0b' : '#ef4444'

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; color: #1f2937; line-height: 1.6; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #111827; margin-bottom: 4px;">SmartATS Match Report 🎯</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: 0;">Candidate: <strong>${name}</strong></p>

      <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Role:</strong> ${report.jobTitle}</p>
        <p style="margin: 4px 0;"><strong>Company:</strong> ${report.companyName}</p>
        <p style="margin: 8px 0;">
          <strong>Match Score:</strong> 
          <span style="display: inline-block; background-color: ${scoreColor}; color: white; padding: 4px 12px; border-radius: 9999px; font-weight: bold;">
            ${report.matchScore}%
          </span>
        </p>
      </div>

      <h3 style="color: #111827;">Executive Summary</h3>
      <p style="background: #f3f4f6; padding: 12px; border-left: 4px solid #3b82f6; border-radius: 4px;">${report.summary}</p>

      <h3 style="color: #111827;">Matching Skills</h3>
      <p>${report.matchingSkills?.length ? report.matchingSkills.map(s => `<span style="background: #d1fae5; color: #065f46; padding: 3px 8px; border-radius: 4px; font-size: 13px; margin-right: 6px; display: inline-block; margin-bottom: 4px;">${s}</span>`).join(' ') : 'None detected'}</p>

      <h3 style="color: #111827;">Missing Skills (Target Areas)</h3>
      <p>${report.missingSkills?.length ? report.missingSkills.map(s => `<span style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-size: 13px; margin-right: 6px; display: inline-block; margin-bottom: 4px;">${s}</span>`).join(' ') : 'None'}</p>

      <h3 style="color: #111827;">Actionable Recommendations</h3>
      <ul>
        ${report.recommendations?.map(r => `<li>${r}</li>`).join('') || '<li>No specific recommendations</li>'}
      </ul>

      <h3 style="color: #111827;">Tailored Cover Letter</h3>
      <div style="background: #f9fafb; padding: 16px; border-radius: 6px; border: 1px dashed #d1d5db; white-space: pre-line;">
        ${report.tailoredCoverLetter}
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">Generated automatically by SmartATS Backend Service.</p>
    </div>
  `

  return sendEmail(email, subject, report.summary, html)
}
