package com.hirehub.dto;

public class LoginResponse {
    private String token;
    private String email;
    private String fullName;
    private String role;
    private String status;

    public LoginResponse() {}

    public LoginResponse(String token, String email, String fullName, String role, String status) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.status = status;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
