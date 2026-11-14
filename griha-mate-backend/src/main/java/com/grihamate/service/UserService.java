package com.grihamate.service;

import com.grihamate.dto.RegisterRequest;
import com.grihamate.dto.UserDto;
import com.grihamate.entity.EmailOtp;
import com.grihamate.entity.EmailVerificationToken;
import com.grihamate.entity.PasswordResetToken;
import com.grihamate.entity.PropertyVerification;
import com.grihamate.entity.User;
import com.grihamate.repository.EmailOtpRepository;
import com.grihamate.repository.EmailVerificationTokenRepository;
import com.grihamate.repository.PasswordResetTokenRepository;
import com.grihamate.repository.PropertyVerificationRepository;
import com.grihamate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

/**
 * Service implementing user account business logic.
 */
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PropertyVerificationRepository propertyVerificationRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailOtpRepository otpRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    @Transactional
    /**
     * Registers a new seeker or landlord. The email must be unused, and a seeker's
     * citizenship number must not already be registered. The password is stored
     * BCrypt-encoded. Email is treated as verified at registration (verified by OTP
     * during signup) and the account starts VERIFIED. Landlords who supplied a property
     * address get a PENDING property-verification record. A welcome email is attempted
     * but a failure does not fail registration.
     *
     * @param request registration details (name, email, password, role, role-specific documents)
     * @return the saved user
     * @throws RuntimeException if the email (or the seeker's citizenship number) is already registered
     */
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (request.getUserType() == User.Role.SEEKER && request.getCitizenshipNumber() != null) {
            if (userRepository.existsByCitizenshipNumber(request.getCitizenshipNumber())) {
                throw new RuntimeException("Citizenship number already registered");
            }
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProfileImageUrl(request.getProfileImageUrl());
        user.setRole(request.getUserType());
        // Email is verified during registration via OTP, so set to true
        user.setEmailVerified(true);
        // For testing/development convenience, auto-verify all users
        user.setVerificationStatus(User.VerificationStatus.VERIFIED);

        // Set seeker-specific fields
        if (request.getUserType() == User.Role.SEEKER) {
            user.setCitizenshipNumber(request.getCitizenshipNumber());
            user.setCitizenshipFrontUrl(request.getCitizenshipFrontUrl());
            user.setCitizenshipBackUrl(request.getCitizenshipBackUrl());
        }

        // Set landlord-specific fields
        if (request.getUserType() == User.Role.LANDLORD) {
            user.setKycDocumentType(request.getKycDocumentType());
            user.setKycDocumentUrl(request.getKycDocumentUrl());
        }

        User savedUser = userRepository.save(user);

        // Send welcome email
        try {
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole().name());
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

        // Create property verification for landlord
        if (request.getUserType() == User.Role.LANDLORD && request.getPropertyAddress() != null) {
            PropertyVerification verification = new PropertyVerification();
            verification.setLandlord(savedUser);
            verification.setPropertyAddress(request.getPropertyAddress());
            verification.setPropertyDocumentUrl(request.getPropertyDocumentUrl());
            verification.setStatus(PropertyVerification.VerificationStatus.PENDING);
            propertyVerificationRepository.save(verification);
        }

        return savedUser;
    }

    /**
     * Generates a cryptographically random URL-safe token (32 random bytes, Base64
     * encoded) for email verification links.
     *
     * @return random verification token
     */
    public String generateVerificationToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    @Transactional
    /**
     * Issues a fresh email-verification token (valid 1 day) and emails the verification
     * link to a user whose email is not yet verified.
     *
     * @param email email address of the unverified user
     * @throws RuntimeException if the user is missing or the email is already verified
     */
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        // Generate new token
        String token = generateVerificationToken();
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusDays(1));
        verificationToken.setUsed(false);
        tokenRepository.save(verificationToken);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), token, user.getFullName());
    }

    @Transactional
    /**
     * Verifies a user's email from a verification link token. The token must be unused
     * and unexpired; it is marked used so a link works only once.
     *
     * @param token verification token from the email link
     * @return true when the email was verified
     * @throws RuntimeException if the token is unknown, already used, or expired
     */
    public boolean verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification token"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);

        return true;
    }

    /**
     * Generate a 6-digit OTP for email verification
     */
    public String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000); // 6-digit OTP
        return String.valueOf(otp);
    }

    /**
     * Send OTP to email for verification during registration
     */
    @Transactional
    public void sendEmailOtp(String email, String userName) {
        // Delete any existing unused OTPs for this email
        otpRepository.deleteUnusedOtpsByEmail(email);

        // Generate new OTP
        String otp = generateOtp();

        // Save OTP to database
        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(email);
        emailOtp.setOtp(otp);
        emailOtp.setExpiryDate(LocalDateTime.now().plusMinutes(10)); // OTP expires in 10 minutes
        emailOtp.setUsed(false);
        otpRepository.save(emailOtp);

        // Send OTP via email
        emailService.sendOtpEmail(email, otp, userName);
    }

    /**
     * Verify OTP for email verification during registration
     */
    @Transactional
    public boolean verifyEmailOtp(String email, String otp) {
        EmailOtp emailOtp = otpRepository.findByEmailAndOtpAndUsedFalse(email, otp)
                .orElseThrow(() -> new RuntimeException("Invalid or expired OTP"));

        if (emailOtp.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        // Mark OTP as used
        emailOtp.setUsed(true);
        otpRepository.save(emailOtp);

        return true;
    }

    @Transactional
    /**
     * Approves a user (admin action): sets verification status to VERIFIED so the user
     * can list properties or send requests, and emails them the outcome. A failed
     * email does not undo the approval.
     *
     * @param userId id of the user to approve
     * @throws RuntimeException if no user with that id exists
     */
    public void verifyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerificationStatus(User.VerificationStatus.VERIFIED);

        // Send email notification
        try {
            emailService.sendVerificationStatusUpdate(user.getEmail(), user.getFullName(), "VERIFIED",
                    user.getRole().name());
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
        }

        userRepository.save(user);
    }

    @Transactional
    /**
     * Rejects a user (admin action): sets verification status to REJECTED and emails
     * them the outcome. A failed email does not undo the rejection.
     *
     * @param userId id of the user to reject
     * @throws RuntimeException if no user with that id exists
     */
    public void rejectUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerificationStatus(User.VerificationStatus.REJECTED);

        // Send email notification
        try {
            emailService.sendVerificationStatusUpdate(user.getEmail(), user.getFullName(), "REJECTED",
                    user.getRole().name());
        } catch (Exception e) {
            System.err.println("Failed to send rejection email: " + e.getMessage());
        }

        userRepository.save(user);
    }

    @Transactional
    /**
     * Sends a user back to PENDING verification (admin action), for example when
     * documents must be re-checked.
     *
     * @param userId id of the user
     * @throws RuntimeException if no user with that id exists
     */
    public void resetUserVerificationStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerificationStatus(User.VerificationStatus.PENDING);
        userRepository.save(user);
    }

    /**
     * Loads a user by email address.
     *
     * @param email email address to look up
     * @return the user
     * @throws RuntimeException if no user with that email exists
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    /**
     * Upgrades a landlord to the PREMIUM subscription for 3 months from today.
     * Only landlords may hold a premium subscription.
     *
     * @param email email of the landlord
     * @return the upgraded user, as a DTO
     * @throws RuntimeException if the user is missing or is not a landlord
     */
    public UserDto upgradeToPremium(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.Role.LANDLORD) {
            throw new RuntimeException("Only landlords can upgrade subscription");
        }

        user.setSubscriptionStatus(User.SubscriptionStatus.PREMIUM);
        user.setSubscriptionExpiry(LocalDateTime.now().plusMonths(3));
        User savedUser = userRepository.save(user); // Persist change
        return mapToDto(savedUser);
    }

    @Transactional
    /**
     * Upgrades a user to PREMIUM for 3 months by id (used after a payment callback,
     * where only the user id is known). Unlike {@link #upgradeToPremium(String)} this
     * does not check the role.
     *
     * @param id id of the user to upgrade
     * @throws RuntimeException if no user with that id exists
     */
    public void upgradeToPremiumById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setSubscriptionStatus(User.SubscriptionStatus.PREMIUM);
        user.setSubscriptionExpiry(LocalDateTime.now().plusMonths(3));
        userRepository.save(user);
    }

    @Transactional
    /**
     * Downgrades a user to the FREE subscription by email (used when a premium
     * subscription expires).
     *
     * @param email email of the user
     * @throws RuntimeException if no user with that email exists
     */
    public void downgradeToFree(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setSubscriptionStatus(User.SubscriptionStatus.FREE);
        userRepository.save(user);
    }

    @Transactional
    /**
     * Downgrades a user to the FREE subscription by id (used by the scheduled
     * expiry check, where only the user id is known).
     *
     * @param userId id of the user
     * @throws RuntimeException if no user with that id exists
     */
    public void downgradeToFreeById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setSubscriptionStatus(User.SubscriptionStatus.FREE);
        userRepository.save(user);
    }

    /**
     * Generate password reset token and send reset email
     */
    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email"));

        // Delete any existing unused tokens for this user
        passwordResetTokenRepository.findByUserAndUsedFalse(user)
                .ifPresent(token -> passwordResetTokenRepository.delete(token));

        // Create new password reset token
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1)); // Token expires in 1 hour
        resetToken.setUsed(false);
        passwordResetTokenRepository.save(resetToken);

        // Send password reset email
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken.getToken(), user.getFullName());
    }

    /**
     * Validate password reset token
     */
    public boolean validatePasswordResetToken(String token) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElse(null);

        if (resetToken == null || resetToken.getUsed() || resetToken.isExpired()) {
            return false;
        }

        return true;
    }

    /**
     * Reset password using token
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (resetToken.getUsed()) {
            throw new RuntimeException("This reset token has already been used");
        }

        if (resetToken.isExpired()) {
            throw new RuntimeException("Reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        dto.setRole(user.getRole());
        dto.setActive(user.getActive());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setCitizenshipNumber(user.getCitizenshipNumber());
        dto.setVerificationStatus(user.getVerificationStatus());
        dto.setSubscriptionStatus(user.getSubscriptionStatus());
        dto.setSubscriptionExpiry(user.getSubscriptionExpiry());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
