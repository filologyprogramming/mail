document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Send e-mail when submit button in compose view is clicked
  document.querySelector("#submit").addEventListener("click", send_email);

// The way two functions below work is that 

  // Open an e-mail when it is clicked
  parent = document.querySelector("#emails-view");
  parent.addEventListener("click", function(e) {
    if (e.target.closest(".link")) {
      show_email(e.target.closest(".link").id);
    }
  })

  // Archive an email when a button is clicked
  parent = document.querySelector("#emails-view");
  parent.addEventListener("submit", function(f) {
    if (f.target.closest("form")) {
      archiving(f.target.closest("form").id);
    }
  })

  parent = document.querySelector("#single-email-view");
  parent.addEventListener("click", function(g) {
    if (g.target.closest(".reply_button")) {
      reply(g.target.closest(".reply_button").id);
    }
  })

});

// Compose email
function compose_email() {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// Send an e-mail
function send_email() {

  // Sent email functionality
    // Find the form
    let form = document.querySelector("#compose-form");
      // Block submit
      form.addEventListener("submit", function(e) {
        e.preventDefault();
      })
  
      // Extract data to be sent
      mail_subject = document.querySelector("#compose-subject").value;
      mail_recipients = document.querySelector("#compose-recipients").value;
      mail_body = document.querySelector("#compose-body").value;
  
      // Send data via POST to /emails
      fetch(`/emails`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        // Put reciepients, subject and body in body
        body: JSON.stringify({
          subject: mail_subject,
          recipients: mail_recipients,
          body: mail_body
        }),
      })
      // If everything goes well, load user's inbox
      .then(response => response.json())
      .then(data => {
        console.log(data);
        load_mailbox('sent');
      })
      .catch(error => console.error('Error:', error));
}

