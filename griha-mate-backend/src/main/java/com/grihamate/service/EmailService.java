package com.grihamate.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Email service for sending various types of emails in the GrihaMate platform.
 * Handles welcome emails, verification emails, login notifications, contact
 * notifications, etc.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Sends a welcome email to newly registered users.
     * 
     * @param toEmail  The recipient's email address
     * @param userName The user's full name
     * @param userType The user's role (SEEKER or LANDLORD)
     */
    public void sendWelcomeEmail(String toEmail, String userName, String userType) {
        if (toEmail == null || toEmail.isEmpty()) {
            log.warn("Cannot send welcome email: email address is null or empty");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to GrihaMate!");

            String userRoleName = userType != null && userType.equals("SEEKER") ? "Seeker" : "Landlord";
            String nextSteps = userType != null && userType.equals("SEEKER")
                    ? "3. Start exploring verified properties in Nepal.\n"
                    : "3. List your first property and start connecting with seekers.\n";

            message.setText(
                    "Dear " + userName + ",\n\n" +
                            "Welcome to GrihaMate - Nepal's most trusted platform for finding rooms, flats, and roommates!\n\n"
                            +
                            "We're excited to have you join our community. Your account has been successfully created as a "
                            +
                            userRoleName + ".\n\n" +
                            "What's next?\n" +
                            "1. Please verify your email address by clicking the verification link we've sent separately.\n"
                            +
                            "2. Complete your profile to get the best experience.\n" +
                            nextSteps +
                            "\n" +
                            "If you have any questions, feel free to reach out to our support team.\n\n" +
                            "Best regards,\n" +
                            "GrihaMate Team");
            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
            // Don't throw exception - welcome email is not critical
        }
    }

    /**
     * Sends an email verification link to the user.
     * 
     * @param toEmail  The recipient's email address
     * @param token    The verification token
     * @param userName The user's full name
     * @throws RuntimeException if email sending fails
     */
    public void sendVerificationEmail(String toEmail, String token, String userName) {
        if (toEmail == null || toEmail.isEmpty()) {
            log.warn("Cannot send verification email: email address is null or empty");
            throw new RuntimeException("Email address is required");
        }

        if (token == null || token.isEmpty()) {
            log.warn("Cannot send verification email: token is null or empty");
            throw new RuntimeException("Verification token is required");
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Verify Your GrihaMate Account");

            String verificationLink = frontendUrl + "/verify-email?token=" + token;

            message.setText(
                    "Dear " + userName + ",\n\n" +
                            "Thank you for registering with GrihaMate!\n\n" +
                            "Please verify your email address by clicking the following link:\n" +
                            verificationLink + "\n\n" +
                            "This link will expire in 24 hours.\n\n" +
                            "If you did not register for GrihaMate, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "GrihaMate Team");
            mailSender.send(message);
            log.info("Verification email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send verification email: " + e.getMessage(), e);
        }
    }

    /**
     * Sends a login notification email to the user.
     * 
     * @param toEmail   The recipient's email address
     * @param userName  The user's full name
     * @param loginTime The login timestamp
     */
    public void sendLoginNotification(String toEmail, String userName, String loginTime) {
        if (toEmail == null || toEmail.isEmpty()) {
            log.warn("Cannot send login notification: email address is null or empty");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("GrihaMate - Login Notification");
            message.setText(
                    "Dear " + userName + ",\n\n" +
                            "You have successfully logged into your GrihaMate account.\n\n" +
                            "Login Time: " + (loginTime != null ? loginTime : "Just now") + "\n\n" +
                            "If this was not you, please contact support immediately.\n\n" +
                            "Best regards,\n" +
                            "GrihaMate Team");
            mailSender.send(message);
            log.info("Login notification sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send login notification to: {}", toEmail, e);
            // Don't throw exception for login notifications - they're not critical
        }
    }

    /**
     * Sends an email notification when user verification status is updated by
     * admin.
     * 
     * @param toEmail  The recipient's email address
     * @param userName The user's full name
     * @param status   The verification status (VERIFIED or REJECTED)
     * @param userType The user's role (SEEKER or LANDLORD)
     */
    public void sendVerificationStatusUpdate(String toEmail, String userName, String status, String userType) {
        if (toEmail == null || toEmail.isEmpty()) {
            log.warn("Cannot send verification status update: email address is null or empty");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("GrihaMate - Account Verification Status");

            String userRoleName = userType != null ? userType : "account";
            String statusMessage = status != null && status.equals("VERIFIED")
                    ? "Your account has been verified. You can now access all features.\n\n"
                    : "Your verification request has been rejected. Please contact support for more information.\n\n";

            message.setText(
                    "Dear " + userName + ",\n\n" +
                            "Your " + userRoleName + " account verification status has been updated.\n\n" +
                            "Status: " + (status != null ? status : "UNKNOWN") + "\n\n" +
                            statusMessage +
                            "Best regards,\n" +
                            "GrihaMate Team");
            mailSender.send(message);
            log.info("Verification status update email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification status update to: {}", toEmail, e);
            // Don't throw exception - email notification is not critical for verification
            // process
        }
    }

    public void sendPropertyVerificationStatus(String toEmail, String userName, String propertyTitle, String status) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("GrihaMate - Property Verification Status");
            message.setText(
                    "Dear " + userName + ",\n\n" +
                            "Your property listing verification status has been updated.\n\n" +
                            "Property: " + propertyTitle + "\n" +
                            "Status: " + status + "\n\n" +
                            (status.equals("VERIFIED")
                                    ? "Your property is now live and visible to seekers.\n\n"
                                    : "Your property verification has been rejected. Please contact support for more information.\n\n")
                            +
                            "Best regards,\n" +
                            "GrihaMate Team");
            mailSender.send(message);
            log.info("Property verification status email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send property verification status to: {}", toEmail, e);
        }
    }

    /**
     * Sends a notification email to landlord when a seeker contacts them.
     * 
     * @param landlordEmail The landlord's email address
     * @param seekerName    The seeker's full name
     * @param seekerEmail   The seeker's email address
     * @param seekerPhone   The seeker's phone number
     * @param propertyTitle The property title
     * @param message       The contact message from seeker
     */
    public void sendContactNotification(String landlordEmail, String seekerName, String seekerEmail,
            String seekerPhone, String propertyTitle, String message) {
        if (landlordEmail == null || landlordEmail.isEmpty()) {
            log.warn("Cannot send contact notification: landlord email is null or empty");
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(landlordEmail);
            mailMessage.setSubject("New Contact Request for Your Property: "
                    + (propertyTitle != null ? propertyTitle : "Property Listing"));
            mailMessage.setText(
                    "Dear Landlord,\n\n" +
                            "You have received a new contact request for your property listing.\n\n" +
                            "Property: " + (propertyTitle != null ? propertyTitle : "N/A") + "\n\n" +
                            "Seeker Details:\n" +
                            "Name: " + (seekerName != null ? seekerName : "N/A") + "\n" +
                            "Email: " + (seekerEmail != null ? seekerEmail : "N/A") + "\n" +
                            "Phone: " + (seekerPhone != null ? seekerPhone : "N/A") + "\n\n" +
                            "Message:\n" + (message != null ? message : "No message provided") + "\n\n" +
                            "Please contact the seeker at your earliest convenience.\n\n" +
                            "Best regards,\n" +
                            "GrihaMate Team");
            mailSender.send(mailMessage);
            log.info("Contact notification sent successfully to landlord: {}", landlordEmail);
        } catch (Exception e) {
            log.error("Failed to send contact notification to landlord: {}", landlordEmail, e);
            // Don't throw exception - email notification is not critical
        }
    }

    /**
     * Sends a confirmation email to seeker when they contact a landlord.
     * 
     * @param seekerEmail   The seeker's email address
     * @param landlordName  The landlord's full name
     * @param landlordEmail The landlord's email address
     * @param landlordPhone The landlord's phone number
     * @param propertyTitle The property title
     */
    public void sendContactConfirmation(String seekerEmail, String landlordName, String landlordEmail,
            String landlordPhone, String propertyTitle) {
        if (seekerEmail == null || seekerEmail.isEmpty()) {
            log.warn("Cannot send contact confirmation: seeker email is null or empty");
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(seekerEmail);
            mailMessage.setSubject("Contact Request Sent - " + (propertyTitle != null ? propertyTitle : "Property"));
            mailMessage.setText(
                    "Dear Seeker,\n\n" +
                            "Your contact request has been sent successfully!\n\n" +
                            "Property: " + (propertyTitle != null ? propertyTitle : "N/A") + "\n\n" +
                            "Landlord Details:\n" +
                            "Name: " + (landlordName != null ? landlordName : "N/A") + "\n" +
                            "Email: " + (landlordEmail != null ? landlordEmail : "N/A") + "\n" +
                            "Phone: " + (landlordPhone != null ? landlordPhone : "N/A") + "\n\n" +
                            "The landlord has been notified and will contact you soon.\n\n" +
                            "Best regards,\n" +
                            "GrihaMate Team");
            mailSender.send(mailMessage);
            log.info("Contact confirmation sent successfully to seeker: {}", seekerEmail);
        } catch (Exception e) {
            log.error("Failed to send contact confirmation to seeker: {}", seekerEmail, e);
            // Don't throw exception - email notification is not critical
        }
    }

    /**
     * Sends an OTP email for email verification during registration.
     * 
     * @param toEmail  The recipient's email address
     * @param otp      The 6-digit OTP code
     * @param userName The user's full name (optional, can be "User" if not
     *                 provided)
     */
    public void sendOtpEmail(String toEmail, String otp, String userName) {
        if (toEmail == null || toEmail.isEmpty()) {
            log.warn("Cannot send OTP email: email address is null or empty");
            throw new RuntimeException("Email address is required");
        }

        if (otp == null || otp.isEmpty()) {
            log.warn("Cannot send OTP email: OTP is null or empty");
            throw new RuntimeException("OTP is required");
        }

        // Log OTP for testing
        log.info("TESTING OTP for {}: {}", toEmail, otp);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("GrihaMate - Email Verification Code");

            String displayName = (userName != null && !userName.isEmpty()) ? userName : "User";

            message.setText(
                    "Dear " + displayName + ",\n\n" +
                            "Thank you for registering with GrihaMate!\n\n" +
                            "Your email verification code is:\n\n" +
                            "  " + otp + "\n\n" +
                            "This code will expire in 10 minutes.\n\n" +
                            "If you did not request this code, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "GrihaMate Team");
            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage(), e);
        }
    }

    /**
     * Sends an email notification to seeker when a matching room becomes available.
     * 
     * @param seekerEmail   The seeker's email address
     * @param seekerName    The seeker's full name
     * @param propertyTitle The property title
     * @param city          The property city
     * @param district      The property district
     * @param address       The property address
     * @param price         The property price
     * @param bedrooms      Number of bedrooms
     * @param propertyType  The property type
     * @param propertyUrl   The URL to view the property
     */
    public void sendRoomMatchNotification(String seekerEmail, String seekerName, String propertyTitle,
            String city, String district, String address, java.math.BigDecimal price,
            Integer bedrooms, String propertyType, String propertyUrl) {
        if (seekerEmail == null || seekerEmail.isEmpty()) {
            log.warn("Cannot send room match notification: email address is null or empty");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(seekerEmail);
            message.setSubject("🎉 Great News! A Room Matching Your Request is Available");

            String propertyDetails = "Property: " + (propertyTitle != null ? propertyTitle : "N/A") + "\n" +
                    "Location: " + (address != null ? address : "") +
                    ", " + (district != null ? district : "") +
                    ", " + (city != null ? city : "N/A") + "\n" +
                    "Price: Rs. " + (price != null ? price.toString() : "N/A") + " per month\n" +
                    "Bedrooms: " + (bedrooms != null ? bedrooms.toString() : "N/A") + "\n" +
                    "Type: " + (propertyType != null ? propertyType : "N/A");

            message.setText(
                    "Dear " + seekerName + ",\n\n" +
                            "Great news! We found a room that matches your request!\n\n" +
                            propertyDetails + "\n\n" +
                            "View the property details and contact the landlord:\n" +
                            propertyUrl + "\n\n" +
                            "Don't miss out - properties in this location get booked quickly!\n\n" +
                            "Best regards,\n" +
                            "GrihaMate Team\n\n" +
                            "P.S. You can manage your room requests in your dashboard.");
            mailSender.send(message);
            log.info("Room match notification sent successfully to: {}", seekerEmail);
        } catch (Exception e) {
            log.error("Failed to send room match notification to: {}", seekerEmail, e);
        }
    }

    /**
     * Sends a notification email to seeker when their request status is updated.
     * 
     * @param seekerEmail   The seeker's email address
     * @param seekerName    The seeker's full name
     * @param propertyTitle The property title
     * @param status        The new status (ACCEPTED, REJECTED)
     * @param message       Optional message from landlord
     */
    public void sendRequestStatusNotification(String seekerEmail, String seekerName, String propertyTitle,
            String status,
            String message) {
        if (seekerEmail == null || seekerEmail.isEmpty()) {
            log.warn("Cannot send request status notification: email address is null or empty");
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(seekerEmail);
            mailMessage.setSubject(
                    "Update on Your Property Request: " + (propertyTitle != null ? propertyTitle : "Property"));

            String statusText = status.equals("ACCEPTED") ? "ACCEPTED" : "REJECTED";
            String actionRequired = status.equals("ACCEPTED")
                    ? "Please proceed to payment to finalize your booking."
                    : "You can continue searching for other properties.";

            mailMessage.setText(
                    "Dear " + seekerName + ",\n\n" +
                            "The landlord has updated the status of your request for the property: "
                            + (propertyTitle != null ? propertyTitle : "N/A") + "\n\n" +
                            "Status: " + statusText + "\n\n" +
                            (message != null && !message.isEmpty() ? "Landlord Message: " + message + "\n\n" : "") +
                            actionRequired + "\n\n" +
                            "Best regards,\n" +
                            "GrihaMate Team");
            mailSender.send(mailMessage);
            log.info("Request status notification sent successfully to seeker: {}", seekerEmail);
        } catch (Exception e) {
            log.error("Failed to send request status notification to seeker: {}", seekerEmail, e);
        }
    }

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("HTML email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send HTML email to: {}", to, e);
        }
    }
}
