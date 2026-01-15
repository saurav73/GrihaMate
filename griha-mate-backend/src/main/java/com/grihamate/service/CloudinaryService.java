package com.grihamate.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud.name}") String cloudName,
            @Value("${cloudinary.api.key}") String apiKey,
            @Value("${cloudinary.api.secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    public String uploadImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "grihamate/properties",
                            "resource_type", "auto"
                    )
            );

            String imageUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded successfully: {}", imageUrl);
            return imageUrl;
        } catch (IOException e) {
            log.error("Error uploading image to Cloudinary", e);
            throw new IOException("Failed to upload image to Cloudinary", e);
        }
    }

    public String uploadDocument(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "grihamate/documents",
                            "resource_type", "auto"
                    )
            );

            String documentUrl = (String) uploadResult.get("secure_url");
            log.info("Document uploaded successfully: {}", documentUrl);
            return documentUrl;
        } catch (IOException e) {
            log.error("Error uploading document to Cloudinary", e);
            throw new IOException("Failed to upload document to Cloudinary", e);
        }
    }

    public String uploadCitizenship(MultipartFile file, String type) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "grihamate/citizenship/" + type,
                            "resource_type", "auto"
                    )
            );

            String documentUrl = (String) uploadResult.get("secure_url");
            log.info("Citizenship document uploaded successfully: {}", documentUrl);
            return documentUrl;
        } catch (IOException e) {
            log.error("Error uploading citizenship document to Cloudinary", e);
            throw new IOException("Failed to upload citizenship document to Cloudinary", e);
        }
    }

    public String uploadKycDocument(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "grihamate/kyc",
                            "resource_type", "auto"
                    )
            );

            String documentUrl = (String) uploadResult.get("secure_url");
            log.info("KYC document uploaded successfully: {}", documentUrl);
            return documentUrl;
        } catch (IOException e) {
            log.error("Error uploading KYC document to Cloudinary", e);
            throw new IOException("Failed to upload KYC document to Cloudinary", e);
        }
    }

    public String uploadPropertyDocument(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "grihamate/property-documents",
                            "resource_type", "auto"
                    )
            );

            String documentUrl = (String) uploadResult.get("secure_url");
            log.info("Property document uploaded successfully: {}", documentUrl);
            return documentUrl;
        } catch (IOException e) {
            log.error("Error uploading property document to Cloudinary", e);
            throw new IOException("Failed to upload property document to Cloudinary", e);
        }
    }

    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            // Extract public_id from URL
            String publicId = extractPublicId(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Image deleted successfully: {}", publicId);
            }
        } catch (Exception e) {
            log.error("Error deleting image from Cloudinary: {}", imageUrl, e);
        }
    }

    private String extractPublicId(String imageUrl) {
        try {
            // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
            String[] parts = imageUrl.split("/upload/");
            if (parts.length > 1) {
                String path = parts[1];
                // Remove version if present (v1234567890/)
                if (path.contains("/v")) {
                    path = path.substring(path.indexOf("/v") + 1);
                    path = path.substring(path.indexOf("/") + 1);
                }
                // Remove file extension
                int lastDot = path.lastIndexOf(".");
                if (lastDot > 0) {
                    path = path.substring(0, lastDot);
                }
                return path;
            }
        } catch (Exception e) {
            log.error("Error extracting public_id from URL: {}", imageUrl, e);
        }
        return null;
    }
}






