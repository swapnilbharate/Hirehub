package com.hirehub.controller;

import com.hirehub.config.JwtTokenProvider;
import com.hirehub.dto.LoginRequest;
import com.hirehub.dto.LoginResponse;
import com.hirehub.dto.RegisterRequest;
import com.hirehub.entity.User;
import com.hirehub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            User user = userService.registerUser(registerRequest);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User registered successfully!");
            response.put("userId", user.getId());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Load user first to check if they are blocked
            User user = userService.findByEmail(loginRequest.getEmail());
            if ("BLOCKED".equals(user.getStatus())) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("message", "Your account has been blocked by the Administrator.");
                return ResponseEntity.status(403).body(err);
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            return ResponseEntity.ok(new LoginResponse(
                    jwt,
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().getName(),
                    user.getStatus()
            ));
        } catch (Exception ex) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Invalid email or password.");
            return ResponseEntity.status(401).body(err);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        User user = userService.findByEmail(principal.getName());
        Map<String, Object> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("role", user.getRole().getName());
        response.put("status", user.getStatus());
        return ResponseEntity.ok(response);
    }
}
