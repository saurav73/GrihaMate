package com.grihamate.controller;

import com.grihamate.dto.PropertyDto;
import com.grihamate.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class PropertyController {
    private final PropertyService propertyService;

    @GetMapping
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<List<PropertyDto>> getAllProperties() {
        List<PropertyDto> properties = propertyService.getAllAvailableProperties();
        return ResponseEntity.ok(properties);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<PropertyDto> getPropertyById(@PathVariable Long id) {
        PropertyDto property = propertyService.getPropertyById(id);
        return ResponseEntity.ok(property);
    }

    @GetMapping("/city/{city}")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<List<PropertyDto>> getPropertiesByCity(@PathVariable String city) {
        List<PropertyDto> properties = propertyService.getPropertiesByCity(city);
        return ResponseEntity.ok(properties);
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<?> createProperty(@Valid @RequestBody PropertyDto propertyDto, Principal principal) {
        try {
            PropertyDto createdProperty = propertyService.createProperty(propertyDto, principal.getName());
            return ResponseEntity.ok(createdProperty);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my-properties")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<List<PropertyDto>> getMyProperties(Principal principal) {
        List<PropertyDto> properties = propertyService.getLandlordProperties(principal.getName());
        return ResponseEntity.ok(properties);
    }
}






