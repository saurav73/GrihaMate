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
