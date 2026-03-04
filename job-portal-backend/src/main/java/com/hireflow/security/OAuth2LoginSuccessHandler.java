package com.hireflow.security;

import com.hireflow.entity.User;
import com.hireflow.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Find or create user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setRole(User.Role.JOBSEEKER); // Default role
            newUser.setPassword(""); // No password for OAuth users
            return userRepository.save(newUser);
        });

        // Generate JWT token
        String token = jwtUtils.generateToken(authentication);

        // Redirect to frontend with token
        String redirectUrl = String.format(
                "http://localhost:5173/oauth2/callback?token=%s&userId=%d&role=%s&name=%s&email=%s",
                token, user.getId(), user.getRole(), user.getName(), user.getEmail()
        );

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}