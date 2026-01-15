package com.grihamate.controller;

import com.grihamate.entity.Property;
import com.grihamate.entity.User;
import com.grihamate.repository.PropertyRepository;
import com.grihamate.repository.UserRepository;
import com.grihamate.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class ContactController {
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @PostMapping("/landlord/{propertyId}")
    public ResponseEntity<?> contactLandlord(
            @PathVariable Long propertyId,
            @RequestBody Map<String, String> request) {
        
        try {
            // Get current user (seeker)
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User seeker = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if seeker is verified
            if (seeker.getVerificationStatus() != User.VerificationStatus.VERIFIED) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Only verified seekers can contact landlords"));
            }

            // Get property and landlord
            Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found"));
            
            User landlord = property.getLandlord();

            // Check if landlord is verified
            if (landlord.getVerificationStatus() != User.VerificationStatus.VERIFIED) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "This landlord is not verified"));
            }

            String message = request.getOrDefault("message", "I am interested in your property: " + property.getTitle());
            String seekerPhone = request.getOrDefault("phone", seeker.getPhoneNumber());

            // Send email to landlord
            emailService.sendContactNotification(
                    landlord.getEmail(),
                    seeker.getFullName(),
                    seeker.getEmail(),
                    seekerPhone,
                    property.getTitle(),
                    message
            );

            // Send confirmation to seeker
            emailService.sendContactConfirmation(
                    seeker.getEmail(),
                    landlord.getFullName(),
                    landlord.getEmail(),
                    landlord.getPhoneNumber(),
                    property.getTitle()
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Contact request sent successfully. The landlord will be notified via email.",
                    "landlordEmail", landlord.getEmail(),
                    "landlordPhone", landlord.getPhoneNumber()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to send contact request: " + e.getMessage()));
        }
    }
}







