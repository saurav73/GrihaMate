package com.grihamate.controller;

import com.grihamate.dto.PropertyRequestDto;
import com.grihamate.entity.PropertyRequest;
import com.grihamate.entity.User;
import com.grihamate.service.PropertyRequestService;
import com.grihamate.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/property-requests")
@RequiredArgsConstructor
public class PropertyRequestController {

    private final PropertyRequestService requestService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<PropertyRequestDto> createRequest(@RequestBody Map<String, Object> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByEmail(auth.getName());

        Long propertyId = Long.valueOf(payload.get("propertyId").toString());
        String message = payload.get("message").toString();

        return ResponseEntity.ok(requestService.createRequest(currentUser.getId(), propertyId, message));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<PropertyRequestDto>> getMyRequests() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(requestService.getMyRequests(currentUser.getId()));
    }

    @GetMapping("/check")
    public ResponseEntity<PropertyRequestDto> checkRequestStatus(@RequestParam Long propertyId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(requestService.getRequestBySeekerAndProperty(currentUser.getId(), propertyId));
    }

    @GetMapping("/landlord-requests")
    public ResponseEntity<List<PropertyRequestDto>> getLandlordRequests() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(requestService.getLandlordRequests(currentUser.getId()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PropertyRequestDto> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByEmail(auth.getName());

        PropertyRequest.RequestStatus status = PropertyRequest.RequestStatus.valueOf(payload.get("status"));

        return ResponseEntity.ok(requestService.updateStatus(id, currentUser.getId(), status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRequest(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByEmail(auth.getName());
        requestService.deleteRequest(id, currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Request deleted successfully"));
    }

    @DeleteMapping("/rejected")
    public ResponseEntity<Map<String, String>> deleteAllRejected() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByEmail(auth.getName());
        int deletedCount = requestService.deleteAllRejectedRequests(currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Deleted " + deletedCount + " rejected request(s) successfully", "count", String.valueOf(deletedCount)));
    }
}
