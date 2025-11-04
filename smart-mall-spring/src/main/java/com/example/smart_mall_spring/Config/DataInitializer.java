package com.example.smart_mall_spring.Config;

import com.example.smart_mall_spring.Entities.Users.Role;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Entities.Users.UserProfile;
import com.example.smart_mall_spring.Repositories.RoleRepository;
import com.example.smart_mall_spring.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Create default roles if not exist
        if (!roleRepository.existsByName("ADMIN")) {
            Role adminRole = new Role();
            adminRole.setCode("ADMIN");
            adminRole.setName("ADMIN");
            roleRepository.save(adminRole);
        }

        if (!roleRepository.existsByName("USER")) {
            Role userRole = new Role();
            userRole.setCode("USER");
            userRole.setName("USER");
            roleRepository.save(userRole);
        }

        if (!roleRepository.existsByName("MANAGER")) {
            Role managerRole = new Role();
            managerRole.setCode("MANAGER");
            managerRole.setName("MANAGER");
            roleRepository.save(managerRole);
        }

        if (!roleRepository.existsByName("SHIPPER")) {
            Role shipperRole = new Role();
            shipperRole.setCode("SHIPPER");
            shipperRole.setName("SHIPPER");
            roleRepository.save(shipperRole);
        }

        // Create default admin user only if database is empty
        if (!userRepository.existsByUsername("admin")) {
            // Get roles first
            Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
            
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode("admin"));
            adminUser.setIsActive(1);
            
            // Add both ADMIN and USER roles
            adminUser.setRoles(new ArrayList<>());
            adminUser.getRoles().add(adminRole);

            UserProfile adminProfile = new UserProfile();
            adminProfile.setFullName("System Administrator");
            adminProfile.setPhoneNumber("0123456789");
            adminProfile.setUser(adminUser);
            adminUser.setProfile(adminProfile);

            userRepository.save(adminUser);
            System.out.println("Default admin user created: admin/admin");
        }
    }
}