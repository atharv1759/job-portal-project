package com.hireflow.service.impl;

import com.hireflow.dto.request.ApplicationRequest;
import com.hireflow.dto.response.ApiResponse;
import com.hireflow.entity.Application;
import com.hireflow.entity.Job;
import com.hireflow.entity.User;
import com.hireflow.exception.AccessDeniedException;
import com.hireflow.exception.DuplicateResourceException;
import com.hireflow.exception.ResourceNotFoundException;
import com.hireflow.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobService jobService;
    private final UserService userService;
    @Autowired
    private EmailService emailService;
    @Transactional
    public ApiResponse.ApplicationResponse apply(Long jobId, ApplicationRequest request) {
        User applicant = userService.getCurrentUser();
        Job job = jobService.findJobOrThrow(jobId);

        if (job.getStatus() != Job.JobStatus.ACTIVE) {
            throw new IllegalArgumentException("This job is no longer accepting applications");
        }

        if (applicationRepository.existsByJobAndApplicant(job, applicant)) {
            throw new DuplicateResourceException("You have already applied to this job");
        }

        Application application = Application.builder()
                .job(job)
                .applicant(applicant)
                .coverLetter(request.getCoverLetter())
                .phone(request.getPhone())
                .portfolioUrl(request.getPortfolioUrl())
                .resumeUrl(request.getResumeUrl())
                .status(Application.ApplicationStatus.PENDING)
                .build();

        application = applicationRepository.save(application);
        log.info("Application submitted: userId={} for jobId={}", applicant.getId(), jobId);

        // Send emails (ADD THESE LINES)
        String companyName = job.getCompany().getCompanyName() != null
                ? job.getCompany().getCompanyName()
                : job.getCompany().getName();

        emailService.sendApplicationConfirmationToApplicant(
                applicant.getEmail(),
                applicant.getName(),
                job.getTitle(),
                companyName
        );

        emailService.sendNewApplicationNotificationToCompany(
                job.getCompany().getEmail(),
                companyName,
                applicant.getName(),
                job.getTitle()
        );

        return mapToResponse(application);
    }

    @Transactional(readOnly = true)
    public List<ApiResponse.ApplicationResponse> getMyApplications() {
        User applicant = userService.getCurrentUser();
        return applicationRepository.findByApplicantOrderByCreatedAtDesc(applicant)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public boolean hasApplied(Long jobId) {
        User applicant = userService.getCurrentUser();
        Job job = jobService.findJobOrThrow(jobId);
        return applicationRepository.existsByJobAndApplicant(job, applicant);
    }

    @Transactional(readOnly = true)
    public List<ApiResponse.ApplicationResponse> getApplicationsForJob(Long jobId) {
        User company = userService.getCurrentUser();
        Job job = jobService.findJobOrThrow(jobId);

        if (!job.getCompany().getId().equals(company.getId())) {
            throw new AccessDeniedException("You can only view applications for your own jobs");
        }

        return applicationRepository.findByJobOrderByCreatedAtDesc(job)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public ApiResponse.ApplicationResponse updateStatus(Long applicationId, Application.ApplicationStatus status, String newStatus) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        User currentUser = userService.getCurrentUser();
        if (!application.getJob().getCompany().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Not authorized to update this application");
        }

        application.setStatus(Application.ApplicationStatus.valueOf(newStatus.toUpperCase()));
        application = applicationRepository.save(application);

        // Send status update email (ADD THESE LINES)
        emailService.sendApplicationStatusUpdate(
                application.getApplicant().getEmail(),
                application.getApplicant().getName(),
                application.getJob().getTitle(),
                newStatus
        );

        log.info("Application status updated: id={} newStatus={}", applicationId, newStatus);
        return mapToResponse(application);
    }

    public ApiResponse.ApplicationResponse mapToResponse(Application app) {
        return ApiResponse.ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .companyName(app.getJob().getCompany().getCompanyName() != null
                        ? app.getJob().getCompany().getCompanyName()
                        : app.getJob().getCompany().getName())
                .applicantId(app.getApplicant().getId())
                .applicantName(app.getApplicant().getName())
                .applicantEmail(app.getApplicant().getEmail())
                .coverLetter(app.getCoverLetter())
                .phone(app.getPhone())
                .portfolioUrl(app.getPortfolioUrl())
                .resumeUrl(app.getResumeUrl())
                .status(app.getStatus().name())
                .companyNotes(app.getCompanyNotes())
                .createdAt(app.getCreatedAt())
                .build();
    }
}
