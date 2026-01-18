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

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(UserDto.fromEntity(user));
    }

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

