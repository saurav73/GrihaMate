package com.grihamate.controller;

import com.grihamate.dto.PropertyDto;
import com.grihamate.dto.UserDto;
import com.grihamate.entity.Property;
import com.grihamate.entity.User;
import com.grihamate.repository.PropertyRepository;
import com.grihamate.repository.UserRepository;
import com.grihamate.service.EmailService;
import com.grihamate.service.PropertyService;
import com.grihamate.service.RoomRequestService;
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
    private final PropertyRepository propertyRepository;
    private final EmailService emailService;
    private final RoomRequestService roomRequestService;
    private final PropertyService propertyService;
    private final com.grihamate.service.UserService userService;

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
        userService.verifyUser(id);
        return ResponseEntity.ok(java.util.Map.of("message", "User verified successfully"));
    }

    @PutMapping("/users/{id}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        userService.rejectUser(id);
        return ResponseEntity.ok(java.util.Map.of("message", "User rejected"));
    }

    @GetMapping("/properties")
    public ResponseEntity<List<PropertyDto>> getAllProperties() {
        List<Property> properties = propertyRepository.findAll();
        List<PropertyDto> propertyDtos = properties.stream()
                .map(PropertyDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(propertyDtos);
    }

    @PutMapping("/properties/{id}/verify")
    public ResponseEntity<?> verifyProperty(@PathVariable Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        property.setVerified(true);
        Property savedProperty = propertyRepository.save(property);

        // Send verification email to landlord
        try {
            emailService.sendPropertyVerificationStatus(
                    property.getLandlord().getEmail(),
                    property.getLandlord().getFullName(),
                    property.getTitle(),
                    "VERIFIED");
        } catch (Exception e) {
            System.err.println("Failed to send property verification email: " + e.getMessage());
        }

        // Check for matching room requests and notify seekers
        try {
            roomRequestService.checkAndNotifyForNewProperty(savedProperty);
        } catch (Exception e) {
            System.err.println("Failed to check room request matches: " + e.getMessage());
        }

        return ResponseEntity.ok(java.util.Map.of("message", "Property verified successfully"));
    }

    @PutMapping("/properties/{id}/reject")
    public ResponseEntity<?> rejectProperty(@PathVariable Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        property.setVerified(false);
        propertyRepository.save(property);

        // Send rejection email to landlord
        try {
            emailService.sendPropertyVerificationStatus(
                    property.getLandlord().getEmail(),
                    property.getLandlord().getFullName(),
                    property.getTitle(),
                    "REJECTED");
        } catch (Exception e) {
            System.err.println("Failed to send property rejection email: " + e.getMessage());
        }

        return ResponseEntity.ok(java.util.Map.of("message", "Property rejected"));
    }
}
