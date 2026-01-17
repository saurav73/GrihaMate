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
    private final com.grihamate.repository.PropertyRequestRepository propertyRequestRepository;
    private final com.grihamate.service.AvailabilitySubscriptionService availabilitySubscriptionService;

    @GetMapping("/stats")
    public ResponseEntity<com.grihamate.dto.AdminStatsDto> getStats() {
        long totalUsers = userRepository.count();
        long verifiedUsers = userRepository.findAll().stream()
                .filter(u -> u.getVerificationStatus() == User.VerificationStatus.VERIFIED).count();
        long pendingUsers = userRepository.findAll().stream()
                .filter(u -> u.getVerificationStatus() == User.VerificationStatus.PENDING).count();

        long totalProperties = propertyRepository.count();
        long verifiedProperties = propertyRepository.findByVerified(true).size();
        long pendingProperties = propertyRepository.findByVerified(false).size();

        long totalRoomRequests = roomRequestService.getAllActiveRequests().size();
        long totalPropertyInquiries = propertyRequestRepository.count();

        // Simple growth data by month (using last 6 months as an example)
        java.util.List<java.util.Map<String, Object>> growthData = new java.util.ArrayList<>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            java.time.YearMonth month = java.time.YearMonth.from(now.minusMonths(i));
            String name = month.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH);

            long count = userRepository.findAll().stream()
                    .filter(u -> u.getCreatedAt() != null &&
                            java.time.YearMonth.from(u.getCreatedAt()).equals(month))
                    .count();

            growthData.add(java.util.Map.of("name", name, "users", count));
        }

        return ResponseEntity.ok(com.grihamate.dto.AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .verifiedUsers(verifiedUsers)
                .pendingUsers(pendingUsers)
                .totalProperties(totalProperties)
                .verifiedProperties(verifiedProperties)
                .pendingProperties(pendingProperties)
                .totalRoomRequests(totalRoomRequests)
                .totalPropertyInquiries(totalPropertyInquiries)
                .growthData(growthData)
                .build());
    }

    @GetMapping("/property-requests")
    public ResponseEntity<List<com.grihamate.dto.PropertyRequestDto>> getAllPropertyRequests() {
        List<com.grihamate.entity.PropertyRequest> requests = propertyRequestRepository.findAll();
        List<com.grihamate.dto.PropertyRequestDto> dtos = requests.stream()
                .map(this::mapPropertyRequestToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private com.grihamate.dto.PropertyRequestDto mapPropertyRequestToDto(com.grihamate.entity.PropertyRequest request) {
        com.grihamate.dto.PropertyRequestDto dto = new com.grihamate.dto.PropertyRequestDto();
        dto.setId(request.getId());
        dto.setSeekerId(request.getSeeker().getId());
        dto.setSeekerName(request.getSeeker().getFullName());
        dto.setSeekerEmail(request.getSeeker().getEmail());
        dto.setPropertyId(request.getProperty().getId());
        dto.setPropertyTitle(request.getProperty().getTitle());
        dto.setPropertyPrice(request.getProperty().getPrice());
        dto.setMessage(request.getMessage());
        dto.setStatus(request.getStatus());
        dto.setCreatedAt(request.getCreatedAt());
        if (request.getProperty().getImageUrls() != null && !request.getProperty().getImageUrls().isEmpty()) {
            dto.setPropertyImage(request.getProperty().getImageUrls().get(0));
        }
        return dto;
    }

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
            availabilitySubscriptionService.notifyMatchingSubscriptions(savedProperty);
        } catch (Exception e) {
            System.err.println("Failed to check room request/availability matches: " + e.getMessage());
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
