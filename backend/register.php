<?php
// Set headers for security and JSON response format
header('Content-Type: application/json');
// Allow only POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed.']);
    exit;
}

// 1. Establish Database Connection (Replace with your actual credentials)
$host = 'localhost'; // Database host (often 'localhost')
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
     // Log the error for internal debugging, but send a generic message to the client
     error_log("Database connection error: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(['success' => false, 'message' => 'Internal server error: Could not connect to database.']);
     exit;
}

// --- 3. Input Handling and Decoding (Expecting JSON from fetch) ---
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Check if data was received and decoded correctly
if ($data === null || !isset($data['name'], $data['email'], $data['password'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid or missing data fields (name, email, password) in request.']);
    exit;
}

// Extract and sanitize data
$name = trim($data['name']);
$email = strtolower(trim($data['email'])); // Store emails in lowercase for uniqueness
$password = $data['password'];

// --- 4. Validation Checks ---
if (empty($name) || strlen($name) < 2) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Full Name must be at least 2 characters.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
    exit;
}

// Password must be secure (e.g., at least 8 characters)
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long.']);
    exit;
}

// --- 5. Check for Existing User (Unique Email Check) ---
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->fetchColumn() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(['success' => false, 'message' => 'This email address is already registered.']);
        exit;
    }
} catch (\PDOException $e) {
    error_log("DB Error on unique check: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'A server error occurred during validation.']);
    exit;
}


// --- 6. Password Hashing and Insertion ---

// Securely hash the password using bcrypt (recommended default)
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

try {
    $sql = "INSERT INTO users (full_name, email, password_hash, created_at) VALUES (?, ?, ?, NOW())";
    $stmt = $pdo->prepare($sql);
    
    // Execute the statement with the validated, sanitized, and hashed data
    $stmt->execute([$name, $email, $hashedPassword]);

    // --- 7. Success Response ---
    http_response_code(201); // Created
    echo json_encode(['success' => true, 'message' => 'Registration successful! You can now log in.']);

} catch (\PDOException $e) {
    // Check for the specific error code indicating a UNIQUE constraint violation (Duplicate Entry)
    // 23000 is the SQLSTATE for Integrity Constraint Violation
    if ($e->getCode() === '23000' || (isset($e->errorInfo[1]) && $e->errorInfo[1] == 1062)) {
        http_response_code(409); // Conflict
        echo json_encode(['success' => false, 'message' => 'This email is already registered. (Database Conflict)']);
    } else {
        error_log("DB Error on INSERT: " . $e->getMessage());
        http_response_code(500); // Internal Server Error
        echo json_encode(['success' => false, 'message' => 'Registration failed due to an unknown server error.']);
    }
}

?>