package com.grihamate.repository;

import com.grihamate.entity.PropertyRequest;
import com.grihamate.entity.User;
import com.grihamate.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRequestRepository extends JpaRepository<PropertyRequest, Long> {
    List<PropertyRequest> findBySeeker(User seeker);

    List<PropertyRequest> findByProperty_Landlord(User landlord);

    List<PropertyRequest> findByProperty(Property property);

    Optional<PropertyRequest> findBySeekerAndProperty(User seeker, Property property);
}
