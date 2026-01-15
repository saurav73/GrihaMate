package com.grihamate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequestDto {
    private Long id;
    private Long seekerId;
    private String seekerName;
    private String seekerEmail;
    private String seekerPhone;
    private String city;
    private String district;
    private String address;
    private Double latitude;
    private Double longitude;
    private BigDecimal maxPrice;
    private BigDecimal minPrice;
    private Integer minBedrooms;
    private Integer maxBedrooms;
    private String propertyType;
    private String additionalRequirements;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

