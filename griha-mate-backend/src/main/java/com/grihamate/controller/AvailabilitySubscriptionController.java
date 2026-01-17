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

@RestController
@RequestMapping("/api/availability-subscriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AvailabilitySubscriptionController {
    private final AvailabilitySubscriptionService subscriptionService;

    @PostMapping("/subscribe")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<AvailabilitySubscription> subscribe(@RequestBody Map<String, String> request,
            Principal principal) {
        String city = request.get("city");
        String district = request.get("district");
        return ResponseEntity.ok(subscriptionService.subscribe(principal.getName(), city, district));
    }

    @GetMapping("/my-subscriptions")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<List<AvailabilitySubscription>> getMySubscriptions(Principal principal) {
        return ResponseEntity.ok(subscriptionService.getSeekerSubscriptions(principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<?> unsubscribe(@PathVariable Long id, Principal principal) {
        subscriptionService.unsubscribe(id, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Unsubscribed successfully"));
    }
}
