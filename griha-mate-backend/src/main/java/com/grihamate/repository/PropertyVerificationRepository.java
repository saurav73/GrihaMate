package com.grihamate.repository;

import com.grihamate.entity.PropertyVerification;
import com.grihamate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for PropertyVerification persistence and queries.
 */
@Repository
public interface PropertyVerificationRepository extends JpaRepository<PropertyVerification, Long> {
    Optional<PropertyVerification> findByLandlord(User landlord);
}







