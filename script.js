// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    if (href.startsWith('#')) {
      document.querySelector(href).scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Intersection Observer for animations
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.section, .card').forEach(el => observer.observe(el));

// ========== FIREBASE CONFIGURATION ==========
// Ilagay ang iyong actual Firebase config dito
const firebaseConfig = {
  apiKey: "AIzaSy...",  // palitan ng iyong actual API key
  authDomain: "acadease-64c51.firebaseapp.com",
  projectId: "acadease-64c51",
  storageBucket: "acadease-64c51.appspot.com",
  messagingSenderId: "775178252024",
  appId: "1:775178252024:web:abd2426e9f8e4775d6d4"
};

// Initialize Firebase (kung gagamitin ang Firebase)
let auth, db;
try {
  if (firebase && firebase.initializeApp) {
    const app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    
    // Check authentication state
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User logged in:", user.email);
        updateUIForLoggedInUser(user);
      } else {
        console.log("User logged out");
        updateUIForLoggedOutUser();
      }
    });
  }
} catch (error) {
  console.log("Firebase not available, using localStorage only");
}

// ========== FILE VIEWER FUNCTIONS ==========
// Function to open file directly in view modal
function viewFileInModal(fileData) {
  const fileType = getFileType(fileData.name);
  const fileName = fileData.name;
  const fileSize = formatFileSize(fileData.size);
  
  let previewHTML = '';
  
  if (fileType === 'pdf') {
    previewHTML = `
      <div class="embedded-preview">
        <iframe src="${fileData.url}" title="${fileName}"></iframe>
      </div>
      <div class="file-info">
        <p><strong>File:</strong> ${fileName}</p>
        <p><strong>Size:</strong> ${fileSize}</p>
        <p><strong>Type:</strong> PDF Document</p>
      </div>
      <div class="file-preview-actions">
        <button class="view-btn" onclick="window.open('${fileData.url}', '_blank')">Open in New Tab</button>
        <button class="download-btn" onclick="downloadFile('${fileData.url}', '${fileName}')">Download PDF</button>
      </div>
    `;
  } else if (fileType === 'txt') {
    // For text files, try to read and display content
    previewHTML = `
      <div class="file-content-display">
        <h5>${fileName}</h5>
        <div class="file-info">
          <p><strong>Size:</strong> ${fileSize}</p>
          <p><strong>Type:</strong> Text Document</p>
        </div>
        <div class="text-file-content">
          <p>Loading text content...</p>
        </div>
      </div>
      <div class="file-preview-actions">
        <button class="view-btn" onclick="viewFileInText('${fileData.url}', '${fileName}')">Load Text Content</button>
        <button class="download-btn" onclick="downloadFile('${fileData.url}', '${fileName}')">Download TXT</button>
      </div>
    `;
  } else if (fileType === 'doc' || fileType === 'wps') {
    // For Word/WPS files, show download option and embedded viewer
    previewHTML = `
      <div class="embedded-preview">
        <iframe src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileData.url)}" title="${fileName}"></iframe>
      </div>
      <div class="file-info">
        <p><strong>File:</strong> ${fileName}</p>
        <p><strong>Size:</strong> ${fileSize}</p>
        <p><strong>Type:</strong> ${fileType === 'doc' ? 'Word Document' : 'WPS Document'}</p>
      </div>
      <div class="file-preview-actions">
        <button class="view-btn" onclick="window.open('https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileData.url)}', '_blank')">Open in Office Online</button>
        <button class="download-btn" onclick="downloadFile('${fileData.url}', '${fileName}')">Download File</button>
      </div>
    `;
  } else {
    // For other file types
    previewHTML = `
      <div class="no-preview-available">
        <h5>${fileName}</h5>
        <p><strong>Size:</strong> ${fileSize}</p>
        <p><strong>Type:</strong> ${fileType.toUpperCase()} File</p>
        <p>Preview not available for this file type.</p>
        <p>You can download the file to view it.</p>
      </div>
      <div class="file-preview-actions">
        <button class="download-btn" onclick="downloadFile('${fileData.url}', '${fileName}')">Download File</button>
      </div>
    `;
  }
  
  // Show in modal
  const modalTitle = document.getElementById('fileViewerTitle');
  const modalContent = document.getElementById('fileViewerContent');
  const modal = document.getElementById('fileViewerModal');
  
  if (modalTitle) modalTitle.textContent = `View File: ${fileName}`;
  if (modalContent) modalContent.innerHTML = previewHTML;
  if (modal) modal.classList.add('active');
  
  // Auto-load text content for text files
  if (fileType === 'txt') {
    viewFileInText(fileData.url, fileName);
  }
}

