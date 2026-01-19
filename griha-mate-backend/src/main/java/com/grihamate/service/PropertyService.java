package com.grihamate.service;

import com.grihamate.dto.PropertyDto;
import com.grihamate.entity.Property;
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
public class PropertyService {
    private final PropertyRepository propertyRepository;
    private final PropertyRequestRepository propertyRequestRepository;
    private final UserRepository userRepository;

    public List<PropertyDto> getAllAvailableProperties() {
        List<Property> properties = propertyRepository.findByStatusAndVerified(
                Property.PropertyStatus.AVAILABLE, true);
        return properties.stream()
                .map(PropertyDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PropertyDto> getPropertiesByCity(String city) {
        List<Property> properties = propertyRepository.findByCity(city);
        return properties.stream()
                .filter(p -> p.getStatus() == Property.PropertyStatus.AVAILABLE && p.getVerified())
                .map(PropertyDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PropertyDto> searchProperties(String city, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice,
            Property.PropertyType propertyType, Integer minBedrooms) {
        // Pass AVAILABLE status as parameter to ensure only available properties are returned
        List<Property> properties = propertyRepository.searchProperties(
                city, minPrice, maxPrice, propertyType, minBedrooms, Property.PropertyStatus.AVAILABLE);
        
        // Additional safety check: Also check if property has any ACCEPTED or PAID requests
        // If it does, it should be RENTED and not shown (fixes any properties that weren't updated)
        return properties.stream()
                .filter(p -> {
                    // Must be AVAILABLE and verified
                    if (p.getStatus() != Property.PropertyStatus.AVAILABLE || !p.getVerified()) {
                        return false;
                    }
                    // Check if property has any ACCEPTED or PAID requests - if so, it should be RENTED
                    List<com.grihamate.entity.PropertyRequest> activeRequests = propertyRequestRepository.findByProperty(p);
                    boolean hasActiveRequest = activeRequests.stream()
                            .anyMatch(req -> req.getStatus() == com.grihamate.entity.PropertyRequest.RequestStatus.ACCEPTED ||
                                           req.getStatus() == com.grihamate.entity.PropertyRequest.RequestStatus.PAID);
                    
                    // If property has active requests but status is still AVAILABLE, update it
                    if (hasActiveRequest && p.getStatus() == Property.PropertyStatus.AVAILABLE) {
                        p.setStatus(Property.PropertyStatus.RENTED);
                        if (p.getRentedDate() == null) {
                            p.setRentedDate(java.time.LocalDateTime.now());
                        }
                        propertyRepository.save(p);
                        return false; // Don't show it
                    }
                    
                    return true; // Show only if truly AVAILABLE with no active requests
                })
                .map(PropertyDto::fromEntity)
                .collect(Collectors.toList());
    }

    public PropertyDto getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        return PropertyDto.fromEntity(property);
    }

    @Transactional
    public PropertyDto createProperty(PropertyDto propertyDto, String landlordEmail) {
        User landlord = userRepository.findByEmail(landlordEmail)
                .orElseThrow(() -> new RuntimeException("Landlord not found"));

        if (landlord.getRole() != User.Role.LANDLORD) {
            throw new RuntimeException("Only landlords can create properties");
        }

        if (landlord.getVerificationStatus() != User.VerificationStatus.VERIFIED) {
            throw new RuntimeException("Landlord account must be verified to create properties");
        }

        // Check room limit logic
        if (landlord.getSubscriptionStatus() == User.SubscriptionStatus.FREE) {
            long propertyCount = propertyRepository.countByLandlord(landlord);
            if (propertyCount >= 2) {
                throw new RuntimeException(
                        "Free plan limit reached (max 2 properties). Please upgrade to Premium to list more.");
            }
        }

        Property property = new Property();
        property.setTitle(propertyDto.getTitle());
        property.setDescription(propertyDto.getDescription());
        property.setAddress(propertyDto.getAddress());
        property.setCity(propertyDto.getCity());
        property.setDistrict(propertyDto.getDistrict());
        property.setProvince(propertyDto.getProvince());
        property.setPrice(propertyDto.getPrice());
        property.setBedrooms(propertyDto.getBedrooms());
        property.setBathrooms(propertyDto.getBathrooms());
        property.setArea(propertyDto.getArea());
        property.setPropertyType(propertyDto.getPropertyType());
        property.setStatus(Property.PropertyStatus.AVAILABLE);
        property.setImageUrls(propertyDto.getImageUrls());
        property.setVirtualTourUrl(propertyDto.getVirtualTourUrl());
        property.setFeatures(propertyDto.getFeatures());
        property.setLatitude(propertyDto.getLatitude());
        property.setLongitude(propertyDto.getLongitude());
        property.setVerified(false); // Requires admin verification
        property.setLandlord(landlord);

        Property savedProperty = propertyRepository.save(property);
        return PropertyDto.fromEntity(savedProperty);
    }

    public List<PropertyDto> getLandlordProperties(String landlordEmail) {
        User landlord = userRepository.findByEmail(landlordEmail)
                .orElseThrow(() -> new RuntimeException("Landlord not found"));

        List<Property> properties = propertyRepository.findByLandlord(landlord);
        return properties.stream()
                .map(PropertyDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PropertyDto updateProperty(Long id, PropertyDto propertyDto, String landlordEmail) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (!property.getLandlord().getEmail().equals(landlordEmail)) {
            throw new RuntimeException("You can only update your own properties");
        }

        property.setTitle(propertyDto.getTitle());
        property.setDescription(propertyDto.getDescription());
        property.setAddress(propertyDto.getAddress());
        property.setCity(propertyDto.getCity());
        property.setDistrict(propertyDto.getDistrict());
        property.setProvince(propertyDto.getProvince());
        property.setPrice(propertyDto.getPrice());
        property.setBedrooms(propertyDto.getBedrooms());
        property.setBathrooms(propertyDto.getBathrooms());
        property.setArea(propertyDto.getArea());
        property.setPropertyType(propertyDto.getPropertyType());
        property.setImageUrls(propertyDto.getImageUrls());
        property.setVirtualTourUrl(propertyDto.getVirtualTourUrl());
        property.setFeatures(propertyDto.getFeatures());
        property.setLatitude(propertyDto.getLatitude());
        property.setLongitude(propertyDto.getLongitude());

        // Optionally reset verification status if critical fields change
        // property.setVerified(false);

        Property savedProperty = propertyRepository.save(property);
        return PropertyDto.fromEntity(savedProperty);
    }

    @Transactional
    public void deleteProperty(Long id, String landlordEmail) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (!property.getLandlord().getEmail().equals(landlordEmail)) {
            throw new RuntimeException("You can only delete your own properties");
        }

        // Delete all related property requests first to avoid foreign key constraint violation
        List<com.grihamate.entity.PropertyRequest> requests = propertyRequestRepository.findByProperty(property);
        if (!requests.isEmpty()) {
            propertyRequestRepository.deleteAll(requests);
        }

        propertyRepository.delete(property);
    }

    @Transactional
    public PropertyDto updateStatus(Long id, Property.PropertyStatus newStatus, String landlordEmail) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (!property.getLandlord().getEmail().equals(landlordEmail)) {
            throw new RuntimeException("You can only update your own properties");
        }

        // If trying to change from RENTED to AVAILABLE, check 3-month restriction
        if (property.getStatus() == Property.PropertyStatus.RENTED 
                && newStatus == Property.PropertyStatus.AVAILABLE) {
            if (property.getRentedDate() == null) {
                throw new RuntimeException("Cannot change status: Property rental date is not set");
            }
            
            java.time.LocalDateTime threeMonthsLater = property.getRentedDate().plusMonths(3);
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            
            if (now.isBefore(threeMonthsLater)) {
                long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(now, threeMonthsLater);
                throw new RuntimeException(
                    String.format("Cannot change status to AVAILABLE. Property was rented and must remain RENTED for 3 months. %d days remaining.", 
                    daysRemaining));
            }
        }

        // If changing to RENTED, set the rented date
        if (newStatus == Property.PropertyStatus.RENTED && property.getRentedDate() == null) {
            property.setRentedDate(java.time.LocalDateTime.now());
        }

        // If changing from RENTED to something else (after 3 months), clear rented date
        if (property.getStatus() == Property.PropertyStatus.RENTED && newStatus != Property.PropertyStatus.RENTED) {
            property.setRentedDate(null);
        }

        property.setStatus(newStatus);
        Property savedProperty = propertyRepository.save(property);
        return PropertyDto.fromEntity(savedProperty);
    }
}
