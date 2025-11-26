package com.example.smart_mall_spring.Services.Auth;

import com.example.smart_mall_spring.Config.CustomUserDetails;
import com.example.smart_mall_spring.Config.EmailValidator;
import com.example.smart_mall_spring.Dtos.Auth.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.smart_mall_spring.Entities.Users.Role;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Entities.Users.UserProfile;
import com.example.smart_mall_spring.Exception.CustomException;
import com.example.smart_mall_spring.Repositories.RoleRepository;
import com.example.smart_mall_spring.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private GoogleOAuth2Service googleOAuth2Service;

    @Autowired
    private EmailService emailService;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    public AuthResponseDto login(LoginRequestDto request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            if (user.getIsActive() != 1) {
                throw new CustomException("Account is not active");
            }

            String accessToken = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            UserInfoDto userInfo = buildUserInfoDto(user);

            return AuthResponseDto.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtExpiration / 1000) // Convert to seconds
                    .userInfo(userInfo)
                    .build();

        } catch (Exception e) {
            throw new CustomException("Invalid username or password");
        }
    }

    public AuthResponseDto register(RegisterRequestDto request) {
        // Validate username format (must be email, except for admin)
        if (!request.getUsername().equals("admin") && !EmailValidator.isValid(request.getUsername())) {
            throw new CustomException("Username must be a valid email format");
        }
        
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CustomException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(1);

        // Create user profile
        UserProfile profile = new UserProfile();
        profile.setFullName(request.getFullName());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setUser(user);
        user.setProfile(profile);

        // Determine role: USER (default), MANAGER, or SHIPPER
        final String roleName;
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            String requestedRole = request.getRole().trim().toUpperCase();
            if (requestedRole.equals("MANAGER") || requestedRole.equals("SHIPPER") || requestedRole.equals("USER")) {
                roleName = requestedRole;
            } else {
                throw new CustomException("Invalid role. Allowed roles: USER, MANAGER, SHIPPER");
            }
        } else {
            roleName = "USER"; // Default role
        }
        
        Role userRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new CustomException(roleName + " role not found"));
        user.setRoles(Collections.singletonList(userRole));

        User savedUser = userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        UserInfoDto userInfo = buildUserInfoDto(savedUser);

        return AuthResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .userInfo(userInfo)
                .build();
    }

    public AuthResponseDto refreshToken(RefreshTokenRequestDto request) {
        try {
            String username = jwtService.extractUsername(request.getRefreshToken());
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(request.getRefreshToken(), userDetails)) {
                String newAccessToken = jwtService.generateToken(userDetails);
                String newRefreshToken = jwtService.generateRefreshToken(userDetails);

                CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
                UserInfoDto userInfo = buildUserInfoDto(customUserDetails.getUser());

                return AuthResponseDto.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(newRefreshToken)
                        .tokenType("Bearer")
                        .expiresIn(jwtExpiration / 1000)
                        .userInfo(userInfo)
                        .build();
            } else {
                throw new CustomException("Invalid refresh token");
            }
        } catch (Exception e) {
            throw new CustomException("Invalid refresh token");
        }
    }

    public AuthResponseDto loginWithGoogle(GoogleLoginRequestDto request) {
        try {
            // Validate input
            if (request.getIdToken() == null || request.getIdToken().trim().isEmpty()) {
                throw new CustomException("Google ID token is required");
            }

            // Verify Google ID token
            logger.info("Starting Google login process");
            var payload = googleOAuth2Service.verifyIdToken(request.getIdToken());
            
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            
            logger.info("Google token verified for email: {}", email);
            
            if (email == null) {
                throw new CustomException("Email not provided by Google");
            }

            // Find or create user
            User user = userRepository.findByUsername(email).orElse(null);
            
            if (user == null) {
                // Create new user with Google info
                user = new User();
                user.setUsername(email);
                user.setPassword(passwordEncoder.encode("GOOGLE_OAUTH_" + System.currentTimeMillis())); // Random password
                user.setIsActive(1);

                // Create user profile
                UserProfile profile = new UserProfile();
                profile.setFullName(name != null ? name : "Google User");
                profile.setUser(user);
                profile.setAvatar(picture);
                user.setProfile(profile);

                // Set default USER role
                Role userRole = roleRepository.findByName("USER")
                        .orElseThrow(() -> new CustomException("USER role not found"));
                user.setRoles(Collections.singletonList(userRole));

                user = userRepository.save(user);
            }

            // Check if user is active
            if (user.getIsActive() != 1) {
                throw new CustomException("Account is not active");
            }

            // Generate tokens
            CustomUserDetails userDetails = new CustomUserDetails(user);
            String accessToken = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            UserInfoDto userInfo = buildUserInfoDto(user);

            return AuthResponseDto.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtExpiration / 1000)
                    .userInfo(userInfo)
                    .build();

        } catch (CustomException e) {
            logger.error("Google login failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during Google login: {}", e.getMessage(), e);
            throw new CustomException("Google login failed: " + e.getMessage());
        }
    }

    private UserInfoDto buildUserInfoDto(User user) {
        List<String> roleNames = user.getRoles() != null
                ? user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList())
                : Collections.emptyList();

        UserProfile profile = user.getProfile();

        return UserInfoDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(profile != null ? profile.getFullName() : null)
                .phoneNumber(profile != null ? profile.getPhoneNumber() : null)
                .avatar(profile != null ? profile.getAvatar() : null)
                .isActive(user.getIsActive())
                .roles(roleNames)
                .build();
    }

    // Mobile email login - Step 1: Send verification code
    public void sendMobileLoginCode(MobileEmailLoginRequestDto request) {
        logger.info("Mobile login code request for username: {}", request.getUsername());
        
        // Find user by username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    logger.warn("Username does not exist: {}", request.getUsername());
                    return new CustomException("Username does not exist");
                });

        // Check if user is active
        if (user.getIsActive() != 1) {
            logger.warn("Inactive account attempted login: {}", request.getUsername());
            throw new CustomException("Account is not active");
        }

        // Generate 6-digit code
        String code = generateSixDigitCode();
        logger.debug("Generated login code for user: {}", request.getUsername());
        
        // Save code and creation time to database
        user.setLoginCode(code);
        user.setLoginCodeCreationTime(LocalDateTime.now());
        userRepository.save(user);
        logger.info("Login code saved to database for user: {}", request.getUsername());

        // Send code via email
        try {
            emailService.sendLoginCode(request.getUsername(), code);
            logger.info("Login code email sent successfully to: {}", request.getUsername());
        } catch (Exception e) {
            logger.error("Failed to send login code email to: {}. Error: {}", request.getUsername(), e.getMessage(), e);
            throw new CustomException("Failed to send verification code. Please try again.");
        }
    }

    // Mobile email login - Step 2: Verify code and login
    public AuthResponseDto verifyMobileLoginCode(MobileVerifyCodeRequestDto request) {
        logger.info("Mobile login code verification for username: {}", request.getUsername());
        
        // Find user by username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    logger.warn("Username does not exist during verification: {}", request.getUsername());
                    return new CustomException("Username does not exist");
                });

        // Check if user is active
        if (user.getIsActive() != 1) {
            logger.warn("Inactive account attempted verification: {}", request.getUsername());
            throw new CustomException("Account is not active");
        }

        // Check if code exists
        if (user.getLoginCode() == null || user.getLoginCodeCreationTime() == null) {
            logger.warn("No verification code found for user: {}", request.getUsername());
            throw new CustomException("No verification code found. Please request a new code.");
        }

        // Check if code is expired (5 minutes)
        LocalDateTime expirationTime = user.getLoginCodeCreationTime().plusMinutes(5);
        if (LocalDateTime.now().isAfter(expirationTime)) {
            logger.warn("Verification code expired for user: {}", request.getUsername());
            throw new CustomException("Verification code has expired. Please request a new code.");
        }

        // Verify code
        if (!user.getLoginCode().equals(request.getCode())) {
            logger.warn("Invalid verification code for user: {}", request.getUsername());
            throw new CustomException("Invalid verification code");
        }

        logger.info("Verification code validated successfully for user: {}", request.getUsername());

        // Clear the code after successful verification
        user.setLoginCode(null);
        user.setLoginCodeCreationTime(null);
        userRepository.save(user);

        // Generate tokens
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        UserInfoDto userInfo = buildUserInfoDto(user);

        logger.info("Mobile login successful for user: {}", request.getUsername());

        return AuthResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .userInfo(userInfo)
                .build();
    }

    private String generateSixDigitCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Generate number between 100000 and 999999
        return String.valueOf(code);
    }
}