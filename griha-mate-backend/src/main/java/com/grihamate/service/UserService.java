package com.grihamate.service;

import com.grihamate.dto.RegisterRequest;
import com.grihamate.dto.UserDto;
import com.grihamate.entity.EmailOtp;
import com.grihamate.entity.EmailVerificationToken;
import com.grihamate.entity.PropertyVerification;
import com.grihamate.entity.User;
import com.grihamate.repository.EmailOtpRepository;
import com.grihamate.repository.EmailVerificationTokenRepository;
import com.grihamate.repository.PropertyVerificationRepository;
import com.grihamate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PropertyVerificationRepository propertyVerificationRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailOtpRepository otpRepository;
    private final EmailService emailService;

    @Transactional
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

    public String generateVerificationToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    @Transactional
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

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public UserDto upgradeToPremium(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.Role.LANDLORD) {
            throw new RuntimeException("Only landlords can upgrade subscription");
        }

        user.setSubscriptionStatus(User.SubscriptionStatus.PREMIUM);
        User savedUser = userRepository.save(user); // Persist change
        return mapToDto(savedUser);
    }

    @Transactional
    public void upgradeToPremiumById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setSubscriptionStatus(User.SubscriptionStatus.PREMIUM);
        userRepository.save(user);
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
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
