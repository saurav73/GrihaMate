// Email Notification Service
// This service handles sending email notifications for various events in the application

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  type: 'login' | 'contact' | 'booking' | 'listing' | 'inquiry' | 'general';
}

/**
 * Send a general email notification
 */
export const sendEmail = async (notification: EmailNotification): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/notifications/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(notification)
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }
  } catch (error) {
    console.error('Email notification error:', error);
    // Don't throw error to prevent breaking the main flow
  }
};

/**
 * Send login notification email
 */
export const sendLoginNotification = async (userEmail: string, userName: string, loginTime: Date): Promise<void> => {
  const formattedDate = new Date(loginTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  await sendEmail({
    to: userEmail,
    subject: 'New Login to Your GrihaMate Account',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2E5E99, #2E5E99); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">GrihaMate</h1>
        </div>
        <div style="padding: 30px; background-color: #f8f6f3;">
          <h2 style="color: #2E5E99;">Hello ${userName}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            We detected a new login to your GrihaMate account.
          </p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Login Time:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>IP Address:</strong> [Your IP]</p>
            <p style="margin: 5px 0;"><strong>Device:</strong> [Your Device]</p>
          </div>
          <p style="color: #4b5563; font-size: 14px;">
            If this wasn't you, please secure your account immediately by changing your password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/profile" 
               style="background-color: #2E5E99; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Account Settings
            </a>
          </div>
        </div>
        <div style="background-color: #e5e7eb; padding: 20px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2026 GrihaMate. All rights reserved.
          </p>
        </div>
      </div>
    `,
    type: 'login'
  });
};

/**
 * Send property contact notification to landlord
 */
export const sendContactNotification = async (
  landlordEmail: string,
  landlordName: string,
  seekerName: string,
  seekerEmail: string,
  propertyTitle: string,
  message: string
): Promise<void> => {
  await sendEmail({
    to: landlordEmail,
    subject: `New Inquiry for Your Property: ${propertyTitle}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2E5E99, #2E5E99); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🏠 GrihaMate</h1>
        </div>
        <div style="padding: 30px; background-color: #f8f6f3;">
          <h2 style="color: #2E5E99;">Hello ${landlordName}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Great news! Someone is interested in your property.
          </p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2E5E99;">
            <h3 style="color: #2E5E99; margin-top: 0;">Property Inquiry Details</h3>
            <p style="margin: 10px 0;"><strong>Property:</strong> ${propertyTitle}</p>
            <p style="margin: 10px 0;"><strong>From:</strong> ${seekerName}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${seekerEmail}</p>
            <div style="background-color: #f8f6f3; padding: 15px; border-radius: 6px; margin-top: 15px;">
              <p style="margin: 0; color: #4b5563;"><strong>Message:</strong></p>
              <p style="margin: 10px 0 0 0; color: #4b5563;">${message}</p>
            </div>
          </div>
          <p style="color: #4b5563; font-size: 14px;">
            Please respond to the inquiry at your earliest convenience. Prompt responses lead to better rental outcomes!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${seekerEmail}" 
               style="background-color: #2E5E99; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
              Reply via Email
            </a>
            <a href="${window.location.origin}/dashboard/landlord" 
               style="background-color: white; color: #2E5E99; border: 2px solid #2E5E99; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
              View Dashboard
            </a>
          </div>
        </div>
        <div style="background-color: #e5e7eb; padding: 20px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2026 GrihaMate. All rights reserved.
          </p>
        </div>
      </div>
    `,
    type: 'contact'
  });
};

/**
 * Send booking confirmation to seeker
 */
export const sendBookingConfirmation = async (
  seekerEmail: string,
  seekerName: string,
  propertyTitle: string,
  landlordName: string,
  landlordPhone: string,
  bookingDate: Date,
  moveInDate: string,
  monthlyRent: number
): Promise<void> => {
  const formattedBookingDate = new Date(bookingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  await sendEmail({
    to: seekerEmail,
    subject: `Booking Confirmed: ${propertyTitle}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">✓ Booking Confirmed!</h1>
        </div>
        <div style="padding: 30px; background-color: #f8f6f3;">
          <h2 style="color: #10b981;">Congratulations ${seekerName}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your property booking has been successfully confirmed.
          </p>
          <div style="background-color: white; padding: 25px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2E5E99; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Booking Details</h3>
            <p style="margin: 12px 0;"><strong>Property:</strong> ${propertyTitle}</p>
            <p style="margin: 12px 0;"><strong>Monthly Rent:</strong> Rs. ${monthlyRent.toLocaleString()}</p>
            <p style="margin: 12px 0;"><strong>Move-in Date:</strong> ${moveInDate}</p>
            <p style="margin: 12px 0;"><strong>Booking Date:</strong> ${formattedBookingDate}</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <h4 style="color: #2E5E99; margin-top: 0;">Landlord Contact</h4>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${landlordName}</p>
              <p style="margin: 8px 0;"><strong>Phone:</strong> ${landlordPhone}</p>
            </div>
          </div>
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Next Steps:</strong> Please contact the landlord to finalize the paperwork and arrange for key handover.
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/dashboard/seeker" 
               style="background-color: #2E5E99; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View My Dashboard
            </a>
          </div>
        </div>
        <div style="background-color: #e5e7eb; padding: 20px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2026 GrihaMate. All rights reserved.
          </p>
        </div>
      </div>
    `,
    type: 'booking'
  });
};

/**
 * Send property listing confirmation to landlord
 */
export const sendListingConfirmation = async (
  landlordEmail: string,
  landlordName: string,
  propertyTitle: string,
  propertyType: string,
  monthlyRent: number,
  listingDate: Date
): Promise<void> => {
  const formattedDate = new Date(listingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  await sendEmail({
    to: landlordEmail,
    subject: `Property Listed Successfully: ${propertyTitle}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2E5E99, #2E5E99); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Property Listed!</h1>
        </div>
        <div style="padding: 30px; background-color: #f8f6f3;">
          <h2 style="color: #2E5E99;">Great job, ${landlordName}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your property has been successfully listed on GrihaMate and is now visible to thousands of potential renters.
          </p>
          <div style="background-color: white; padding: 25px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2E5E99; margin-top: 0;">Property Details</h3>
            <p style="margin: 12px 0;"><strong>Title:</strong> ${propertyTitle}</p>
            <p style="margin: 12px 0;"><strong>Type:</strong> ${propertyType}</p>
            <p style="margin: 12px 0;"><strong>Monthly Rent:</strong> Rs. ${monthlyRent.toLocaleString()}</p>
            <p style="margin: 12px 0;"><strong>Listed On:</strong> ${formattedDate}</p>
            <p style="margin: 12px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Active</span></p>
          </div>
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 6px; border-left: 4px solid #7BA4D0; margin: 20px 0;">
            <p style="margin: 0; color: #2E5E99; font-size: 14px;">
              <strong>💡 Pro Tip:</strong> Properties with high-quality photos and detailed descriptions get 3x more inquiries!
            </p>
          </div>
          <p style="color: #4b5563; font-size: 14px;">
            You'll receive email notifications when someone contacts you about this property.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/manage-properties" 
               style="background-color: #2E5E99; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
              Manage Properties
            </a>
            <a href="${window.location.origin}/dashboard/landlord" 
               style="background-color: white; color: #2E5E99; border: 2px solid #2E5E99; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
              View Dashboard
            </a>
          </div>
        </div>
        <div style="background-color: #e5e7eb; padding: 20px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2026 GrihaMate. All rights reserved.
          </p>
        </div>
      </div>
    `,
    type: 'listing'
  });
};

/**
 * Test email notification (for development)
 */
export const sendTestEmail = async (email: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Test Email from GrihaMate',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f8f6f3;">
        <h2 style="color: #2E5E99;">Email Service Test</h2>
        <p style="color: #4b5563;">This is a test email from GrihaMate. If you're seeing this, the email service is working correctly!</p>
        <p style="color: #10b981; font-weight: bold;">✓ Email delivery successful</p>
      </div>
    `,
    type: 'general'
  });
};

