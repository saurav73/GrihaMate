package com.grihamate.service;

import com.grihamate.dto.PropertyDto;
import com.grihamate.entity.Property;
import com.grihamate.entity.User;
import com.grihamate.repository.PropertyRepository;
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
        return propertyRepository.searchProperties(city, minPrice, maxPrice, propertyType, minBedrooms).stream()
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

        propertyRepository.delete(property);
    }
}
