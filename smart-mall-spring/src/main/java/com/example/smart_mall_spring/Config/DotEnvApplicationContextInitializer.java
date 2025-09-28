package com.example.smart_mall_spring.Config;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.PropertiesPropertySource;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class DotEnvApplicationContextInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        
        // Load .env file from root directory
        File envFile = new File(".env");
        if (envFile.exists()) {
            Properties props = new Properties();
            try (FileInputStream input = new FileInputStream(envFile)) {
                props.load(input);
                
                // Add properties to Spring environment with highest priority
                environment.getPropertySources().addFirst(new PropertiesPropertySource("dotenv", props));
                
                System.out.println("✅ Loaded .env file successfully with " + props.size() + " properties");
                props.forEach((key, value) -> {
                    System.out.println("   " + key + "=***");
                });
            } catch (IOException e) {
                System.err.println("❌ Error loading .env file: " + e.getMessage());
            }
        } else {
            System.out.println("⚠️ .env file not found at: " + envFile.getAbsolutePath());
        }
    }
}