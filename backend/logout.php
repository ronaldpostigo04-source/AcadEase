<?php
// Start the session to be able to access session data
session_start();

// Set headers for security and JSON response format
header('Content-Type: application/json');
// Prevent caching of the response
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Ensure this is only accessible via POST or GET, depending on your client-side implementation.
// For simplicity, we allow both, but POST is generally preferred for actions that change state.

// --- 1. Unset all of the session variables for the specific user ---
$_SESSION = array(); // Clear the entire array

// Alternatively, if you only had one variable:
// unset($_SESSION['logged_user']); 

// --- 2. Destroy the session cookie and session data ---

// If it's desired to kill the session, also delete the session cookie.
// Note: This will destroy the session, and not just the session data!
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Finally, destroy the session
session_destroy();

// --- 3. Send Success Response ---
http_response_code(200); // OK
echo json_encode(['success' => true, 'message' => 'You have been successfully logged out.']);

exit;
?>