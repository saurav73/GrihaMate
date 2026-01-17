package com.grihamate.service;

import com.grihamate.entity.AvailabilitySubscription;
import com.grihamate.entity.Property;
import com.grihamate.entity.User;
import com.grihamate.repository.AvailabilitySubscriptionRepository;
import com.grihamate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvailabilitySubscriptionService {
    private final AvailabilitySubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public AvailabilitySubscription subscribe(String seekerEmail, String city, String district) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));

        AvailabilitySubscription subscription = new AvailabilitySubscription();
        subscription.setSeeker(seeker);
        subscription.setPreferredCity(city);
        subscription.setPreferredDistrict(district);
        subscription.setActive(true);

        return subscriptionRepository.save(subscription);
    }

    public List<AvailabilitySubscription> getSeekerSubscriptions(String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        return subscriptionRepository.findBySeekerAndActive(seeker, true);
    }

    @Transactional
    public void unsubscribe(Long id, String seekerEmail) {
        AvailabilitySubscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        if (!subscription.getSeeker().getEmail().equals(seekerEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        subscription.setActive(false);
        subscriptionRepository.save(subscription);
    }

    public void notifyMatchingSubscriptions(Property property) {
        if (!property.getVerified() || property.getStatus() != Property.PropertyStatus.AVAILABLE) {
            return;
        }

        List<AvailabilitySubscription> subscriptions = subscriptionRepository
                .findByPreferredCityAndActive(property.getCity(), true);

        for (AvailabilitySubscription subscription : subscriptions) {
            // Optional: filter by district if provided
            if (subscription.getPreferredDistrict() != null && !subscription.getPreferredDistrict().isEmpty()) {
                if (!subscription.getPreferredDistrict().equalsIgnoreCase(property.getDistrict())) {
                    continue;
                }
            }

            try {
                String propertyUrl = "http://localhost:3000/property/" + property.getId();
                emailService.sendRoomMatchNotification(
                        subscription.getSeeker().getEmail(),
                        subscription.getSeeker().getFullName(),
                        property.getTitle(),
                        property.getCity(),
                        property.getDistrict(),
                        property.getAddress(),
                        property.getPrice(),
                        property.getBedrooms(),
                        property.getPropertyType().toString(),
                        propertyUrl);
                log.info("Availability notification sent to {} for property {}", subscription.getSeeker().getEmail(),
                        property.getId());
            } catch (Exception e) {
                log.error("Failed to send availability notification", e);
            }
        }
    }
}
