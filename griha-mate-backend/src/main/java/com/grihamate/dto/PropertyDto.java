package com.grihamate.dto;

import com.grihamate.entity.Property;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDto {
    private Long id;
    private String title;
    private String description;
    private String address;
    private String city;
    private String district;
    private String province;
    private Double latitude;
    private Double longitude;
    private BigDecimal price;
    private Integer bedrooms;
    private Integer bathrooms;
    private Double area;
    private Property.PropertyType propertyType;
    private Property.PropertyStatus status;
    private List<String> imageUrls;
    private String virtualTourUrl;
    private Boolean verified;
    private Long landlordId;
    private String landlordName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PropertyDto fromEntity(Property property) {
        PropertyDto dto = new PropertyDto();
        dto.setId(property.getId());
        dto.setTitle(property.getTitle());
        dto.setDescription(property.getDescription());
        dto.setAddress(property.getAddress());
        dto.setCity(property.getCity());
        dto.setDistrict(property.getDistrict());
        dto.setProvince(property.getProvince());
        dto.setLatitude(property.getLatitude());
        dto.setLongitude(property.getLongitude());
        dto.setPrice(property.getPrice());
        dto.setBedrooms(property.getBedrooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setArea(property.getArea());
        dto.setPropertyType(property.getPropertyType());
        dto.setStatus(property.getStatus());
        dto.setImageUrls(property.getImageUrls());
        dto.setVirtualTourUrl(property.getVirtualTourUrl());
        dto.setVerified(property.getVerified());
        dto.setLandlordId(property.getLandlord().getId());
        dto.setLandlordName(property.getLandlord().getFullName());
        dto.setCreatedAt(property.getCreatedAt());
        dto.setUpdatedAt(property.getUpdatedAt());
        return dto;
    }
}

