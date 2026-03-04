package com.hireflow.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendApplicationConfirmationToApplicant(String to, String applicantName,
                                                       String jobTitle, String companyName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Application Submitted - " + jobTitle);
            message.setText(String.format(
                    "Dear %s,\n\n" +
                            "Your application for the position of '%s' at %s has been successfully submitted.\n\n" +
                            "We have received your application and will review it shortly. " +
                            "You will be notified about the next steps via email.\n\n" +
                            "Thank you for your interest!\n\n" +
                            "Best regards,\n" +
                            "HireFlow Team",
                    applicantName, jobTitle, companyName
            ));

            mailSender.send(message);
            log.info("Application confirmation email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
        }
    }

    @Async
    public void sendNewApplicationNotificationToCompany(String to, String companyName,
                                                        String applicantName, String jobTitle) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("New Application Received - " + jobTitle);
            message.setText(String.format(
                    "Dear %s,\n\n" +
                            "You have received a new application for the position of '%s'.\n\n" +
                            "Applicant: %s\n\n" +
                            "Please log in to your HireFlow dashboard to review the application.\n\n" +
                            "Best regards,\n" +
                            "HireFlow Team",
                    companyName, jobTitle, applicantName
            ));

            mailSender.send(message);
            log.info("New application notification sent to company: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to company: {}", to, e);
        }
    }

    @Async
    public void sendApplicationStatusUpdate(String to, String applicantName,
                                            String jobTitle, String newStatus) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Application Status Update - " + jobTitle);

            String statusMessage = getStatusMessage(newStatus);

            message.setText(String.format(
                    "Dear %s,\n\n" +
                            "Your application for '%s' has been updated.\n\n" +
                            "Status: %s\n\n" +
                            "%s\n\n" +
                            "Best regards,\n" +
                            "HireFlow Team",
                    applicantName, jobTitle, newStatus, statusMessage
            ));

            mailSender.send(message);
            log.info("Status update email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send status update email to: {}", to, e);
        }
    }

    private String getStatusMessage(String status) {
        return switch (status.toUpperCase()) {
            case "REVIEWED" -> "Your application has been reviewed by the hiring team.";
            case "SHORTLISTED" -> "Congratulations! You have been shortlisted for the next round.";
            case "ACCEPTED" -> "Congratulations! Your application has been accepted. We will contact you soon.";
            case "REJECTED" -> "Thank you for your interest. Unfortunately, we have decided to proceed with other candidates.";
            default -> "Please check your dashboard for more details.";
        };
    }
}