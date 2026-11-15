package com.grihamate.controller;

import com.grihamate.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller exposing the /api/images endpoints (property image upload endpoints).
 */
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class ImageController {
    private final CloudinaryService cloudinaryService;

    /** Uploads a property image to Cloudinary and returns its URL.
         * @param file the image file to upload
         * @return the hosted image URL, or a 400 response when the upload fails */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = cloudinaryService.uploadImage(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Image uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /** Uploads a generic document to Cloudinary and returns its URL.
         * @param file the document file to upload
         * @return the hosted document URL, or a 400 response when the upload fails */
    @PostMapping("/upload-document")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            String documentUrl = cloudinaryService.uploadDocument(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", documentUrl);
            response.put("message", "Document uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to upload document: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /** Uploads a citizenship document (front or back, per {@code type}) to Cloudinary.
         * @param file the citizenship image to upload
         * @param type which side of the citizenship document this is (for example front/back)
         * @return the hosted document URL, or a 400 response when the upload fails */
    @PostMapping("/upload-citizenship")
    public ResponseEntity<?> uploadCitizenship(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {
        try {
            String documentUrl = cloudinaryService.uploadCitizenship(file, type);
            Map<String, String> response = new HashMap<>();
            response.put("url", documentUrl);
            response.put("message", "Citizenship document uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to upload citizenship document: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /** Uploads a KYC document to Cloudinary and returns its URL.
         * @param file the KYC document file to upload
         * @return the hosted document URL, or a 400 response when the upload fails */
    @PostMapping("/upload-kyc")
    public ResponseEntity<?> uploadKyc(@RequestParam("file") MultipartFile file) {
        try {
            String documentUrl = cloudinaryService.uploadKycDocument(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", documentUrl);
            response.put("message", "KYC document uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to upload KYC document: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /** Uploads a property ownership document to Cloudinary and returns its URL.
         * @param file the property document file to upload
         * @return the hosted document URL, or a 400 response when the upload fails */
    @PostMapping("/upload-property-document")
    public ResponseEntity<?> uploadPropertyDocument(@RequestParam("file") MultipartFile file) {
        try {
            String documentUrl = cloudinaryService.uploadPropertyDocument(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", documentUrl);
            response.put("message", "Property document uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to upload property document: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}







