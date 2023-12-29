function processEmailsByDomain() {
  var searchTerms = ["unsubscribe", "zrušiť ich odber", "nastavenia e-mailov", "Odhlásiť z odberu", "Odhlásiť odber"]; // Array of search terms
  var labelName = "Updates"; // The name of the label you want to apply

  // Get the label or create it if it doesn't exist
  var label = GmailApp.getUserLabelByName(labelName);
  if (!label) {
    label = GmailApp.createLabel(labelName);
  }

  var parentLabelName = "Newsletters";
  var parentLabel = GmailApp.getUserLabelByName(parentLabelName);

  // If the parent label doesn't exist, create it
  if (!parentLabel) {
    parentLabel = GmailApp.createLabel(parentLabelName);
  }

  // Loop through each search term
  for (var t = 0; t < searchTerms.length; t++) {
    var searchTerm = searchTerms[t];
    var threads = GmailApp.search("label:inbox " + searchTerm);

    // Check if any threads were found for the current search term
    if (threads.length === 0) {
      Logger.log("No emails containing '" + searchTerm + "' found in the search.");
      continue; // Skip to the next search term if no emails are found
    }

    // Loop through the threads and messages for the current search term
    for (var i = 0; i < threads.length; i++) {
      var thread = threads[i];
      var messages = threads[i].getMessages();

      // Loop through the messages in each thread
      for (var j = 0; j < messages.length; j++) {
        var message = messages[j];
        var body = message.getPlainBody(); // Get the plain text body of the email
        var from = message.getFrom();
        var domain = getDomainFromEmailAddress(from);
        if (domain) {
          Logger.log(domain); // Output: bitget.com
          var parts = domain.split(".");

          // Check if there are at least two parts
          if (parts.length >= 2) {
            var lastTwoParts = parts.slice(-2); // Get the last two parts
            domain = lastTwoParts.join("."); // Join them back together with a period (.)
          } else {
            Logger.log("Invalid domain format");
          }

          // Get or create label based on the domain
          var domainlabel = GmailApp.getUserLabelByName(parentLabelName + "/" + domain);
          if (!domainlabel) {
            domainlabel = GmailApp.createLabel(parentLabelName + "/" + domain);
          }

          // Add the label (category) to the email
          thread.addLabel(label);

          // Add the label to the email based on the domain
          thread.addLabel(domainlabel);

          // Move email to archive
          thread.moveToArchive();

          Logger.log('Processed email from ' + from + ' (Domain: ' + domain + ')');
        } else {
          Logger.log('Invalid email address: ' + from);
        }
      }
    }
  }
}

function getDomainFromEmailAddress(emailAddress) {
  if (emailAddress) {
    var pattern = /"(.*?)@([^"]*?)"/g;
    emailAddress = emailAddress.replace(pattern, '"$1$2"');

    var emailParts = emailAddress.match(/[^<\s@]+@[^>\s]+/);
    if (emailParts && emailParts.length === 1) {
      var emailSplit = emailParts[0].split('@');
      if (emailSplit.length === 2) {
        return emailSplit[1];
      }
    }
  }
  return null; // Invalid email address format
}
