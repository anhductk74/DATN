package com.example.smart_mall_spring.Services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.example.smart_mall_spring.Exception.CustomException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
public class GoogleOAuth2Service {

    private static final Logger logger = LoggerFactory.getLogger(GoogleOAuth2Service.class);

    @Value("${google.oauth2.client-id}")
    private String googleClientId;

    private GoogleIdTokenVerifier verifier;

    @PostConstruct
    public void init() {
        logger.info("Initializing Google OAuth2 Service with client ID: {}", googleClientId);
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
        logger.info("Google OAuth2 Service initialized successfully");
    }

    public GoogleIdToken.Payload verifyIdToken(String idTokenString) {
        try {
            logger.debug("Verifying Google ID token: {}", idTokenString.substring(0, Math.min(50, idTokenString.length())) + "...");
            
            if (idTokenString == null || idTokenString.trim().isEmpty()) {
                throw new CustomException("ID token is null or empty");
            }

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                logger.info("Google ID token verified successfully for user: {}", payload.getEmail());
                return payload;
            } else {
                logger.error("Google ID token verification failed - token is invalid");
                throw new CustomException("Invalid Google ID token");
            }
        } catch (GeneralSecurityException e) {
            logger.error("Security exception during Google ID token verification: {}", e.getMessage());
            throw new CustomException("Security error during token verification: " + e.getMessage());
        } catch (IOException e) {
            logger.error("IO exception during Google ID token verification: {}", e.getMessage());
            throw new CustomException("Network error during token verification: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during Google ID token verification: {}", e.getMessage());
            throw new CustomException("Token verification failed: " + e.getMessage());
        }
    }
}