// Function to load and display text file content
async function viewFileInText(fileUrl, fileName) {
  try {
    const response = await fetch(fileUrl);
    const text = await response.text();
    
    const textContainer = document.querySelector('.text-file-content');
    if (textContainer) {
      textContainer.textContent = text;
      
      // Add syntax highlighting for code files
      if (fileName.endsWith('.html') || fileName.endsWith('.css') || fileName.endsWith('.js')) {
        textContainer.innerHTML = `<pre>${escapeHtml(text)}</pre>`;
      }
    }
  } catch (error) {
    console.error('Error loading text file:', error);
    const textContainer = document.querySelector('.text-file-content');
    if (textContainer) {
      textContainer.textContent = 'Unable to load file content. Please download the file to view it.';
    }
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Function to copy text to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

// Function to download file
function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ========== CALENDAR FUNCTIONS ==========
// Update the showEventsForDay function to include better file viewing
function showEventsForDay(day) {
  const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  const events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
  const dayEvents = events.filter(event => event.date === dateStr);
  
  if (dayEvents.length === 0) {
    alert(`No assignments scheduled for ${dateStr}`);
    return;
  }
  
  document.getElementById('eventDetailsTitle').textContent = `Assignments for ${dateStr}`;
  
  let eventsHTML = '';
  dayEvents.forEach((event, eventIndex) => {
    // Generate file list HTML with view/download buttons
    let fileListHTML = '';
    if (event.files && event.files.length > 0) {
      fileListHTML = '<h4>📎 Attached Files:</h4>';
      event.files.forEach((file, fileIndex) => {
        const fileType = getFileType(file.name);
        fileListHTML += `
          <div class="file-item">
            <div class="file-icon ${fileType}">${fileType.toUpperCase()}</div>
            <div class="file-info">
              <div class="file-name">${file.name}</div>
              <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="file-actions">
              <button class="file-btn view" onclick="viewFileInModal(${JSON.stringify(file).replace(/"/g, '&quot;')})">View</button>
              <button class="file-btn download" onclick="downloadFile('${file.url}', '${file.name}')">Download</button>
            </div>
          </div>
        `;
      });
    }
    
    // Add view link option if there's a link
    let linkHTML = '';
    if (event.link) {
      linkHTML = `
        <div class="link-preview-container">
          <h5>🔗 Assignment Link:</h5>
          <div class="link-display">
            <a href="${event.link}" target="_blank">${event.link}</a>
          </div>
          <div class="file-preview-actions">
            <button class="view-btn" onclick="window.open('${event.link}', '_blank')">Open Link</button>
            <button class="download-btn" onclick="copyToClipboard('${event.link}')">Copy Link</button>
          </div>
        </div>
      `;
    }
    
    eventsHTML += `
      <div class="event-details">
        <h4>${event.title}</h4>
        <p>${event.description || 'No description provided'}</p>
        <p><strong>Type:</strong> <span class="event-type ${event.type}">${event.type}</span></p>
        <p><strong>Due Date:</strong> ${event.date}</p>
        ${linkHTML}
        ${fileListHTML}
      </div>
    `;
  });
  
  document.getElementById('eventDetailsContent').innerHTML = eventsHTML;
  document.getElementById('eventDetailsModal').classList.add('active');
}

// Add File Viewer Modal to HTML
function addFileViewerModalToHTML() {
  if (!document.getElementById('fileViewerModal')) {
    const modalHTML = `
      <div class="modal" id="fileViewerModal">
        <div class="modal-content">
          <h3 id="fileViewerTitle">File Viewer</h3>
          <div id="fileViewerContent">
            <!-- File content will be loaded here -->
          </div>
          <div class="modal-buttons">
            <button type="button" class="btn-secondary" onclick="closeFileViewerModal()">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
}

// Function to close file viewer modal
function closeFileViewerModal() {
  document.getElementById('fileViewerModal').classList.remove('active');
}

// ========== EVENT FORM HANDLING ==========
// Update the event form submission to handle links
document.addEventListener('DOMContentLoaded', function() {
  const eventForm = document.getElementById("eventForm");
  if (eventForm) {
    eventForm.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const title = document.getElementById("eventTitle").value;
      const description = document.getElementById("eventDescription").value;
      const date = document.getElementById("eventDate").value;
      const type = document.getElementById("eventType").value;
      const eventLinkInput = document.getElementById("eventLink");
      const eventLink = eventLinkInput ? eventLinkInput.value : '';
      
      const events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
      
      // Create file URLs for uploaded files
      const filesWithUrls = uploadedFiles.map(file => {
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file.file)
        };
      });
      
      events.push({
        title,
        description,
        date,
        type,
        link: eventLink,
        files: filesWithUrls
      });
      
      localStorage.setItem('calendarEvents', JSON.stringify(events));
      
      // Reset form and close modal
      document.getElementById("eventForm").reset();
      closeAddEventModal();
      
      // Refresh calendar
      if (typeof generateCalendar === 'function') {
        generateCalendar();
      }
      
      alert("Assignment added successfully!");
    });
  }
  
  // Add link input field to the add event modal
  function addLinkFieldToEventForm() {
    const fileUploadSection = document.querySelector('.file-upload');
    
    const linkFieldHTML = `
      <div class="form-group" style="margin-top: 20px;">
        <label for="eventLink">Assignment Link (Optional)</label>
        <input type="url" id="eventLink" placeholder="https://example.com/assignment">
        <small>Paste a link to Google Drive, Dropbox, or any online resource</small>
      </div>
    `;
    
    if (!document.getElementById('eventLink') && fileUploadSection) {
      fileUploadSection.insertAdjacentHTML('beforebegin', linkFieldHTML);
    }
  }
  
  // Initialize file viewer modal
  addFileViewerModalToHTML();
});

// ========== HELPER FUNCTIONS ==========
function getFileType(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  if (extension === 'pdf') return 'pdf';
  if (extension === 'doc' || extension === 'docx') return 'doc';
  if (extension === 'wps') return 'wps';
  if (extension === 'txt') return 'txt';
  return 'other';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ========== UI UPDATE FUNCTIONS ==========
function updateUIForLoggedInUser(user) {
  // Update UI elements for logged in user
  const authButtons = document.getElementById('authButtons');
  const getStartedBtn = document.getElementById('getStartedBtn');
  
  if (authButtons) authButtons.style.display = 'none';
  if (getStartedBtn) getStartedBtn.style.display = 'none';
  
  // Update user info in dashboard if available
  if (window.location.pathname.includes('dashboard.html')) {
    const userNameElements = document.querySelectorAll('.user-name, .profile-name');
    const userEmailElements = document.querySelectorAll('.user-email, .profile-email');
    
    userNameElements.forEach(el => {
      if (user.displayName) el.textContent = user.displayName;
    });
    
    userEmailElements.forEach(el => {
      if (user.email) el.textContent = user.email;
    });
  }
}

function updateUIForLoggedOutUser() {
  // Update UI elements for logged out user
  const authButtons = document.getElementById('authButtons');
  const getStartedBtn = document.getElementById('getStartedBtn');
  
  if (authButtons) authButtons.style.display = 'none';
  if (getStartedBtn) getStartedBtn.style.display = 'inline-block';
}

// ========== INITIALIZATION ==========
// Main initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log('AcadEase script loaded');
  
  // Check login status
  if (localStorage.getItem('isLoggedIn') === 'true') {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      updateUIForLoggedInUser(currentUser);
    }
  }
  
  // Check for recent registration
  const recentRegistration = localStorage.getItem('recentRegistration');
  const registeredEmail = localStorage.getItem('registeredEmail');
  
  if (recentRegistration === 'true' && registeredEmail) {
    console.log('Recent registration detected for:', registeredEmail);
  }
});

// Test function for login
function testLogin(email, password) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    console.log('Login test PASSED for:', email);
    return true;
  } else {
    console.log('Login test FAILED for:', email);
    return false;
  }
}

// Make functions available globally
window.viewFileInModal = viewFileInModal;
window.viewFileInText = viewFileInText;
window.copyToClipboard = copyToClipboard;
window.downloadFile = downloadFile;
window.closeFileViewerModal = closeFileViewerModal;
window.testLogin = testLogin;