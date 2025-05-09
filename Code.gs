var DOCUMENT_ID = 'GOOGLE DOC ID GOES HERE';
var PASSWORDS = {}; // To be dynamically populated from GitHub
var docVisible = true;
var CONSTANT_PASSWORD = 'P@$$w0rd'; // The constant password for change password functionality

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index');
}

function appendToDoc(text, userName) {
  var doc = DocumentApp.openById(DOCUMENT_ID);
  var body = doc.getBody();
  var fullText = userName + ": " + text;
  body.appendParagraph(fullText);
}

function getDocContent() {
  if (docVisible) {
    var doc = DocumentApp.openById(DOCUMENT_ID);
    var body = doc.getBody();
    var text = body.getText();
    return text;
  } else {
    return "Document is hidden.";
  }
}

function checkPassword(inputPassword) {
  if (Object.keys(PASSWORDS).length === 0) {
    fetchPasswords(); // Ensure passwords are loaded before checking
  }
  return PASSWORDS[inputPassword] || null;
}

function toggleDocVisibility() {
  docVisible = !docVisible;
  return docVisible;
}

// Fetch passwords from GitHub repository
function fetchPasswords() {
  var url = "https://raw.githubusercontent.com/ComikuGaming/PAssword-Manager/main/passwords.json"; // Correct raw URL
  var response = UrlFetchApp.fetch(url);
  var data = JSON.parse(response.getContentText());
  PASSWORDS = data;
}

// Function to validate the constant password
function validateConstantPassword(inputPassword) {
  return inputPassword === CONSTANT_PASSWORD; // Check against the constant password
}

// Function to update the password in GitHub
function updatePassword(oldPassword, newPassword) {
  if (Object.keys(PASSWORDS).length === 0) {
    fetchPasswords(); // Fetch passwords before updating
  }

  // Ensure you are replacing the old key with a new key
  if (PASSWORDS.hasOwnProperty(oldPassword)) {
    PASSWORDS[newPassword] = PASSWORDS[oldPassword]; // Copy value to new key
    delete PASSWORDS[oldPassword]; // Delete the old key

    // Prepare data to update GitHub file
    var url = "REPO API URL GOES HERE"; // Correct API URL
    var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
    var base64Content = Utilities.base64EncodeWebSafe(JSON.stringify(PASSWORDS));

    try {
      // Get the current file SHA to update it
      var sha = getFileSha();

      if (sha) {
        // Prepare the PUT request payload
        var payload = {
          message: 'Updated passwords', // Update commit message
          content: base64Content, // Base64 encoded updated content
          sha: sha // File SHA to identify which version to update
        };

        var options = {
          method: "put",
          headers: {
            Authorization: "token " + token
          },
          payload: JSON.stringify(payload) // Ensure payload is JSON string
        };

        var response = UrlFetchApp.fetch(url, options);
        alert("GitHub API Response: " + response.getContentText()); // Log the response from GitHub
      } else {
        Logger.log("Error: SHA not found.");
      }
    } catch (e) {
      Logger.log("Error updating password: " + e.message);
    }
  } else {
    Logger.log("Old password not found.");
  }
}

// Get the SHA of the file in GitHub
function getFileSha() {
  var url = "REPO API URL GOES HERE";
  var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  
  var options = {
    method: "get",
    headers: {
      Authorization: "token " + token
    }
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var fileData = JSON.parse(response.getContentText());
    return fileData.sha; // Return the file SHA to update
  } catch (e) {
    Logger.log("Error getting file SHA: " + e.message);
    return null;
  }
}