// Load a mailbox
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#single-email-view").style.display = "none";

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Save the mailbox name
  mailbox_name = document.querySelector('#emails-view').innerHTML;
  mailbox = mailbox.toLowerCase();

  // Try to get emails from specific inbox
  fetch (`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      for (let i = 0; i < emails.length; i++) {
        // Create variables to store data
        let sender = emails[i].sender;
        let subject = emails[i].subject;
        let timestamp = emails[i].timestamp;
        let id = emails[i].id;
        let if_read = emails[i].read;

        // Choose parent element for all emails:
        emails_view = document.querySelector("#emails-view");

        // Create container
        container = document.createElement("div");
        emails_view.appendChild(container);
        container.className = mailbox;
        
        // Create link
        link = document.createElement("a");
        container.appendChild(link);
        // Set href to empty so it doesn't redirect
        link.setAttribute("href", "");
        // Set ID which is later passed to a function which retrieves the content of an e-mail
        link.setAttribute("id", id);
        link.className = "link";
        link.addEventListener('click', function(e) {
          e.preventDefault();
        });

        // Create row
        row = document.createElement("div");
        // Styling differes depending on email being read/not_read
        if (if_read === true) {
          row.className = "row read";
        }
        else {
          row.className = "row not_read";
        }
        link.appendChild(row);

        // Create column for sender
        sender_column = document.createElement("div");
        sender_column.className = "col-1 sender_column";
        row.appendChild(sender_column);

        // Create column for subject
        subject_column = document.createElement("div");
        subject_column.className = "col-4 subject_column";
        row.appendChild(subject_column);

        // Create column for timestamp
        timestamp_column = document.createElement("div");
        timestamp_column.className = "col-4 timestamp_column";
        row.appendChild(timestamp_column);
        
        // Sender column
        sender_field = document.createElement("p");
        sender_field.className = "sender";
        sender_column.appendChild(sender_field);

        // Subject column
        subject_field = document.createElement("p");
        subject_field.className = "subject";
        subject_column.appendChild(subject_field);

        // Create elements for e-mail content and append them
        timestamp_field = document.createElement("p");
        timestamp_field.className = "timestamp";
        timestamp_column.appendChild(timestamp_field);
        
        // Plug e-mail elements with data
        subject_field.textContent = subject;
        sender_field.textContent = sender;
        timestamp_field.textContent = timestamp;

        // Form for archiving
        archive_form = document.createElement("form");
        archive_form.setAttribute("action", "");
        archive_form.setAttribute("method", "POST");
        archive_form.setAttribute("id", id);
        archive_form.className = "archive_form";
        container.appendChild(archive_form);
        // Block submission of Archive/Unarchive form by default
        archive_form.addEventListener("submit", function(e) {
          e.preventDefault();
        })

        // Depending on mailbox, change content of archive/unarchive button
        if (mailbox === "inbox" || mailbox === "archive") {
          // Button for archiving
          archive_button = document.createElement("input");
          archive_button.setAttribute("type", "submit");
          if (emails[i].archived === false) {
            archive_button.setAttribute("value", "Archive");
          }
          else {
            archive_button.setAttribute("value", "Unarchive");
          }
          archive_form.appendChild(archive_button);
        }
      }
    })
    // Catch an error
    .catch(error => console.error('Error:', error));
}

// Show a single e-mail
function show_email(id) {
  
  // Stop showing all emails
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#single-email-view").style.display = 'block';

  // Get data about e-mail
  fetch (`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    // Get sender
    email_sender = email.sender;
    // Get recipients
    email_recipient = email.recipients;
    // Get subject
    email_subject = email.subject;
    // Get timestamp
    email_timestamp = email.timestamp;
    // Get body
    email_body = email.body;

    // Choose parent element
    parent = document.querySelector("#single-email-view");

    // If previous email is in DOM, clean it to make space for a new one
    while (parent.lastElementChild) {
      parent.removeChild(parent.lastElementChild);
    }

    // Create HTML elements
    // Header
    header = document.createElement("div");
    header.className = "header";
    parent.appendChild(header);
    
    // Create field for subject, append and populate
    subject_field = document.createElement("h2");
    subject_field.className = "subject";
    header.appendChild(subject_field);
    subject_field.textContent = email_subject;
 
    // Create field for sender/reciepient, timestamp append and populate
    sender_field = document.createElement("p");
    sender_field.className = "people";
    header.appendChild(sender_field);
    sender_field.textContent = `From: ${email_sender}`;
    
    recipient_field = document.createElement("p");
    recipient_field.className = "people";
    header.appendChild(recipient_field);
    recipient_field.textContent = `To: ${email_recipient}`;

    timestamp_field = document.createElement("span");
    timestamp_field.className = "email_timestamp";
    header.appendChild(timestamp_field);
    timestamp_field.textContent = `Sent: ${email_timestamp}`;

    // Line to seperate header and body
    hr = document.createElement("hr");
    header.appendChild(hr);

    // Body of the email
    body = document.createElement("div");
    parent.appendChild(body);
    body_field = document.createElement("p");
    body.appendChild(body_field);
    body_field.textContent = email_body;

    // Reply button
    reply_button = document.createElement("input");
    reply_button.setAttribute("type", "button");
    reply_button.setAttribute("value", "Reply");
    reply_button.setAttribute("id", id);
    reply_button.className = "reply_button";
    parent.appendChild(reply_button);

  // Mark the clicked e-mail as read
    mark_read(id);
  })
  // Catch an error
  .catch(error => console.error('Error:', error));

}

// Mark e-mail as read
function mark_read(id) {
  // Send the email to server
  fetch (`/emails/${id}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({read: "True"})
  })

  .then(response => {
    // Check if the range of the response from server is between 200-299
    if(response.ok) {
      console.log("Update successful");
      // No return response.json() here beacsue the server returns only 204
    }
    else {
      throw Error ("Can't mark an item as read")
    }
  })
  .catch(error => console.error('Error:', error));
}

// Checks if e-mail if archived or not, then archives or unarchives
function archiving(id) {
  // Get status of archivization of an e-mail
  fetch (`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    let if_archived = email.archived;
    // Flip true -> false or false -> true
    let new_status = !if_archived;
    // Update an email with the new status
    fetch (`/emails/${id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({archived: new_status})
    })
    // Load Inbox
    load_mailbox('inbox');
  })
  .catch(error => console.error('Error:', error));
}

function reply(id) {

  // Show compose view
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector("#single-email-view").style.display = 'none';

  // Get data about the e-mail
  // Get data about e-mail
  fetch (`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
 
    // Get sender
    email_sender = email.sender;
    // Get recipients
    email_recipient = email.recipients;
    // Get subject
    email_subject = email.subject;
    // Get timestamp
    email_timestamp = email.timestamp;
    // Get body
    email_body = email.body;

    document.querySelector("#compose-recipients").value = email_sender;
    document.querySelector("#compose-subject").value = `Re: ${email_subject}`;
    document.querySelector("#compose-body").value = `On ${email_timestamp} ${email_sender} wrote:\n${email_body}`;
  })
   .catch(error => console.error('Error:', error));
}