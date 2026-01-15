package com.grihamate.config;

import com.grihamate.entity.Property;
import com.grihamate.entity.User;
import com.grihamate.repository.PropertyRepository;
import com.grihamate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Always create admin user if it doesn't exist
        getOrCreateAdmin();
        
        // Check if properties already exist
        long propertyCount = propertyRepository.count();
        
        if (propertyCount > 0) {
            log.info("Properties already exist in database ({} properties found). Skipping seed data.", propertyCount);
            return;
        }

        log.info("No properties found in database. Starting seed data insertion...");

        // Get or create a landlord
        User landlord = getOrCreateLandlord();

        // Create seed properties
        List<Property> properties = createSeedProperties(landlord);

        // Save all properties
        if (!properties.isEmpty()) {
            propertyRepository.saveAll(properties);
            log.info("Successfully seeded {} properties into the database.", properties.size());
        }
    }

    private User getOrCreateAdmin() {
        return userRepository.findByEmail("admin@grihamate.com")
                .orElseGet(() -> {
                    log.info("Creating admin user...");
                    User admin = new User();
                    admin.setFullName("Admin User");
                    admin.setEmail("admin@grihamate.com");
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setPhoneNumber("+977-9800000000");
                    admin.setRole(User.Role.ADMIN);
                    admin.setProfileImageUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop");
                    admin.setActive(true);
                    admin.setEmailVerified(true);
                    admin.setVerificationStatus(User.VerificationStatus.VERIFIED);
                    admin.setCreatedAt(LocalDateTime.now());
                    admin.setUpdatedAt(LocalDateTime.now());
                    log.info("Admin user created successfully. Email: admin@grihamate.com, Password: admin123");
                    return userRepository.save(admin);
                });
    }

    private User getOrCreateLandlord() {
        return userRepository.findByEmail("seed-landlord@grihamate.com")
                .orElseGet(() -> {
                    log.info("Creating seed landlord user...");
                    User newLandlord = new User();
                    newLandlord.setFullName("Ram Bahadur Shrestha");
                    newLandlord.setEmail("seed-landlord@grihamate.com");
                    newLandlord.setPassword(passwordEncoder.encode("landlord123"));
                    newLandlord.setPhoneNumber("+977-9812345678");
                    newLandlord.setRole(User.Role.LANDLORD);
                    newLandlord.setProfileImageUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop");
                    newLandlord.setActive(true);
                    newLandlord.setEmailVerified(true);
                    newLandlord.setVerificationStatus(User.VerificationStatus.VERIFIED);
                    newLandlord.setKycDocumentType(User.KycDocumentType.CITIZENSHIP);
                    newLandlord.setKycDocumentUrl("https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop");
                    newLandlord.setCreatedAt(LocalDateTime.now());
                    newLandlord.setUpdatedAt(LocalDateTime.now());
                    return userRepository.save(newLandlord);
                });
    }

    private List<Property> createSeedProperties(User landlord) {
        List<Property> properties = new ArrayList<>();

        // Property 1: Cozy Room in Thamel
        properties.add(createProperty(
                "Cozy Single Room in Thamel",
                "Beautiful single room in the heart of Thamel, perfect for students or working professionals. Fully furnished with attached bathroom, WiFi, and 24/7 security.",
                "Thamel, Kathmandu",
                "Kathmandu",
                "Kathmandu",
                "Bagmati",
                27.7172,
                85.3240,
                new BigDecimal("15000"),
                1,
                1,
                120.0,
                Property.PropertyType.ROOM,
                Property.PropertyStatus.AVAILABLE,
                Arrays.asList(
                        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop"
                ),
                landlord
        ));

        // Property 2: Modern Flat in Baneshwor
        properties.add(createProperty(
                "Modern 2 BHK Flat in Baneshwor",
                "Spacious 2 bedroom flat with modern amenities. Includes kitchen, living room, balcony, and parking. Close to hospitals and shopping centers.",
                "Baneshwor, Kathmandu",
                "Kathmandu",
                "Kathmandu",
                "Bagmati",
                27.6870,
                85.3330,
                new BigDecimal("35000"),
                2,
                2,
                850.0,
                Property.PropertyType.FLAT,
                Property.PropertyStatus.AVAILABLE,
                Arrays.asList(
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1560448075-cbc16bf4d501?w=800&h=600&fit=crop"
                ),
                landlord
        ));

        // Property 3: Shared Room in Patan
        properties.add(createProperty(
                "Shared Room in Patan - Perfect for Students",
                "Affordable shared room accommodation in Patan. Great for students looking for budget-friendly options. Includes WiFi, shared kitchen, and common area.",
                "Patan, Lalitpur",
                "Lalitpur",
                "Lalitpur",
                "Bagmati",
                27.6667,
                85.3167,
                new BigDecimal("8000"),
                1,
                1,
                100.0,
                Property.PropertyType.ROOM,
                Property.PropertyStatus.AVAILABLE,
                Arrays.asList(
                        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"
                ),
                landlord
        ));

        // Property 4: Luxury Apartment in Durbarmarg
        properties.add(createProperty(
                "Luxury 3 BHK Apartment in Durbarmarg",
                "Premium 3 bedroom apartment in prime location. Features include modern kitchen, spacious living area, master bedroom with ensuite, and stunning city views.",
                "Durbarmarg, Kathmandu",
                "Kathmandu",
                "Kathmandu",
                "Bagmati",
                27.7100,
                85.3200,
                new BigDecimal("65000"),
                3,
                3,
                1200.0,
                Property.PropertyType.APARTMENT,
                Property.PropertyStatus.AVAILABLE,
                Arrays.asList(
                        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1560448204-61dc36dc5d93?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1560448075-cbc16bf4d501?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop"
                ),
                landlord
        ));

        // Property 5: Family House in Budhanilkantha
        properties.add(createProperty(
                "Spacious Family House in Budhanilkantha",
                "Beautiful 4 bedroom family house with garden and parking. Perfect for families. Includes modern amenities and peaceful neighborhood.",
                "Budhanilkantha, Kathmandu",
                "Kathmandu",
                "Kathmandu",
                "Bagmati",
                27.7833,
                85.3667,
                new BigDecimal("85000"),
                4,
                4,
                2000.0,
                Property.PropertyType.HOUSE,
                Property.PropertyStatus.AVAILABLE,
                Arrays.asList(
                        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
                ),
                landlord
        ));

        // Property 6: Studio Room in New Road
        properties.add(createProperty(
                "Furnished Studio Room in New Road",
                "Compact studio room with all essentials. Ideal for single professionals. Includes kitchenette, bathroom, and WiFi. Walking distance to major attractions.",
                "New Road, Kathmandu",
                "Kathmandu",
                "Kathmandu",
                "Bagmati",
                27.7050,
                85.3150,
                new BigDecimal("12000"),
                1,
                1,
                200.0,
                Property.PropertyType.ROOM,
                Property.PropertyStatus.AVAILABLE,
                Arrays.asList(
                        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop"
                ),
                landlord
        ));

        return properties;
    }

    private Property createProperty(
            String title,
            String description,
            String address,
            String city,
            String district,
            String province,
            Double latitude,
            Double longitude,
            BigDecimal price,
            Integer bedrooms,
            Integer bathrooms,
            Double area,
            Property.PropertyType propertyType,
            Property.PropertyStatus status,
            List<String> imageUrls,
            User landlord) {
        
        Property property = new Property();
        property.setTitle(title);
        property.setDescription(description);
        property.setAddress(address);
        property.setCity(city);
        property.setDistrict(district);
        property.setProvince(province);
        property.setLatitude(latitude);
        property.setLongitude(longitude);
        property.setPrice(price);
        property.setBedrooms(bedrooms);
        property.setBathrooms(bathrooms);
        property.setArea(area);
        property.setPropertyType(propertyType);
        property.setStatus(status);
        property.setImageUrls(imageUrls);
        property.setVerified(true); // Seed properties are pre-verified
        property.setLandlord(landlord);
        property.setCreatedAt(LocalDateTime.now());
        property.setUpdatedAt(LocalDateTime.now());
        
        return property;
    }
}






