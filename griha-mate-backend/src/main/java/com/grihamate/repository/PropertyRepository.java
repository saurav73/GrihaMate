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

        @org.springframework.data.jpa.repository.Query("SELECT p FROM Property p WHERE " +
                        "(:city IS NULL OR LOWER(p.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
                        "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
                        "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
                        "(:propertyType IS NULL OR p.propertyType = :propertyType) AND " +
                        "(:minBedrooms IS NULL OR p.bedrooms >= :minBedrooms) AND " +
                        "p.verified = true AND p.status = :status")
        List<Property> searchProperties(
                        String city,
                        java.math.BigDecimal minPrice,
                        java.math.BigDecimal maxPrice,
                        Property.PropertyType propertyType,
                        Integer minBedrooms,
                        Property.PropertyStatus status);

        int countByLandlord(User landlord);
}
