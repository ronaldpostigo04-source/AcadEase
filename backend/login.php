<?php
// Start the session at the very beginning
session_start();

// Set headers for security and JSON response format
header('Content-Type: application/json');

// --- 1. Database Connection Configuration ---
$host = 'localhost'; // Database host
$db   = 'acad-ease'; // Your database name
$user = 'root'; // Your database username
$pass = ''; // Your database password
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

// --- 2. Database Connection ---
try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     error_log("Database connection error: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(['success' => false, 'message' => 'Internal server error.']);
     exit;
}

// =================================================================
//                 HANDLER FOR GET METHOD (CHECK LOGIN STATUS)
// =================================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check if the 'logged_user' session variable is set
    if (isset($_SESSION["logged_user"])) {
        http_response_code(200); // OK
        echo json_encode([
            'success' => true, 
            'isLoggedIn' => true, 
            // Optionally, return the user ID or a token/name for display
            'userId' => $_SESSION["logged_user"]
        ]);
        exit;
    } else {
        http_response_code(401); // Unauthorized
        echo json_encode(['success' => true, 'isLoggedIn' => false, 'message' => 'User not logged in.']);
        exit;
    }
}

// =================================================================
//                 HANDLER FOR POST METHOD (USER LOGIN)
// =================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // --- Input Handling and Decoding ---
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if ($data === null || !isset($data['email'], $data['password'])) {
        http_response_code(400); // Bad Request
        echo json_encode(['success' => false, 'message' => 'Invalid or missing data fields.']);
        exit;
    }

    // Extract and sanitize data
    $email = strtolower(trim($data['email']));
    $password = $data['password'];

    // --- Validation ---
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
        exit;
    }

    // --- Fetch User Data & Verify Password ---
    try {
        $stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            // Generic error for security
            http_response_code(401); // Unauthorized
            echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
            exit;
        }

        // --- Login Success: Create Session ---
        $_SESSION["logged_user"] = $user['id']; 
        session_regenerate_id(true);

        http_response_code(200); // OK
        echo json_encode(['success' => true, 'message' => 'Login successful.']);

    } catch (\PDOException $e) {
        error_log("DB Error during login: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'A server error occurred during authentication.']);
    }
}
?>