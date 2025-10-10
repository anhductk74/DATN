package com.example.smart_mall_spring.Utils;

import com.example.smart_mall_spring.Config.CustomUserDetails;
import com.example.smart_mall_spring.Entities.Users.User;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public class AuthUtils {
    
    /**
     * Extract User ID from Authentication object
     * @param authentication Spring Security Authentication object
     * @return UUID of the authenticated user
     * @throws IllegalArgumentException if authentication is invalid or user not found
     */
    public static UUID getUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalArgumentException("Authentication is null or invalid");
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) principal;
            User user = userDetails.getUser();
            if (user != null && user.getId() != null) {
                return user.getId();
            }
        }
        
        throw new IllegalArgumentException("Unable to extract user ID from authentication");
    }
    
    /**
     * Extract User entity from Authentication object
     * @param authentication Spring Security Authentication object
     * @return User entity of the authenticated user
     * @throws IllegalArgumentException if authentication is invalid or user not found
     */
    public static User getUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalArgumentException("Authentication is null or invalid");
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) principal;
            User user = userDetails.getUser();
            if (user != null) {
                return user;
            }
        }
        
        throw new IllegalArgumentException("Unable to extract user from authentication");
    }
}