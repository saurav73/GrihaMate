package com.grihamate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Boolean emailVerified = false;

    // Seeker specific fields
    @Column(unique = true, nullable = true)
    private String citizenshipNumber;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String citizenshipFrontUrl;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String citizenshipBackUrl;

    // Landlord specific fields
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private KycDocumentType kycDocumentType;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String kycDocumentUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus subscriptionStatus = SubscriptionStatus.FREE;

    @Column(nullable = true)
    private LocalDateTime subscriptionExpiry;

    public enum Role {
        SEEKER, LANDLORD, ADMIN
    }

    public enum VerificationStatus {
        PENDING, VERIFIED, REJECTED
    }

    public enum SubscriptionStatus {
        FREE, PREMIUM
    }

    public enum KycDocumentType {
        CITIZENSHIP, PASSPORT, DRIVING_LICENSE
    }
}
