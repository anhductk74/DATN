package com.example.smart_mall_spring.Services.Auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendLoginCode(String toEmail, String code) {
        try {
            logger.info("Attempting to send login code to: {}", toEmail);
            logger.debug("Email configuration - From: {}", fromEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Your Login Code - Smart Mall");
            message.setText("Your login verification code is: " + code + "\n\nThis code will expire in 5 minutes.\n\nIf you did not request this code, please ignore this email.");
            
            mailSender.send(message);
            logger.info("Login code sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send email to: {}. Error: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}
