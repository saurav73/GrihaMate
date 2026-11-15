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

/**
 * REST controller exposing the /api/properties endpoints (property listing endpoints).
 */
@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class PropertyController {
    private final PropertyService propertyService;

    /** Lists every available property for any authenticated user.
         * @return all available properties */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PropertyDto>> getAllProperties() {
        List<PropertyDto> properties = propertyService.getAllAvailableProperties();
        return ResponseEntity.ok(properties);
    }

    /** Returns one property by id for any authenticated user.
         * @param id property id
         * @return the property */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PropertyDto> getPropertyById(@PathVariable Long id) {
        PropertyDto property = propertyService.getPropertyById(id);
        return ResponseEntity.ok(property);
    }

    /** Lists available properties in one city for any authenticated user.
         * @param city city name
         * @return the matching properties */
    @GetMapping("/city/{city}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PropertyDto>> getPropertiesByCity(@PathVariable String city) {
        List<PropertyDto> properties = propertyService.getPropertiesByCity(city);
        return ResponseEntity.ok(properties);
    }

    /** Searches properties with optional filters; any combination of city, price range, type and
         * minimum bedrooms may be given, and the endpoint is public (no login required).
         * @param city optional city filter
         * @param minPrice optional minimum price filter
         * @param maxPrice optional maximum price filter
         * @param type optional property type filter
         * @param minBedrooms optional minimum bedrooms filter
         * @return the matching properties */
    @GetMapping("/search")
    public ResponseEntity<List<PropertyDto>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) com.grihamate.entity.Property.PropertyType type,
            @RequestParam(required = false) Integer minBedrooms) {
        List<PropertyDto> properties = propertyService.searchProperties(city, minPrice, maxPrice, type, minBedrooms);
        return ResponseEntity.ok(properties);
    }

    /** Creates a property listing for the authenticated landlord.
         * @param propertyDto validated property details
         * @param principal the authenticated landlord
         * @return the created property, or a 400 response when creation fails */
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

    /** Lists the property listings owned by the authenticated landlord.
         * @param principal the authenticated landlord
         * @return the landlord's properties */
    @GetMapping("/my-properties")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<List<PropertyDto>> getMyProperties(Principal principal) {
        List<PropertyDto> properties = propertyService.getLandlordProperties(principal.getName());
        return ResponseEntity.ok(properties);
    }

    /** Updates one of the authenticated landlord's property listings.
         * @param id property id
         * @param propertyDto validated replacement property details
         * @param principal the authenticated landlord
         * @return the updated property, or a 400 response when the update fails */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<?> updateProperty(@PathVariable Long id, @Valid @RequestBody PropertyDto propertyDto,
            Principal principal) {
        try {
            PropertyDto updatedProperty = propertyService.updateProperty(id, propertyDto, principal.getName());
            return ResponseEntity.ok(updatedProperty);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Deletes one of the authenticated landlord's property listings.
         * @param id property id
         * @param principal the authenticated landlord
         * @return a confirmation message, or a 400 response when deletion fails */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<?> deleteProperty(@PathVariable Long id, Principal principal) {
        try {
            propertyService.deleteProperty(id, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Property deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Changes the availability status of one of the authenticated landlord's listings.
         * @param id property id
         * @param request map containing the new {@code status} value
         * @param principal the authenticated landlord
         * @return the updated property, or a 400 response for an invalid status */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('LANDLORD')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request,
            Principal principal) {
        try {
            String statusStr = request.get("status");
            com.grihamate.entity.Property.PropertyStatus status = 
                com.grihamate.entity.Property.PropertyStatus.valueOf(statusStr.toUpperCase());
            PropertyDto updatedProperty = propertyService.updateStatus(id, status, principal.getName());
            return ResponseEntity.ok(updatedProperty);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
