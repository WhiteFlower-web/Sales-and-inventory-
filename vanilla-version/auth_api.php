<?php
require_once 'db.php';
session_start();

$action = $_GET['action'] ?? '';

if ($action == 'send_otp') {
    $email = $_POST['email'];
    $otp = rand(100000, 999999);
    $expiry = date("Y-m-d H:i:s", strtotime("+10 minutes"));

    // Check if user exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        $stmt = $conn->prepare("UPDATE users SET otp_code = ?, otp_expiry = ? WHERE email = ?");
        $stmt->execute([$otp, $expiry, $email]);
        
        // In real app, use mail() or PHPMailer
        // mail($email, "Your OTP Code", "Your code is: $otp");
        
        echo json_encode(["status" => "success", "message" => "OTP sent to $email (Debug: $otp)"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Email not found"]);
    }
}

if ($action == 'login') {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $otp = $_POST['otp'];

    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // Check OTP first
        if ($user['otp_code'] !== $otp || strtotime($user['otp_expiry']) < time()) {
            echo json_encode(["status" => "error", "message" => "Invalid or expired OTP"]);
            exit;
        }

        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['role'] = $user['role'];
            echo json_encode(["status" => "success", "message" => "Login successful"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid password"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "User not found"]);
    }
}

if ($action == 'qr_login') {
    $token = $_POST['token'];
    $stmt = $conn->prepare("SELECT * FROM users WHERE qr_auth_token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if ($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        echo json_encode(["status" => "success", "message" => "Authenticated via QR"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid QR Token"]);
    }
}
?>
