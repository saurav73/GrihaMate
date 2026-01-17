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

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (property.getLandlord().getId().equals(seekerId)) {
            throw new RuntimeException("You cannot request your own property");
        }

        // Check if already requested
        if (requestRepository.findBySeekerAndProperty(seeker, property).isPresent()) {
            throw new RuntimeException("You have already requested this property");
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

        return requestRepository.findBySeekerAndProperty(seeker, property)
                .map(this::mapToDto)
                .orElse(null);
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
