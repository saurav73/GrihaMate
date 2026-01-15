package com.grihamate.dto;

import lombok.Data;
import java.time.LocalDateTime;
import com.grihamate.entity.PropertyRequest.RequestStatus;

@Data
public class PropertyRequestDto {
    private Long id;
    private Long seekerId;
    private String seekerName;
    private String seekerEmail;
    private Long propertyId;
    private String propertyTitle;
    private String propertyImage;
    private String message;
    private RequestStatus status;
    private java.math.BigDecimal propertyPrice;
    private LocalDateTime createdAt;
}
