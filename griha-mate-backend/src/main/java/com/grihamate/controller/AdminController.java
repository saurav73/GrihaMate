package com.grihamate.controller;

import com.grihamate.dto.UserDto;
import com.grihamate.entity.User;
import com.grihamate.repository.UserRepository;
import com.grihamate.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserRepository userRepository;
    private final EmailService emailService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtos = users.stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @PutMapping("/users/{id}/verify")
    public ResponseEntity<?> verifyUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setVerificationStatus(User.VerificationStatus.VERIFIED);
        userRepository.save(user);
        
        // Send verification status update email
        try {
            emailService.sendVerificationStatusUpdate(
                    user.getEmail(),
                    user.getFullName(),
                    "VERIFIED",
                    user.getRole().name()
            );
        } catch (Exception e) {
            // Log error but don't fail the verification
            System.err.println("Failed to send verification status email: " + e.getMessage());
        }
        
        return ResponseEntity.ok(java.util.Map.of("message", "User verified successfully"));
    }

    @PutMapping("/users/{id}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setVerificationStatus(User.VerificationStatus.REJECTED);
        userRepository.save(user);
        
        // Send verification status update email
        try {
            emailService.sendVerificationStatusUpdate(
                    user.getEmail(),
                    user.getFullName(),
                    "REJECTED",
                    user.getRole().name()
            );
        } catch (Exception e) {
            // Log error but don't fail the rejection
            System.err.println("Failed to send rejection email: " + e.getMessage());
        }
        
        return ResponseEntity.ok(java.util.Map.of("message", "User rejected"));
    }
}

