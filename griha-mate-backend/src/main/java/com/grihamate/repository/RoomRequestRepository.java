package com.grihamate.repository;

import com.grihamate.entity.RoomRequest;
import com.grihamate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RoomRequestRepository extends JpaRepository<RoomRequest, Long> {
    List<RoomRequest> findBySeeker(User seeker);
    
    List<RoomRequest> findBySeekerAndActive(User seeker, Boolean active);
    
    List<RoomRequest> findByActive(Boolean active);
    
    @Query("SELECT r FROM RoomRequest r WHERE r.active = true AND r.city = :city")
    List<RoomRequest> findActiveByCity(@Param("city") String city);
    
    @Query("SELECT r FROM RoomRequest r WHERE r.active = true AND " +
           "r.city = :city AND " +
           "(:maxPrice IS NULL OR r.maxPrice IS NULL OR r.maxPrice >= :maxPrice) AND " +
           "(:minPrice IS NULL OR r.minPrice IS NULL OR r.minPrice <= :minPrice) AND " +
           "(:propertyType IS NULL OR r.propertyType IS NULL OR r.propertyType = :propertyType)")
    List<RoomRequest> findMatchingRequests(@Param("city") String city,
                                           @Param("maxPrice") BigDecimal maxPrice,
                                           @Param("minPrice") BigDecimal minPrice,
                                           @Param("propertyType") String propertyType);
}

