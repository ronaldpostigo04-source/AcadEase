<?php
// Set the content type to application/json so the client knows what to expect
header('Content-Type: application/json');

// 1. Establish Database Connection (Replace with your actual credentials)
$host = 'localhost'; // Database host (often 'localhost')
$db   = 'acad-ease'; // Your database name
$user = 'root'; // Your database username
$pass = ''; // Your database password
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Throw exceptions on error
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // Fetch results as associative arrays
    PDO::ATTR_EMULATE_PREPARES   => false, // Better performance and security
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     // Log the error (not to the user) and send a generic error response
     // error_log("Database connection error: " . $e->getMessage());
     http_response_code(500); // Internal Server Error
     echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
     exit;
}

// 2. Read and Decode the JSON Input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Check if decoding was successful and if required fields exist
if ($data === null || !isset($data['name'], $data['email'], $data['password'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid or incomplete data received.']);
    exit;
}

// Extract and sanitize data
$name = trim($data['name']);
$email = trim($data['email']);
$password = $data['password'];

// 3. Data Validation
if (empty($name) || strlen($name) < 2) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Full Name is required and must be at least 2 characters.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long.']);
    exit;
}

// 4. Check if User Already Exists
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(['success' => false, 'message' => 'This email is already registered.']);
        exit;
    }
} catch (\PDOException $e) {
    // error_log("Database error during email check: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'A server error occurred during validation.']);
    exit;
}


// 5. Securely Hash the Password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// 6. Insert User into Database
try {
    $sql = "INSERT INTO users (full_name, email, password_hash, created_at) VALUES (?, ?, ?, NOW())";
    $stmt = $pdo->prepare($sql);
    
    // Execute the statement with the sanitized and hashed data
    $stmt->execute([$name, $email, $hashedPassword]);

    // 7. Success Response
    http_response_code(201); // Created
    echo json_encode(['success' => true, 'message' => 'Registration successful!']);

} catch (\PDOException $e) {
    // error_log("Database error during registration: " . $e->getMessage());
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'Registration failed due to a server error.']);
}

?>