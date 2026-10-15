package com.grihamate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

/**
 * JPA entity persisted in the `availability_subscriptions` table, representing a seeker's subscription to availability alerts.
 */
@Entity
@Table(name = "availability_subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seeker_id", nullable = false)
    @JsonIgnore
    private User seeker;

    @Column(nullable = false)
    private String preferredCity;

    @Column(nullable = true)
    private String preferredDistrict;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
