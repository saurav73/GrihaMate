package com.grihamate.repository;

import com.grihamate.entity.Property;
import com.grihamate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByStatus(Property.PropertyStatus status);
    List<Property> findByLandlord(User landlord);
    List<Property> findByCity(String city);
    List<Property> findByVerified(Boolean verified);
    List<Property> findByStatusAndVerified(Property.PropertyStatus status, Boolean verified);
}






