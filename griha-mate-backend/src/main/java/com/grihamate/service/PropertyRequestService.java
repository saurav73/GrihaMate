package com.grihamate.service;

import com.grihamate.dto.PropertyRequestDto;
import com.grihamate.entity.Property;
import com.grihamate.entity.PropertyRequest;
import com.grihamate.entity.User;
import com.grihamate.repository.PropertyRepository;
import com.grihamate.repository.PropertyRequestRepository;
import com.grihamate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyRequestService {

    private final PropertyRequestRepository requestRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public PropertyRequestDto createRequest(Long seekerId, Long propertyId, String message) {
        User seeker = userRepository.findById(seekerId)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));

        // Check if seeker is verified
        if (seeker.getVerificationStatus() != User.VerificationStatus.VERIFIED) {
            throw new RuntimeException("Your account must be verified by an admin before you can send property requests. Please wait for verification.");
        }

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (property.getLandlord().getId().equals(seekerId)) {
            throw new RuntimeException("You cannot request your own property");
        }

        // Check if already requested (get most recent if multiple exist)
        List<PropertyRequest> existingRequests = requestRepository.findBySeekerAndPropertyOrderByCreatedAtDesc(seeker, property);
        if (!existingRequests.isEmpty()) {
            // Check if any existing request is still pending or accepted
            boolean hasActiveRequest = existingRequests.stream()
                    .anyMatch(req -> req.getStatus() == PropertyRequest.RequestStatus.PENDING 
                            || req.getStatus() == PropertyRequest.RequestStatus.ACCEPTED);
            if (hasActiveRequest) {
            throw new RuntimeException("You have already requested this property");
            }
        }

        PropertyRequest request = new PropertyRequest();
        request.setSeeker(seeker);
        request.setProperty(property);
        request.setMessage(message);

        PropertyRequest savedRequest = requestRepository.save(request);

        // Notify Landlord
        try {
            emailService.sendContactNotification(
                    property.getLandlord().getEmail(),
                    seeker.getFullName(),
                    seeker.getEmail(),
                    seeker.getPhoneNumber(),
                    property.getTitle(),
                    message);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return mapToDto(savedRequest);
    }

    public List<PropertyRequestDto> getMyRequests(Long seekerId) {
        User seeker = userRepository.findById(seekerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return requestRepository.findBySeeker(seeker).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PropertyRequestDto> getLandlordRequests(Long landlordId) {
        User landlord = userRepository.findById(landlordId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Assuming findByProperty_Landlord works as defined in repository
        return requestRepository.findByProperty_Landlord(landlord).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PropertyRequestDto updateStatus(Long requestId, Long userId, PropertyRequest.RequestStatus status) {
        PropertyRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Only the landlord of the property can accept/reject
        if (!request.getProperty().getLandlord().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        Property property = request.getProperty();
        
        // If accepting a request, mark property as RENTED to hide it from explore page
        if (status == PropertyRequest.RequestStatus.ACCEPTED) {
            property.setStatus(Property.PropertyStatus.RENTED);
            // Set rented date if not already set (in case payment was already confirmed)
            if (property.getRentedDate() == null) {
                property.setRentedDate(java.time.LocalDateTime.now());
            }
            propertyRepository.save(property);
        }
        // If rejecting a request, check if there are any other ACCEPTED or PAID requests for this property
        // If not, change property back to AVAILABLE
        else if (status == PropertyRequest.RequestStatus.REJECTED) {
            // Check if there are any other ACCEPTED or PAID requests for this property
            List<PropertyRequest> allRequests = requestRepository.findByProperty(property);
            List<PropertyRequest> otherAcceptedRequests = allRequests.stream()
                    .filter(req -> req.getId() != requestId && 
                            (req.getStatus() == PropertyRequest.RequestStatus.ACCEPTED || 
                             req.getStatus() == PropertyRequest.RequestStatus.PAID))
                    .collect(java.util.stream.Collectors.toList());
            
            // If no other accepted/paid requests exist, make property available again
            if (otherAcceptedRequests.isEmpty() && property.getStatus() == Property.PropertyStatus.RENTED) {
                // Check if 3 months have passed since rented date
                if (property.getRentedDate() != null) {
                    java.time.LocalDateTime threeMonthsLater = property.getRentedDate().plusMonths(3);
                    java.time.LocalDateTime now = java.time.LocalDateTime.now();
                    
                    // Only allow changing back to AVAILABLE if 3 months have passed OR if payment was never completed
                    // (If payment was completed, the 3-month restriction applies)
                    boolean hasPaidRequest = allRequests.stream()
                            .anyMatch(req -> req.getStatus() == PropertyRequest.RequestStatus.PAID);
                    
                    if (!hasPaidRequest || now.isAfter(threeMonthsLater)) {
                        property.setStatus(Property.PropertyStatus.AVAILABLE);
                        property.setRentedDate(null);
                        propertyRepository.save(property);
                    }
                } else {
                    // No rented date set, safe to make available
                    property.setStatus(Property.PropertyStatus.AVAILABLE);
                    propertyRepository.save(property);
                }
            }
        }

        request.setStatus(status);
        PropertyRequest updated = requestRepository.save(request);

        // Notify Seeker
        emailService.sendRequestStatusNotification(
                request.getSeeker().getEmail(),
                request.getSeeker().getFullName(),
                request.getProperty().getTitle(),
                status.toString(),
                null // Message can be added if payload supports it
        );

        return mapToDto(updated);
    }

    @Transactional
    public void confirmPayment(Long requestId) {
        PropertyRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(PropertyRequest.RequestStatus.PAID);
        requestRepository.save(request);
        
        // Mark property as RENTED and set rented date
        Property property = request.getProperty();
        property.setStatus(Property.PropertyStatus.RENTED);
        property.setRentedDate(java.time.LocalDateTime.now());
        propertyRepository.save(property);
    }

    public PropertyRequestDto getRequestBySeekerAndProperty(Long seekerId, Long propertyId) {
        User seeker = userRepository.findById(seekerId)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        // Handle multiple requests by getting the most recent one
        List<PropertyRequest> requests = requestRepository.findBySeekerAndPropertyOrderByCreatedAtDesc(seeker, property);
        if (requests.isEmpty()) {
            return null;
        }
        // Return the most recent request (first in the list since we order by createdAt DESC)
        return mapToDto(requests.get(0));
    }

    @Transactional
    public void deleteRequest(Long requestId, Long userId) {
        PropertyRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Only the seeker who made the request can delete it
        if (!request.getSeeker().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own requests");
        }

        // Only allow deleting rejected requests
        if (request.getStatus() != PropertyRequest.RequestStatus.REJECTED) {
            throw new RuntimeException("You can only delete rejected requests");
        }

        requestRepository.delete(request);
    }

    @Transactional
    public int deleteAllRejectedRequests(Long userId) {
        User seeker = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<PropertyRequest> rejectedRequests = requestRepository.findBySeeker(seeker).stream()
                .filter(req -> req.getStatus() == PropertyRequest.RequestStatus.REJECTED)
                .collect(Collectors.toList());

        requestRepository.deleteAll(rejectedRequests);
        return rejectedRequests.size();
    }

    private PropertyRequestDto mapToDto(PropertyRequest request) {
        PropertyRequestDto dto = new PropertyRequestDto();
        dto.setId(request.getId());
        dto.setSeekerId(request.getSeeker().getId());
        dto.setSeekerName(request.getSeeker().getFullName());
        dto.setSeekerEmail(request.getSeeker().getEmail());
        dto.setSeekerPhone(request.getSeeker().getPhoneNumber());
        dto.setSeekerImage(request.getSeeker().getProfileImageUrl());
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
}
