package com.example.taskmanagement_backend.config;

import com.example.taskmanagement_backend.exceptions.CustomAccessDeniedHandler;
import com.example.taskmanagement_backend.exceptions.CustomAuthenticationEntryPoint;
import com.example.taskmanagement_backend.filters.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final CorsConfigurationSource  corsConfigurationSource;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(customAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth

                        // OAuth2 Google Login
                        .requestMatchers("/api/auth/google/**").permitAll()

                        // Public Auth endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()

                        // Swagger docs
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html",
                                "/swagger-ui/index.html"
                        ).permitAll()

                        // User & Organization registration
                        .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/organizations").permitAll()

                        // Users
                        .requestMatchers("/api/users/by-email").permitAll()
                        .requestMatchers("/api/users/**").hasAnyRole("OWNER", "PROJECT_MANAGEMENT", "ADMIN")

                        // Tasks
                        .requestMatchers("/api/tasks/**").hasAnyRole("ADMIN", "OWNER", "PROJECT_MANAGEMENT", "MEMBER", "LEADER")

                        // Projects
                        .requestMatchers(HttpMethod.GET, "/api/projects/{id}").hasAnyRole("PROJECT_MANAGEMENT", "OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/projects/{id}").hasAnyRole("PROJECT_MANAGEMENT", "OWNER")
                        .requestMatchers("/api/projects/**").hasAnyRole("ADMIN", "OWNER", "PROJECT_MANAGEMENT")

                        // Organizations
                        .requestMatchers(HttpMethod.GET, "/api/organizations/{id}").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/organizations/{id}").hasRole("OWNER")
                        .requestMatchers(HttpMethod.DELETE, "/api/organizations/{id}").hasRole("OWNER")
                        .requestMatchers("/api/organizations/**").hasAnyRole("ADMIN", "OWNER")

                        // Invitations
                        .requestMatchers("/api/project-invitations/**").hasRole("OWNER")
                        .requestMatchers("/api/team-invitations/**").hasAnyRole("OWNER", "PROJECT_MANAGEMENT")
                        .requestMatchers("/api/invitations/accept**").hasAnyRole("OWNER", "PROJECT_MANAGEMENT","LEADER")


                        // Any other request must be authenticated
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


}
