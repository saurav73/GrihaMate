package com.grihamate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seeker_id", nullable = false)
    private User seeker;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String district;

    @Column(nullable = true)
    private String address;

    @Column(nullable = true)
    private Double latitude;

    @Column(nullable = true)
    private Double longitude;

    @Column(nullable = true)
    private BigDecimal maxPrice;

    @Column(nullable = true)
    private BigDecimal minPrice;

    @Column(nullable = true)
    private Integer minBedrooms;

    @Column(nullable = true)
    private Integer maxBedrooms;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private Property.PropertyType propertyType;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String additionalRequirements;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

