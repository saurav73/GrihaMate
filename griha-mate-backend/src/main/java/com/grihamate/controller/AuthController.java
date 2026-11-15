package com.grihamate.controller;

import com.grihamate.dto.AuthRequest;
import com.grihamate.dto.AuthResponse;
import com.grihamate.dto.RegisterRequest;
import com.grihamate.dto.UserDto;
import com.grihamate.entity.User;
import com.grihamate.repository.UserRepository;
import com.grihamate.service.EmailService;
import com.grihamate.service.JwtService;
import com.grihamate.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * Public auth endpoints: registration, login (JWT), email verification,
 * email/OTP verification, and the forgot-password / reset-password flow.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;

    /** Registers a new user from the validated request and returns the created user profile.
         * @param request validated registration details
         * @return the created user, or a 400/500 response with an error message when registration fails */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User savedUser = userService.register(request);
            UserDto userDto = UserDto.fromEntity(savedUser);
            return ResponseEntity.ok(userDto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    /** Logs a user in: rejects deactivated, unverified, or unapproved-landlord accounts, then
         * authenticates the credentials, issues a JWT, and best-effort sends a login notification email.
         * @param request validated email and password
         * @return the JWT plus the user profile, or a 401/500 response with an error message */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if user is active
            if (!user.getActive()) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("message", "Account is deactivated"));
            }

            // Check if email is verified (for seekers and landlords)
            if (!user.getEmailVerified()) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("message", "Please verify your email before logging in"));
            }

            // Check verification status for landlords
            if (user.getRole() == User.Role.LANDLORD 
                    && user.getVerificationStatus() != User.VerificationStatus.VERIFIED) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("message", "Your account verification is pending. Please wait for admin approval."));
            }
            
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            String token = jwtService.generateToken(userDetails);
            
            // Send login notification email
            try {
                String loginTime = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                emailService.sendLoginNotification(user.getEmail(), user.getFullName(), loginTime);
            } catch (Exception e) {
                // Don't fail login if email fails
                System.err.println("Failed to send login notification: " + e.getMessage());
            }
            
            AuthResponse response = new AuthResponse(token, UserDto.fromEntity(user));
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("message", "Invalid email or password"));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    /** Verifies an email address from the token sent in the verification email.
         * @param token email verification token
         * @return a success message, or a 400/500 response when the token is invalid or expired */
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            boolean verified = userService.verifyEmail(token);
            if (verified) {
                return ResponseEntity.ok(java.util.Map.of("message", "Email verified successfully"));
            } else {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Invalid or expired verification token"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Verification failed: " + e.getMessage()));
        }
    }

    /** Re-sends the verification email to the address in the request body.
         * @param request map containing the {@code email} to re-verify
         * @return a confirmation message, or a 500 response when sending fails */
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody java.util.Map<String, String> request) {
        try {
            String email = request.get("email");
            userService.resendVerificationEmail(email);
            return ResponseEntity.ok(java.util.Map.of("message", "Verification email sent"));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Failed to resend verification: " + e.getMessage()));
        }
    }

    /** Returns the profile of the currently authenticated user.
         * @param principal the authenticated user
         * @return the caller's user profile */
    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(UserDto.fromEntity(user));
    }

    /** Sends a one-time email verification code to an address that is not yet registered.
         * @param request map containing the {@code email} and optional {@code userName}
         * @return a confirmation message, or a 400/500 response when the email is missing or already registered */
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody java.util.Map<String, String> request) {
        try {
            String email = request.get("email");
            String userName = request.getOrDefault("userName", "User");
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Email is required"));
            }

            // Check if email already exists
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Email already registered"));
            }

            userService.sendEmailOtp(email, userName);
            return ResponseEntity.ok(java.util.Map.of("message", "OTP sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Failed to send OTP: " + e.getMessage()));
        }
    }

    /** Verifies the one-time email code sent by {@link #sendOtp}.
         * @param request map containing the {@code email} and the {@code otp} to check
         * @return a success message with {@code verified=true}, or a 400 response for a wrong or expired code */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody java.util.Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Email is required"));
            }
            
            if (otp == null || otp.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "OTP is required"));
            }

            boolean verified = userService.verifyEmailOtp(email, otp);
            if (verified) {
                return ResponseEntity.ok(java.util.Map.of("message", "Email verified successfully", "verified", true));
            } else {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Invalid OTP"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    /** Starts the password-reset flow for the given email. Always returns the same success message
         * whether or not the email exists, so the response never reveals registered addresses.
         * @param request map containing the {@code email} to reset
         * @return a message saying a reset link has been sent (when the email exists) */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Email is required"));
            }

            userService.requestPasswordReset(email);
            return ResponseEntity.ok(java.util.Map.of("message", "Password reset link has been sent to your email"));
        } catch (Exception e) {
            // Don't reveal if email exists or not for security reasons
            return ResponseEntity.ok(java.util.Map.of("message", "If the email exists, a password reset link has been sent"));
        }
    }

    /** Checks whether a password-reset token is still valid, without resetting anything.
         * @param request map containing the reset {@code token}
         * @return {@code {"valid": true/false}}, or a 400 response when the token is missing */
    @PostMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestBody java.util.Map<String, String> request) {
        try {
            String token = request.get("token");
            
            if (token == null || token.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Token is required", "valid", false));
            }

            boolean valid = userService.validatePasswordResetToken(token);
            return ResponseEntity.ok(java.util.Map.of("valid", valid));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage(), "valid", false));
        }
    }

    /** Resets the password for a valid reset token; the new password must be at least 6 characters.
         * @param request map containing the reset {@code token} and the {@code newPassword}
         * @return a success message, or a 400 response when the token or password is invalid */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            
            if (token == null || token.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Token is required"));
            }
            
            if (newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "New password is required"));
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Password must be at least 6 characters long"));
            }

            userService.resetPassword(token, newPassword);
            return ResponseEntity.ok(java.util.Map.of("message", "Password has been reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }
}

