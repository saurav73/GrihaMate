package com.grihamate.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class PaymentController {

    @Value("${esewa.product.code:EPAYTEST}")
    private String productCode;

    @Value("${esewa.secret:8gBm/:&EnhH.1/q}")
    private String secret;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @PostMapping("/esewa")
    public ResponseEntity<Map<String, Object>> initiateEsewaPayment(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {

        Number total = (Number) payload.getOrDefault("total_amount", payload.getOrDefault("amount", 0));
        double totalAmount = total == null ? 0 : total.doubleValue();
        String totalStr = String.format(java.util.Locale.US, "%.2f", totalAmount);

        // Extract metadata
        String type = (String) payload.getOrDefault("type", "booking"); // booking, subscription
        Object requestId = payload.get("request_id");
        if (requestId == null)
            requestId = payload.get("property_id");

        // Format: {TYPE}_{ID}_{TIMESTAMP}
        String transactionUuid = String.format("%s_%s_%d", type.toUpperCase(), requestId, System.currentTimeMillis());

        String signedFields = "total_amount,transaction_uuid,product_code";

        // Build message strictly from signed_fields order
        StringBuilder messageBuilder = new StringBuilder();
        String[] parts = signedFields.split(",");
        for (int i = 0; i < parts.length; i++) {
            String key = parts[i].trim();
            String value;
            switch (key) {
                case "total_amount":
                    value = totalStr;
                    break;
                case "transaction_uuid":
                    value = transactionUuid;
                    break;
                case "product_code":
                    value = productCode;
                    break;
                default:
                    value = "";
                    break;
            }
            if (i > 0)
                messageBuilder.append(',');
            messageBuilder.append(key).append('=').append(value);
        }

        String message = messageBuilder.toString();
        String signature = hmacSha256Base64(secret, message);

        Map<String, Object> data = new HashMap<>();

        data.put("amount", totalStr);
        data.put("tax_amount", "0");
        data.put("total_amount", totalStr);
        data.put("transaction_uuid", transactionUuid);
        data.put("product_code", productCode);
        data.put("product_service_charge", "0");
        data.put("product_delivery_charge", "0");
        data.put("success_url", frontendUrl + "/payment/success");
        data.put("failure_url", frontendUrl + "/payment/failure");
        data.put("signed_field_names", signedFields);
        data.put("signature", signature);
        data.put("action", "https://rc-epay.esewa.com.np/api/epay/main/v2/form");

        return ResponseEntity.ok(data);
    }

    private final com.grihamate.service.PropertyRequestService propertyRequestService;
    private final com.grihamate.service.UserService userService;

    public PaymentController(
            @Value("${esewa.product.code:EPAYTEST}") String productCode,
            @Value("${esewa.secret:8gBm/:&EnhH.1/q}") String secret,
            @Value("${app.frontend.url:http://localhost:3000}") String frontendUrl,
            com.grihamate.service.PropertyRequestService propertyRequestService,
            com.grihamate.service.UserService userService) {
        this.productCode = productCode;
        this.secret = secret;
        this.frontendUrl = frontendUrl;
        this.propertyRequestService = propertyRequestService;
        this.userService = userService;
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyPayment(
            @RequestParam Map<String, String> params) {
        String data = params.get("data");
        String signature = params.get("signature");

        Map<String, String> response = new HashMap<>();

        if (data == null || signature == null) {
            response.put("status", "error");
            response.put("message", "Missing payment data");
            return ResponseEntity.badRequest().body(response);
        }

        // Verify signature
        String computedSignature = hmacSha256Base64(secret, data);
        if (!computedSignature.equals(signature)) {
            response.put("status", "error");
            response.put("message", "Invalid signature");
            return ResponseEntity.badRequest().body(response);
        }

        // Parse data (base64 decoded)
        try {
            String decodedJson = new String(Base64.getDecoder().decode(data), StandardCharsets.UTF_8);
            // Example decoded JSON:
            // {"status":"COMPLETE","transaction_uuid":"BOOKING_123_123456789","total_amount":"1000.00",...}

            // Need a simple JSON parser or just use regex for transaction_uuid
            String transactionUuid = "";
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\"transaction_uuid\":\"([^\"]+)\"");
            java.util.regex.Matcher matcher = pattern.matcher(decodedJson);
            if (matcher.find()) {
                transactionUuid = matcher.group(1);
            }

            if (!transactionUuid.isEmpty()) {
                String[] parts = transactionUuid.split("_");
                if (parts.length >= 2) {
                    String type = parts[0];
                    Long id = Long.parseLong(parts[1]);

                    if ("BOOKING".equals(type)) {
                        propertyRequestService.confirmPayment(id);
                    } else if ("SUBSCRIPTION".equals(type)) {
                        userService.upgradeToPremiumById(id);
                    }
                }
            }

            response.put("status", "success");
            response.put("message", "Payment verified and confirmed");
            response.put("data", decodedJson);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Payment verified but confirmation failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/success")
    public ResponseEntity<Map<String, String>> paymentSuccess(
            @RequestParam Map<String, String> params) {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Payment successful");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/failure")
    public ResponseEntity<Map<String, String>> paymentFailure(
            @RequestParam Map<String, String> params) {
        Map<String, String> response = new HashMap<>();
        response.put("status", "failure");
        response.put("message", "Payment failed");
        return ResponseEntity.ok(response);
    }

    // Stripe Card Payment Integration
    @PostMapping("/stripe/initiate")
    public ResponseEntity<Map<String, Object>> initiateStripePayment(
            @RequestBody Map<String, Object> payload) {

        // Sprite Test API integration
        // In production, use actual Sprite API credentials
        String spriteApiKey = System.getenv("SPRITE_API_KEY") != null
                ? System.getenv("SPRITE_API_KEY")
                : "test_api_key";
        String spriteApiSecret = System.getenv("SPRITE_API_SECRET") != null
                ? System.getenv("SPRITE_API_SECRET")
                : "test_api_secret";

        Number total = (Number) payload.getOrDefault("amount", 0);
        double totalAmount = total == null ? 0 : total.doubleValue();
        String transactionId = "STRIPE_" + System.currentTimeMillis();

        Map<String, Object> response = new HashMap<>();
        response.put("transactionId", transactionId);
        response.put("amount", totalAmount);
        response.put("status", "initiated");
        response.put("paymentUrl", frontendUrl + "/payment/stripe?transactionId=" + transactionId);
        response.put("message", "Payment initiated. Redirect to Stripe payment form.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/stripe/process")
    public ResponseEntity<Map<String, String>> processStripePayment(
            @RequestBody Map<String, Object> payload) {

        String transactionId = (String) payload.get("transactionId");
        String cardNumber = (String) payload.get("cardNumber");
        String expiryDate = (String) payload.get("expiryDate");
        String cvv = (String) payload.get("cvv");
        String cardholderName = (String) payload.get("cardholderName");

        Map<String, String> response = new HashMap<>();

        // Validate card details (test mode - accept test cards)
        if (cardNumber == null || cardNumber.length() < 13) {
            response.put("status", "error");
            response.put("message", "Invalid card number");
            return ResponseEntity.badRequest().body(response);
        }

        // Test card validation (accept any card starting with 4242 or 4, 5, or 3 for
        // test)
        if (cardNumber.startsWith("4242") || cardNumber.startsWith("4") || cardNumber.startsWith("5")
                || cardNumber.startsWith("3")) {
            // Persistence Logic
            try {
                Object requestIdObj = payload.get("requestId");
                String type = (String) payload.getOrDefault("type", "booking");

                if (requestIdObj != null) {
                    Long id = Long.parseLong(requestIdObj.toString());
                    if ("SUBSCRIPTION".equals(type.toUpperCase())) {
                        userService.upgradeToPremiumById(id);
                    } else {
                        propertyRequestService.confirmPayment(id);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to persist premium status: " + e.getMessage());
                // For test mode, we might still return success but log the error
            }

            response.put("status", "success");
            response.put("message", "Payment processed successfully");
            response.put("transactionId", transactionId);
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "error");
            response.put("message", "Card not supported. Use test card 4242...");
            return ResponseEntity.badRequest().body(response);
        }
    }

    private static String hmacSha256Base64(String secret, String message) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] signature = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(signature);
        } catch (Exception e) {
            return "";
        }
    }
}
