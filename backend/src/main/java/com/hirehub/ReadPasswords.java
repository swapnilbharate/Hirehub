package com.hirehub;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class ReadPasswords {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/hirehub?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String user = "root";
        String password = "root";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT email, password FROM users")) {
            
            while (rs.next()) {
                System.out.println("Email: " + rs.getString("email") + " | Hash: " + rs.getString("password"));
            }
            
        } catch (Exception e) {
            System.err.println("Error reading passwords: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
