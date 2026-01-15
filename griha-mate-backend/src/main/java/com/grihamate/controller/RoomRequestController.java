package com.grihamate.controller;

import com.grihamate.dto.RoomRequestDto;
import com.grihamate.entity.User;
import com.grihamate.repository.UserRepository;
import com.grihamate.service.RoomRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/room-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class RoomRequestController {
    private final RoomRequestService roomRequestService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<?> createRequest(@Valid @RequestBody RoomRequestDto dto, Principal principal) {
        try {
            User seeker = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            RoomRequestDto created = roomRequestService.createRequest(dto, seeker);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<List<RoomRequestDto>> getMyRequests(Principal principal) {
        User seeker = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<RoomRequestDto> requests = roomRequestService.getRequestsBySeeker(seeker);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RoomRequestDto>> getAllRequests() {
        List<RoomRequestDto> requests = roomRequestService.getAllActiveRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/city/{city}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LANDLORD')")
    public ResponseEntity<List<RoomRequestDto>> getRequestsByCity(@PathVariable String city) {
        List<RoomRequestDto> requests = roomRequestService.getRequestsByCity(city);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<?> updateRequest(@PathVariable Long id, 
                                          @Valid @RequestBody RoomRequestDto dto, 
                                          Principal principal) {
        try {
            User seeker = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            RoomRequestDto updated = roomRequestService.updateRequest(id, dto, seeker);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id, Principal principal) {
        try {
            User seeker = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            roomRequestService.deleteRequest(id, seeker);
            return ResponseEntity.ok(Map.of("message", "Room request deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

