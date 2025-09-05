    package com.example.taskmanagement_backend.entities;

    import jakarta.persistence.*;
    import lombok.*;

    import jakarta.persistence.*;
    import lombok.*;

    @Entity
    @Table(name = "user_profiles")
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class UserProfile {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String firstName;

        private String lastName;

        private String status;

        private String avtUrl;

        @OneToOne
        @JoinColumn(name = "user_id", nullable = false, unique = true)
        private User user;
    }
