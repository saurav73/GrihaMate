package com.grihamate.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Service implementing image upload business logic (Cloudinary).
 */
@Service
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Builds the Cloudinary client from the configured cloud name, API key and API secret
     * ({@code cloudinary.cloud.name}, {@code cloudinary.api.key}, {@code cloudinary.api.secret}).
     *
     * @param cloudName Cloudinary cloud name
     * @param apiKey Cloudinary API key
     * @param apiSecret Cloudinary API secret
     */
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

    /**
     * Uploads a property image to the {@code grihamate/properties} folder in Cloudinary.
     *
     * @param file image file to upload; must not be null or empty
     * @return secure (HTTPS) URL of the uploaded image
     * @throws IllegalArgumentException if the file is null or empty
     * @throws IOException if the upload to Cloudinary fails
     */
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

    /**
     * Uploads a general document to the {@code grihamate/documents} folder in Cloudinary.
     *
     * @param file document file to upload; must not be null or empty
     * @return secure (HTTPS) URL of the uploaded document
     * @throws IllegalArgumentException if the file is null or empty
     * @throws IOException if the upload to Cloudinary fails
     */
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

    /**
     * Uploads a citizenship document to the {@code grihamate/citizenship/<type>} folder,
     * where {@code type} distinguishes the side of the document (for example front/back).
     *
     * @param file citizenship document file to upload; must not be null or empty
     * @param type sub-folder identifying which side of the citizenship document this is
     * @return secure (HTTPS) URL of the uploaded document
     * @throws IllegalArgumentException if the file is null or empty
     * @throws IOException if the upload to Cloudinary fails
     */
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

    /**
     * Uploads a KYC document to the {@code grihamate/kyc} folder in Cloudinary.
     *
     * @param file KYC document file to upload; must not be null or empty
     * @return secure (HTTPS) URL of the uploaded document
     * @throws IllegalArgumentException if the file is null or empty
     * @throws IOException if the upload to Cloudinary fails
     */
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

    /**
     * Uploads a property ownership document to the {@code grihamate/property-documents}
     * folder in Cloudinary.
     *
     * @param file property document file to upload; must not be null or empty
     * @return secure (HTTPS) URL of the uploaded document
     * @throws IllegalArgumentException if the file is null or empty
     * @throws IOException if the upload to Cloudinary fails
     */
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

    /**
     * Deletes an uploaded asset from Cloudinary by deriving its public id from the
     * stored URL. A null or blank URL is a no-op, and a failed delete is logged
     * rather than thrown so callers are not blocked by a stale asset reference.
     *
     * @param imageUrl secure URL of the asset to delete
     */
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







