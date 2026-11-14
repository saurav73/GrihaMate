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

/**
 * Service implementing availability subscription business logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AvailabilitySubscriptionService {
    private final AvailabilitySubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    /**
     * Creates an active availability alert for a seeker in a city (and optionally a district).
     * The seeker is emailed whenever a matching verified property becomes available.
     *
     * @param seekerEmail email of the seeker subscribing
     * @param city preferred city
     * @param district preferred district, or null/empty for the whole city
     * @return the saved subscription
     * @throws RuntimeException if no user with that email exists
     */
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

    /**
     * Lists a seeker's active availability subscriptions.
     *
     * @param seekerEmail email of the seeker
     * @return active subscriptions belonging to the seeker
     * @throws RuntimeException if no user with that email exists
     */
    public List<AvailabilitySubscription> getSeekerSubscriptions(String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        return subscriptionRepository.findBySeekerAndActive(seeker, true);
    }

    @Transactional
    /**
     * Deactivates one of the seeker's subscriptions. Only the owning seeker may unsubscribe it.
     *
     * @param id subscription id
     * @param seekerEmail email of the seeker requesting the unsubscribe
     * @throws RuntimeException if the subscription is missing or belongs to another seeker
     */
    public void unsubscribe(Long id, String seekerEmail) {
        AvailabilitySubscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        if (!subscription.getSeeker().getEmail().equals(seekerEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        subscription.setActive(false);
        subscriptionRepository.save(subscription);
    }

    /**
     * Emails every seeker subscribed to a property's city (and district, when the
     * subscription names one) about a newly verified AVAILABLE property. Unverified or
     * non-available properties notify nobody, and a failed email for one subscriber
     * is logged and does not stop the others.
     *
     * @param property newly available verified property to announce
     */
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
