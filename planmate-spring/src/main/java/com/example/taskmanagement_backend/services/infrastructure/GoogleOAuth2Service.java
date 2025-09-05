package com.example.taskmanagement_backend.services.infrastructure;

import com.example.taskmanagement_backend.dtos.OAuth2Dto.GoogleAuthUrlResponseDto;
import com.example.taskmanagement_backend.dtos.OAuth2Dto.TokenResponseDto;
import com.example.taskmanagement_backend.entities.OAuthProvider;
import com.example.taskmanagement_backend.entities.Organization;
import com.example.taskmanagement_backend.entities.RefreshToken;
import com.example.taskmanagement_backend.entities.Role;
import com.example.taskmanagement_backend.entities.User;
import com.example.taskmanagement_backend.entities.UserProfile;
import com.example.taskmanagement_backend.exceptions.HttpException;
import com.example.taskmanagement_backend.repositories.OAuthProviderRepository;
import com.example.taskmanagement_backend.repositories.RoleJpaRepository;
import com.example.taskmanagement_backend.repositories.UserJpaRepository;
import com.example.taskmanagement_backend.repositories.UserProfileRepository;

import com.example.taskmanagement_backend.services.OrganizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuth2Service {

    private final UserJpaRepository userRepository;
    private final OAuthProviderRepository oauthProviderRepository;
    private final RoleJpaRepository roleRepository;
    private final UserProfileRepository userProfileRepository;
    private final JwtTokenService jwtTokenService;
    private final GoogleTokenService googleTokenService;
    private final OrganizationService organizationService;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String redirectUri;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.oauth.auto-create-organization:true}")
    private boolean autoCreateOrganization;

    @Value("${app.oauth.auto-create-exclude-public-domains:true}")
    private boolean excludePublicDomains;

    private static final String GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final List<String> SCOPES = Arrays.asList("openid", "profile", "email");

    public GoogleAuthUrlResponseDto generateAuthUrl() {
        String state = UUID.randomUUID().toString();
        
        log.info("Generating OAuth URL with Client ID: {}", clientId.substring(0, 10) + "...");
        log.info("Redirect URI: {}", redirectUri);
        
        StringBuilder authUrl = new StringBuilder(GOOGLE_AUTH_URL);
        authUrl.append("?client_id=").append(clientId);
        authUrl.append("&redirect_uri=").append(redirectUri);
        authUrl.append("&scope=").append(String.join(" ", SCOPES));
        authUrl.append("&response_type=code");
        authUrl.append("&state=").append(state);
        authUrl.append("&access_type=offline");
        authUrl.append("&prompt=consent");

        log.info("Generated auth URL: {}", authUrl.toString());

        return GoogleAuthUrlResponseDto.builder()
                .authUrl(authUrl.toString())
                .state(state)
                .build();
    }

    @Transactional
    public TokenResponseDto handleCallback(String code, String state, String deviceInfo) {
        try {
            log.info("Processing OAuth callback with code: {}...", code.length() > 10 ? code.substring(0, 10) : code);
            log.info("State: {}", state);
            
            // 1. Exchange code for tokens using simplified service
            log.info("Step 1: Exchanging authorization code for tokens");
            Map<String, Object> tokenResponse = googleTokenService.exchangeCodeForTokens(code);
            log.info("Successfully exchanged code for tokens");
            
            // 2. Get user info from Google
            String accessToken = (String) tokenResponse.get("access_token");
            log.info("Step 2: Getting user info from Google with access token");
            Map<String, Object> userInfo = googleTokenService.getUserInfo(accessToken);
            log.info("Successfully retrieved user info: email={}, name={}", 
                    userInfo.get("email"), userInfo.get("name"));
            
            // 3. Find or create user
            log.info("Step 3: Finding or creating user in database");
            User user = findOrCreateUser(userInfo, tokenResponse, deviceInfo);
            log.info("User processed successfully: id={}, email={}", user.getId(), user.getEmail());
            
            // 4. Generate system JWT tokens
            String systemAccessToken = jwtTokenService.generateAccessToken(user);
            RefreshToken refreshToken = jwtTokenService.generateRefreshToken(user, deviceInfo);
            log.info("Generated system tokens for user: {}", user.getEmail());
            
            return TokenResponseDto.builder()
                    .accessToken(systemAccessToken)
                    .refreshToken(refreshToken.getToken())
                    .expiresIn(900L) // 15 minutes
                    .tokenType("Bearer")
                    .userInfo(TokenResponseDto.UserInfoDto.builder()
                            .id(user.getId())
                            .email(user.getEmail())
                            .firstName(user.getUserProfile() != null ? user.getUserProfile().getFirstName() : "")
                            .lastName(user.getUserProfile() != null ? user.getUserProfile().getLastName() : "")
                            .avatarUrl(user.getUserProfile() != null ? user.getUserProfile().getAvtUrl() : "")
                            .isFirstLogin(user.isFirstLogin())
                            .build())
                    .build();
                    
        } catch (Exception e) {
            log.error("Error handling Google OAuth callback: {}", e.getMessage(), e);
            log.error("Exception type: {}", e.getClass().getSimpleName());
            if (e.getCause() != null) {
                log.error("Root cause: {}", e.getCause().getMessage());
            }
            throw new HttpException("OAuth authentication failed: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    private User findOrCreateUser(Map<String, Object> userInfo, Map<String, Object> tokenResponse, String deviceInfo) {
        String googleUserId = (String) userInfo.get("id");
        String email = (String) userInfo.get("email");
        String firstName = (String) userInfo.get("given_name");
        String lastName = (String) userInfo.get("family_name");
        String avatarUrl = (String) userInfo.get("picture");

        log.info("Processing user: googleId={}, email={}, firstName={}, lastName={}", 
                googleUserId, email, firstName, lastName);

        // Check if OAuth provider exists
        log.info("Checking if OAuth provider exists for Google user: {}", googleUserId);
        Optional<OAuthProvider> existingProvider = oauthProviderRepository
                .findByProviderNameAndProviderUserId("google", googleUserId);

        if (existingProvider.isPresent()) {
            log.info("Found existing OAuth provider, updating tokens");
            OAuthProvider provider = existingProvider.get();
            updateOAuthProvider(provider, tokenResponse, email, firstName + " " + lastName, avatarUrl);
            return provider.getUser();
        }

        // Check if user exists by email
        log.info("Checking if user exists by email: {}", email);
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            log.info("Found existing user by email, updating profile");
            user = existingUser.get();
            updateExistingUserProfile(user, firstName, lastName, avatarUrl);
            
            // Update organization if user doesn't have one but email domain matches
            if (user.getOrganization() == null) {
                Organization organization = determineOrganizationFromEmail(email);
                if (organization != null) {
                    user.setOrganization(organization);
                    userRepository.save(user);
                    log.info("Updated existing user's organization to: {}", organization.getName());
                }
            }
        } else {
            log.info("Creating new user with email: {}", email);
            user = createNewUser(email, firstName, lastName, avatarUrl);
            log.info("Successfully created new user with id: {}", user.getId());
        }

        // Create OAuth provider link
        log.info("Creating OAuth provider link for user: {}", user.getId());
        createOAuthProvider(user, googleUserId, tokenResponse, email, firstName + " " + lastName, avatarUrl);
        log.info("Successfully created OAuth provider link");

        return user;
    }

    private User createNewUser(String email, String firstName, String lastName, String avatarUrl) {
        // Get default role - MEMBER role (id=1)
        Role defaultRole = roleRepository.findById(1L)
                .orElseThrow(() -> new HttpException("Default MEMBER role not found", HttpStatus.INTERNAL_SERVER_ERROR));

        // Determine organization based on email domain
        Organization organization = determineOrganizationFromEmail(email);
        
        User user = User.builder()
                .email(email)
                .password("") // No password for OAuth users
                .firstLogin(true)
                .deleted(false)
                .roles(new HashSet<>(Set.of(defaultRole)))
                .organization(organization) // Set organization based on email domain
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        // Create user profile
        UserProfile profile = UserProfile.builder()
                .user(savedUser)
                .firstName(firstName != null ? firstName : "")
                .lastName(lastName != null ? lastName : "")
                .status("active")
                .avtUrl(avatarUrl != null ? avatarUrl : "")
                .build();

        userProfileRepository.save(profile);
        savedUser.setUserProfile(profile);

        return savedUser;
    }

    private void updateExistingUserProfile(User user, String firstName, String lastName, String avatarUrl) {
        UserProfile profile = user.getUserProfile();
        if (profile != null) {
            // Update existing profile with latest info from Google
            profile.setFirstName(firstName != null ? firstName : profile.getFirstName());
            profile.setLastName(lastName != null ? lastName : profile.getLastName());
            profile.setAvtUrl(avatarUrl != null ? avatarUrl : profile.getAvtUrl());
            userProfileRepository.save(profile);
            log.info("Updated existing user profile for: {}", user.getEmail());
        } else {
            // Create profile if it doesn't exist
            profile = UserProfile.builder()
                    .user(user)
                    .firstName(firstName != null ? firstName : "")
                    .lastName(lastName != null ? lastName : "")
                    .status("active")
                    .avtUrl(avatarUrl != null ? avatarUrl : "")
                    .build();
            userProfileRepository.save(profile);
            user.setUserProfile(profile);
            log.info("Created new profile for existing user: {}", user.getEmail());
        }
    }

    private void createOAuthProvider(User user, String googleUserId, Map<String, Object> tokenResponse, 
                                   String email, String displayName, String avatarUrl) {
        Integer expiresIn = (Integer) tokenResponse.get("expires_in");
        
        OAuthProvider provider = OAuthProvider.builder()
                .user(user)
                .providerName("google")
                .providerUserId(googleUserId)
                .email(email)
                .displayName(displayName)
                .avatarUrl(avatarUrl)
                .accessToken((String) tokenResponse.get("access_token"))
                .refreshToken((String) tokenResponse.get("refresh_token"))
                .tokenExpiresAt(expiresIn != null ? 
                        LocalDateTime.now().plusSeconds(expiresIn) : null)
                .build();

        oauthProviderRepository.save(provider);
    }

    private void updateOAuthProvider(OAuthProvider provider, Map<String, Object> tokenResponse, 
                                   String email, String displayName, String avatarUrl) {
        Integer expiresIn = (Integer) tokenResponse.get("expires_in");
        
        provider.setEmail(email);
        provider.setDisplayName(displayName);
        provider.setAvatarUrl(avatarUrl);
        provider.setAccessToken((String) tokenResponse.get("access_token"));
        provider.setRefreshToken((String) tokenResponse.get("refresh_token"));
        provider.setTokenExpiresAt(expiresIn != null ? 
                LocalDateTime.now().plusSeconds(expiresIn) : null);
        provider.setUpdatedAt(LocalDateTime.now());

        oauthProviderRepository.save(provider);
    }

    /**
     * Determine organization based on email domain
     * @param email user's email address
     * @return Organization if domain matches, null otherwise
     */
    private Organization determineOrganizationFromEmail(String email) {
        if (email == null || !email.contains("@")) {
            log.warn("Invalid email format: {}", email);
            return null;
        }

        String emailDomain = organizationService.extractDomainFromEmail(email);
        if (emailDomain == null) {
            log.warn("Could not extract domain from email: {}", email);
            return null;
        }

        Organization organization = organizationService.findByEmailDomain(emailDomain);
        if (organization != null) {
            log.info("Found organization '{}' for email domain: {}", organization.getName(), emailDomain);
            return organization;
        }

        // Auto-create organization if not found and feature is enabled
        if (autoCreateOrganization) {
            log.info("No organization found for email domain: {}, attempting auto-creation", emailDomain);
            return autoCreateOrganizationForDomain(emailDomain, email);
        } else {
            log.info("No organization found for email domain: {} (auto-creation disabled)", emailDomain);
            return null;
        }
    }

    /**
     * Auto-create organization for email domain
     * @param emailDomain the email domain
     * @param userEmail the user's email for context
     * @return newly created Organization or null if creation failed
     */
    private Organization autoCreateOrganizationForDomain(String emailDomain, String userEmail) {
        try {
            // Skip auto-creation for common public email domains (if configured)
            if (excludePublicDomains && isPublicEmailDomain(emailDomain)) {
                log.info("Skipping auto-creation for public email domain: {}", emailDomain);
                return null;
            }

            // Generate organization name from domain
            String organizationName = generateOrganizationNameFromDomain(emailDomain);
            
            // Find a default owner (first admin user or system user)
            User defaultOwner = findDefaultOwnerForNewOrganization();
            if (defaultOwner == null) {
                log.warn("No default owner found for auto-creating organization: {}", emailDomain);
                return null;
            }

            // Create organization
            Organization newOrganization = organizationService.createOrganizationWithDomain(
                organizationName, 
                emailDomain, 
                defaultOwner.getId()
            );

            log.info("Auto-created organization '{}' for domain: {} (triggered by user: {})", 
                    newOrganization.getName(), emailDomain, userEmail);
            
            return newOrganization;
            
        } catch (Exception e) {
            log.error("Failed to auto-create organization for domain: {} (user: {}). Error: {}", 
                    emailDomain, userEmail, e.getMessage());
            return null;
        }
    }

    /**
     * Check if email domain is a public email provider
     */
    private boolean isPublicEmailDomain(String domain) {
        Set<String> publicDomains = Set.of(
            "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", 
            "icloud.com", "protonmail.com", "aol.com", "mail.com",
            "yandex.com", "zoho.com", "tutanota.com"
        );
        return publicDomains.contains(domain.toLowerCase());
    }

    /**
     * Generate organization name from domain
     */
    private String generateOrganizationNameFromDomain(String domain) {
        // Remove common TLDs and format as organization name
        String name = domain.replaceAll("\\.(com|org|edu|gov|net|vn|io|co)$", "");
        
        // Handle special cases
        if (domain.contains("vku.udn.vn")) {
            return "Vietnam Korea University";
        }
        if (domain.contains("hust.edu.vn")) {
            return "Hanoi University of Science and Technology";
        }
        if (domain.contains("uit.edu.vn")) {
            return "University of Information Technology";
        }
        
        // Default: capitalize first letter of each part
        String[] parts = name.split("\\.");
        StringBuilder result = new StringBuilder();
        for (String part : parts) {
            if (result.length() > 0) result.append(" ");
            result.append(part.substring(0, 1).toUpperCase())
                  .append(part.substring(1).toLowerCase());
        }
        
        return result.toString() + " Organization";
    }

    /**
     * Find default owner for new organization (first admin user)
     */
    private User findDefaultOwnerForNewOrganization() {
        // Try to find first admin/owner user
        return userRepository.findFirstByRoles_NameOrderByIdAsc("OWNER")
                .or(() -> userRepository.findFirstByRoles_NameOrderByIdAsc("ADMIN"))
                .or(() -> userRepository.findFirstByOrderByIdAsc())
                .orElse(null);
    }
}