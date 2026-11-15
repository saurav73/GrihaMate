package com.grihamate.controller;

import com.grihamate.entity.AvailabilitySubscription;
import com.grihamate.service.AvailabilitySubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * REST controller exposing the /api/availability-subscriptions endpoints (availability-subscription endpoints).
 */
@RestController
@RequestMapping("/api/availability-subscriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AvailabilitySubscriptionController {
    private final AvailabilitySubscriptionService subscriptionService;

    /** Subscribes the authenticated seeker to availability alerts for a city/district.
         * @param request map containing the {@code city} and {@code district} to watch
         * @param principal the authenticated seeker
         * @return the created availability subscription */
    @PostMapping("/subscribe")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<AvailabilitySubscription> subscribe(@RequestBody Map<String, String> request,
            Principal principal) {
        String city = request.get("city");
        String district = request.get("district");
        return ResponseEntity.ok(subscriptionService.subscribe(principal.getName(), city, district));
    }

    /** Lists the availability subscriptions of the authenticated seeker.
         * @param principal the authenticated seeker
         * @return the caller's subscriptions */
    @GetMapping("/my-subscriptions")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<List<AvailabilitySubscription>> getMySubscriptions(Principal principal) {
        return ResponseEntity.ok(subscriptionService.getSeekerSubscriptions(principal.getName()));
    }

    /** Cancels one of the authenticated seeker's availability subscriptions.
         * @param id subscription id
         * @param principal the authenticated seeker
         * @return a confirmation message */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<?> unsubscribe(@PathVariable Long id, Principal principal) {
        subscriptionService.unsubscribe(id, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Unsubscribed successfully"));
    }
}
