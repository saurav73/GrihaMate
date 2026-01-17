package com.grihamate.repository;

import com.grihamate.entity.AvailabilitySubscription;
import com.grihamate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailabilitySubscriptionRepository extends JpaRepository<AvailabilitySubscription, Long> {
    List<AvailabilitySubscription> findBySeekerAndActive(User seeker, Boolean active);

    List<AvailabilitySubscription> findByPreferredCityAndActive(String preferredCity, Boolean active);
}
