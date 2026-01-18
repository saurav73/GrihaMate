package com.grihamate.service;

import com.grihamate.dto.RoomRequestDto;
import com.grihamate.entity.Property;
import com.grihamate.entity.RoomRequest;
import com.grihamate.entity.User;
import com.grihamate.repository.PropertyRepository;
import com.grihamate.repository.RoomRequestRepository;
import com.grihamate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomRequestService {
    private final RoomRequestRepository roomRequestRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public RoomRequestDto createRequest(RoomRequestDto dto, User seeker) {
        // Check if user already has an active request
        List<RoomRequest> activeRequests = roomRequestRepository.findBySeekerAndActive(seeker, true);
        if (!activeRequests.isEmpty()) {
            throw new RuntimeException("You already have an active room request. Please deactivate your existing request before creating a new one.");
        }

        RoomRequest request = new RoomRequest();
        request.setSeeker(seeker);
        request.setCity(dto.getCity());
        request.setDistrict(dto.getDistrict());
        request.setAddress(dto.getAddress());
        request.setLatitude(dto.getLatitude());
        request.setLongitude(dto.getLongitude());
        request.setMaxPrice(dto.getMaxPrice());
        request.setMinPrice(dto.getMinPrice());
        request.setMinBedrooms(dto.getMinBedrooms());
        request.setMaxBedrooms(dto.getMaxBedrooms());
        request.setPropertyType(dto.getPropertyType() != null ? 
            Property.PropertyType.valueOf(dto.getPropertyType()) : null);
        request.setAdditionalRequirements(dto.getAdditionalRequirements());
        request.setActive(true);

        RoomRequest saved = roomRequestRepository.save(request);
        
        // Check if any existing properties match this request
        checkAndNotifyMatches(saved);
        
        return convertToDto(saved);
    }

    public List<RoomRequestDto> getRequestsBySeeker(User seeker) {
        return roomRequestRepository.findBySeeker(seeker)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public List<RoomRequestDto> getAllActiveRequests() {
        return roomRequestRepository.findByActive(true)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public List<RoomRequestDto> getRequestsByCity(String city) {
        return roomRequestRepository.findActiveByCity(city)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public void checkAndNotifyMatches(RoomRequest request) {
        List<Property> properties = propertyRepository.findByStatusAndVerified(
            Property.PropertyStatus.AVAILABLE, true
        );
        
        for (Property property : properties) {
            if (property.getStatus() != Property.PropertyStatus.AVAILABLE || !property.getVerified()) {
                continue;
            }
            
            if (matchesRequest(request, property)) {
                sendMatchNotification(request, property);
            }
        }
    }

    @Transactional
    public void checkAndNotifyForNewProperty(Property property) {
        if (property.getStatus() != Property.PropertyStatus.AVAILABLE || !property.getVerified()) {
            return;
        }
        
        List<RoomRequest> activeRequests = roomRequestRepository.findByActive(true);
        
        for (RoomRequest request : activeRequests) {
            if (matchesRequest(request, property)) {
                sendMatchNotification(request, property);
            }
        }
    }

    private boolean matchesRequest(RoomRequest request, Property property) {
        // Check city match
        if (!request.getCity().equalsIgnoreCase(property.getCity())) {
            return false;
        }
        
        // Check price range
        if (request.getMaxPrice() != null && property.getPrice().compareTo(request.getMaxPrice()) > 0) {
            return false;
        }
        if (request.getMinPrice() != null && property.getPrice().compareTo(request.getMinPrice()) < 0) {
            return false;
        }
        
        // Check bedrooms
        if (request.getMinBedrooms() != null && property.getBedrooms() < request.getMinBedrooms()) {
            return false;
        }
        if (request.getMaxBedrooms() != null && property.getBedrooms() > request.getMaxBedrooms()) {
            return false;
        }
        
        // Check property type
        if (request.getPropertyType() != null && property.getPropertyType() != request.getPropertyType()) {
            return false;
        }
        
        return true;
    }

    private void sendMatchNotification(RoomRequest request, Property property) {
        try {
            User seeker = request.getSeeker();
            String propertyUrl = "http://localhost:3000/property/" + property.getId();
            
            emailService.sendRoomMatchNotification(
                seeker.getEmail(),
                seeker.getFullName(),
                property.getTitle(),
                property.getCity(),
                property.getDistrict(),
                property.getAddress(),
                property.getPrice(),
                property.getBedrooms(),
                property.getPropertyType().toString(),
                propertyUrl
            );
            
            log.info("Room match notification sent to seeker {} for property {}", 
                seeker.getEmail(), property.getId());
        } catch (Exception e) {
            log.error("Failed to send match notification for request {} and property {}", 
                request.getId(), property.getId(), e);
        }
    }

    @Transactional
    public RoomRequestDto updateRequest(Long id, RoomRequestDto dto, User seeker) {
        RoomRequest request = roomRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Room request not found"));
        
        if (!request.getSeeker().getId().equals(seeker.getId())) {
            throw new RuntimeException("You can only update your own requests");
        }
        
        if (dto.getCity() != null) request.setCity(dto.getCity());
        if (dto.getDistrict() != null) request.setDistrict(dto.getDistrict());
        if (dto.getAddress() != null) request.setAddress(dto.getAddress());
        if (dto.getLatitude() != null) request.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) request.setLongitude(dto.getLongitude());
        if (dto.getMaxPrice() != null) request.setMaxPrice(dto.getMaxPrice());
        if (dto.getMinPrice() != null) request.setMinPrice(dto.getMinPrice());
        if (dto.getMinBedrooms() != null) request.setMinBedrooms(dto.getMinBedrooms());
        if (dto.getMaxBedrooms() != null) request.setMaxBedrooms(dto.getMaxBedrooms());
        if (dto.getPropertyType() != null) {
            request.setPropertyType(Property.PropertyType.valueOf(dto.getPropertyType()));
        }
        if (dto.getAdditionalRequirements() != null) {
            request.setAdditionalRequirements(dto.getAdditionalRequirements());
        }
        if (dto.getActive() != null) request.setActive(dto.getActive());
        
        RoomRequest saved = roomRequestRepository.save(request);
        
        // Re-check matches after update
        if (saved.getActive()) {
            checkAndNotifyMatches(saved);
        }
        
        return convertToDto(saved);
    }

    @Transactional
    public void deleteRequest(Long id, User seeker) {
        RoomRequest request = roomRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Room request not found"));
        
        if (!request.getSeeker().getId().equals(seeker.getId())) {
            throw new RuntimeException("You can only delete your own requests");
        }
        
        roomRequestRepository.delete(request);
    }

    private RoomRequestDto convertToDto(RoomRequest request) {
        RoomRequestDto dto = new RoomRequestDto();
        dto.setId(request.getId());
        dto.setSeekerId(request.getSeeker().getId());
        dto.setSeekerName(request.getSeeker().getFullName());
        dto.setSeekerEmail(request.getSeeker().getEmail());
        dto.setSeekerPhone(request.getSeeker().getPhoneNumber());
        dto.setCity(request.getCity());
        dto.setDistrict(request.getDistrict());
        dto.setAddress(request.getAddress());
        dto.setLatitude(request.getLatitude());
        dto.setLongitude(request.getLongitude());
        dto.setMaxPrice(request.getMaxPrice());
        dto.setMinPrice(request.getMinPrice());
        dto.setMinBedrooms(request.getMinBedrooms());
        dto.setMaxBedrooms(request.getMaxBedrooms());
        dto.setPropertyType(request.getPropertyType() != null ? request.getPropertyType().toString() : null);
        dto.setAdditionalRequirements(request.getAdditionalRequirements());
        dto.setActive(request.getActive());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }
}

