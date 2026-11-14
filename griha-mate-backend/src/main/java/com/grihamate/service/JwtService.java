package com.grihamate.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service implementing JWT creation and validation.
 */
@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Reads the subject claim of a token, which holds the authenticated user's username.
     *
     * @param token signed JWT to read
     * @return username stored in the token subject
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Reads the expiration claim of a token.
     *
     * @param token signed JWT to read
     * @return expiry timestamp stored in the token
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts a single claim from a token using the given resolver function.
     *
     * @param token signed JWT to read
     * @param claimsResolver function selecting the wanted claim from the parsed claims
     * @param <T> type of the claim value
     * @return resolved claim value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Generates a signed JWT for the authenticated user with no extra claims,
     * expiring {@code jwt.expiration} milliseconds after issue.
     *
     * @param userDetails authenticated user the token is issued for
     * @return signed JWT whose subject is the user's username
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    /**
     * Generates a signed JWT for the authenticated user with additional claims
     * (for example the user's role), expiring {@code jwt.expiration} milliseconds
     * after issue.
     *
     * @param userDetails authenticated user the token is issued for
     * @param extraClaims extra claims to embed in the token
     * @return signed JWT whose subject is the user's username
     */
    public String generateToken(UserDetails userDetails, Map<String, Object> extraClaims) {
        return createToken(extraClaims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Validates a token for a user: the token subject must match the user's username
     * and the token must not be expired.
     *
     * @param token signed JWT to validate
     * @param userDetails user the token is expected to belong to
     * @return true if the token belongs to the user and has not expired
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}







