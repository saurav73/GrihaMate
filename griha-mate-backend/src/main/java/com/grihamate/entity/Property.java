package com.grihamate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String province;

    @Column(nullable = true)
    private Double latitude; // For location-based search

    @Column(nullable = true)
    private Double longitude; // For location-based search

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer bedrooms;

    @Column(nullable = false)
    private Integer bathrooms;

    @Column(nullable = false)
    private Double area; // in square feet

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType propertyType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyStatus status = PropertyStatus.AVAILABLE;

    @ElementCollection
    @CollectionTable(name = "property_images", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> imageUrls = new ArrayList<>();

    @Column(columnDefinition = "TEXT", nullable = true)
    private String virtualTourUrl; // 360° tour URL

    @ElementCollection
    @CollectionTable(name = "property_features", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "feature")
    private List<String> features = new ArrayList<>();

    @Column(nullable = false)
    private Boolean verified = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

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

    public enum PropertyType {
        ROOM, FLAT, APARTMENT, HOUSE
    }

    public enum PropertyStatus {
        AVAILABLE, RENTED, UNAVAILABLE
    }
}
