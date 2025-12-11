/* Name: Alexis Detorres
  Date created: 11/19/2025
  Date last edited: 12/6/2025
  Version: 2.8 
  Description: JS 4 form for Alixia Medical
*/


// 'input' and 'blur' event 
function setupValidations() {
  const fields = [
    { id: 'firstname', pattern: /^[A-Za-z'-]{1,30}$/, error: 'Only letters, apostrophes, dashes' },
    { id: 'middleinitial', pattern: /^[A-Za-z]?$/, error: 'One letter only (or blank)' },
    { id: 'lastname', pattern: /^[A-Za-z'-]{1,30}$/, error: 'Only letters, apostrophes, dashes' },
    { id: 'dob', custom: validateDOB },
    { id: 'ssn', pattern: /^\d{3}-\d{2}-\d{4}$/, error: 'Format: 123-45-6789' },
    { id: 'addr1', pattern: /^.{2,30}$/, error: 'Min 2 characters' },
    { id: 'city', pattern: /^[A-Za-z .'-]{1,40}$/, error: 'Letters/spaces/.- only' },
    { id: 'zip', pattern: /^\d{5}(-\d{4})?$/, error: 'ZIP format: 12345 or 12345-6789' },
    { id: 'tel', pattern: /^\d{3}-\d{3}-\d{4}$/, error: 'Phone: 123-456-7890' },
    { id: 'email', pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,20}$/i, error: 'Invalid email' },
    { id: 'userid', pattern: /^[a-z][a-z0-9_-]{4,29}$/, error: 'Start w/ letter, 5–30 chars' },
    { id: 'passid', custom: validatePassword },
    { id: 'confirmpass', custom: validateConfirmPassword }
  ];

  fields.forEach(({ id, pattern, error, custom }) => {
    const input = document.getElementById(id);
    const errorSpan = document.getElementById(id + '-error');
    if (!input || !errorSpan) return;

    const validate = () => {
      const val = input.value.trim();
      let valid = true;

      if (custom) {
        valid = custom(input, errorSpan);
      } else if (val === '') {
        // Clear error if empty
        errorSpan.textContent = '';
        input.classList.remove('invalid');
        return;
      } else {
        valid = pattern.test(val);
        errorSpan.textContent = valid ? '' : error;
      }

      input.classList.toggle('invalid', !valid);
    };

    input.addEventListener('input', validate);
    input.addEventListener('blur', validate);
  });
}

// Custom check for Date of Birth
function validateDOB(input, errorEl) {
  if (!input.value) {
    errorEl.textContent = 'Date of birth is required';
    return false;
  }
  const dob = new Date(input.value + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = new Date(today);
  min.setFullYear(today.getFullYear() - 120);

  if (dob > today) {
    errorEl.textContent = 'Date cannot be in the future';
    return false;
  }
  if (dob < min) {
    errorEl.textContent = 'Date too far in the past';
    return false;
  }

  errorEl.textContent = '';
  return true;
}

// Custom check for Password: enforces: (chars, numbers, special) checks against UserID.
function validatePassword(input, errorEl) {
  const pass = input.value;
  const uid = (document.getElementById('userid')?.value || '').toLowerCase();
  let errors = [];

  if (pass.length < 8) errors.push('• Min 8 chars');
  if (!/[a-z]/.test(pass)) errors.push('• Missing lowercase');
  if (!/[A-Z]/.test(pass)) errors.push('• Missing uppercase');
  if (!/[0-9]/.test(pass)) errors.push('• Missing number');
  if (!/[!@#$%^&*()_\-\\/+.,~<>]/.test(pass)) errors.push('• Missing special char');  if (/"/.test(pass)) errors.push('• No double quotes');
  if (uid && pass.toLowerCase().includes(uid)) errors.push('• Cannot contain UserID');

  errorEl.textContent = errors.join('\n');
  return errors.length === 0;
}

// Custom check for Confirm Password: two password fields match.
function validateConfirmPassword(input, errorEl) {
  const pass = document.getElementById('passid')?.value;
  const confirm = input.value;
  const valid = pass === confirm;
  errorEl.textContent = valid ? '' : 'Passwords do not match';
  return valid;
}

// Final validity check used for the Submit and Validate buttons.
function isFormValid() {
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.dispatchEvent(new Event('blur'));
  });
  const invalidElements = document.querySelectorAll('.invalid');
  return invalidElements.length === 0;
}

/* Helper Functions */

// get an element by ID
function $(id) { return document.getElementById(id); }

// Returns the trimmed value of a field
function val(id) {
  const el = $(id);
  return el ? el.value.trim() : '';
}

// Gets the value of a checked radio button
function radioVal(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : '';
}

// Gets an array of checked checkbox values
function checksVal(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(x => x.value);
}

// Displays the floating alert box with a message
function showAlert(message) {
  const alertBox = $('alert-box');
  const closeAlert = $('close-alert');
  if (!alertBox || !closeAlert) return;
  if (message) {
    const msgEl = alertBox.querySelector('h4');
    if (msgEl) msgEl.textContent = message;
  }
  alertBox.style.display = 'flex';
  closeAlert.onclick = function () { alertBox.style.display = 'none'; };
  alertBox.addEventListener('click', (e) => {
    if (e.target === alertBox) alertBox.style.display = 'none';
  }, { once: true });
}

// Hides the floating alert box
function hideAlert() {
  const alertBox = $('alert-box');
  if (alertBox) alertBox.style.display = 'none';
}

// Gathers all form data and dynamically generates the HTML table for the review panel.
function reviewInput() {
  const out = document.getElementById('reviewArea');
  if (!out) return;

  const illnesses = checksVal('illness').join(', ') || 'None';
  const vaccinated = radioVal('vaccinated') || '—';
  const insurance = radioVal('insurance') || '—';
  const symptoms = (document.getElementById('symptoms')?.value || '').trim() || '—';
  const maskSSN = (s) => s.replace(/^(\d{3})-(\d{2})-(\d{4})$/, '***-**-$3');

  // Helper to format the range value as currency (200,000 to 500,000)
  const formatSalary = (val) => {
    if (!val) return '—';
    // Range is stored in thousands, multiply by 1000
    const salary = parseInt(val) * 1000;
    return `$${salary.toLocaleString('en-US')}`;
  };

  const rows = [
    ['First, MI, Last Name', `${val('firstname')} ${val('middleinitial')} ${val('lastname')}`.replace(/\s+/g,' ').trim()],
    ['Date of Birth', val('dob')],
    ['Email address', val('email')],
    ['Phone number', val('tel')],
    ['Address', `${val('addr1')} ${val('addr2')}`.replace(/\s+/g,' ').trim()],
    ['City/State/ZIP', `${val('city')}, ${val('state')} ${val('zip')}`.replace(/,\s*,/g, ',').trim()],
    ['Illnesses', illnesses],
    ['Vaccinated?', vaccinated],
    ['Insurance?', insurance],
    ['Annual Income', formatSalary(val('range'))], 
    ['Described Symptoms', symptoms],
    ['User ID', val('userid')],
    ['Password', '•••••••'],
    ['SSN', maskSSN(val('ssn') || '')],
  ];

  out.innerHTML = `
    <table class="output">
      <tr><td class="outputdata" colspan="2" style="text-align:center;"><strong>PLEASE REVIEW THIS INFORMATION</strong></td></tr>
      ${rows.map(([k,v]) => `
        <tr class="output">
          <td class="outputdata" style="width:60%;">${k}</td>
          <td class="outputdata">${v || '—'}</td>
        </tr>`).join('')}
    </table>`;
}

/* JSON/Fetch Code */

// fetches the list of states from 'states.html' and populates the state dropdown menu.
async function loadStates() {
   try {
       const response = await fetch('states.html');
       if (!response.ok) throw new Error('Network response was not ok');
       const text = await response.text();
       const states = text.split('\n');
       const stateSelect = document.getElementById('stateList');
       stateSelect.innerHTML = '<option value="" disabled selected>Select a state</option>';
       states.forEach(state => {
           const option = document.createElement('option');
           option.value = state.trim();
           option.textContent = state.trim();
           stateSelect.appendChild(option);
       });
   } catch (error) {
       console.error('Error loading states:', error);
   }
}
/* End JSON Code */

/*  Cookie Functions  */

// Standard function to set a cookie with an expiry date.
function setCookie(name, cvalue, expiryDays) {
  var day = new Date();
  day.setTime(day.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + day.toUTCString();
  document.cookie = name + "=" + encodeURIComponent(cvalue) + ";" + expires + ";path=/";
}

// Standard function to retrieve a cookie's value by name.
function getCookie(name) {
  var cookieName = name + "=";
  var cookies = document.cookie.split(';');
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return decodeURIComponent(cookie.substring(cookieName.length));
    }
  }
  return "";
}

// Wipes all cookies set by this site.
function deleteAllCookies() {
    document.cookie.split(";").forEach(function (cookie) {
        let eqPos = cookie.indexOf("=");
        let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    });
}

// List of fields saved via Cookies (User ID, Name parts, Contact, Income)
const cookieFields = [
  { id: "userid", cookieName: "userid" },
  { id: "firstname", cookieName: "firstName" },
  { id: "middleinitial", cookieName: "middleInitial" }, // Added
  { id: "lastname", cookieName: "lastName" },         // Added
  { id: "email", cookieName: "email" },
  { id: "tel", cookieName: "phone" },
  { id: "range", cookieName: "incomeRange" },
];

// List of fields saved via localStorage (Address 2, Emergency Data, etc.)
const localFields = [
  "addr2", "city", "zip", "symptoms", 
  "relationship", "emergencyName", "emgemail", "emgphone"
];


/**
 * Updates the welcome message based on the 'firstName' value (prioritizing the live form input) 
 * and 'Remember Me' checkbox state.
 */
function loadWelcomeMessage() {
    const firstNameInput = document.getElementById("firstname");
    const rememberMeCheckbox = document.getElementById("remember-me");
    const welcomeContainer = document.getElementById("welcomeContainer");
    
    if (!welcomeContainer) return;
    
    //  Get the current displayed name: use live input value
    let currentName = "";
    if (firstNameInput && firstNameInput.value.trim() !== "") {
        currentName = firstNameInput.value.trim(); // Live input value
    } else {
        currentName = getCookie("firstName"); // Saved cookie value
    }

    // Determine display state (checked and has a name)
    const displayWelcomeBack = currentName !== "" && rememberMeCheckbox?.checked;

    if (displayWelcomeBack) {
        welcomeContainer.innerHTML = `
            <h3>Welcome back, ${currentName}!</h3>
            <p><a href='#' id='new-user'>Not ${currentName}? Click here to start a new form.</a></p>
        `;
        // Attach the click handler for the 'Not Name?' link
        const newUserBtn = document.getElementById("new-user");
        newUserBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            deleteAllCookies();
            localStorage.clear(); // Clear local storage on 'Not Name?' click
            location.reload();
        });
    } else {
        // Display the default "Welcome New User!" message
        welcomeContainer.innerHTML = '<h3>Welcome New User!</h3><p>Please fill out the form below to get started.</p>';
    }
}


/* --- Unified DOMContentLoaded Event --- */

// runs inside this single block once the page is loaded.
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Setup
  setupValidations(); 
  loadStates();

  const now = new Date();
  const todayEl = document.getElementById('today');
  if (todayEl) todayEl.textContent = now.toLocaleDateString();

  const dobEl = document.getElementById('dob');
  if (dobEl) {
    const min = new Date(now);
    min.setFullYear(min.getFullYear() - 120);
    const maxISO = now.toISOString().slice(0, 10);
    dobEl.setAttribute('max', maxISO);
    dobEl.setAttribute('min', min.toISOString().slice(0, 10));
  }

  const rng = document.getElementById('range');
  const rngOut = document.getElementById('range-slider');
  
  // Helper to format the range value as currency
  const formatSliderOutput = (val) => {
      const salary = parseInt(val) * 1000;
      return `$${salary.toLocaleString('en-US')}`;
  };
  
  if (rng && rngOut) {
    rng.setAttribute('min', 200); 
    rng.setAttribute('max', 500); 
    rng.setAttribute('value', 350); 
    
    const update = () => { rngOut.textContent = formatSliderOutput(rng.value); };
    rng.addEventListener('input', update);
    rng.addEventListener('change', update);
    update();
  }


  // 2. Data Persistence Load and Event Handlers
  const rememberMeCheckbox = document.getElementById("remember-me");
  let hasSavedData = getCookie("firstName") !== "";

  // Set default state of checkbox based on cookie presence
  if (rememberMeCheckbox) {
      rememberMeCheckbox.checked = hasSavedData;
  }
  
  // Load data from Cookies and set up input listeners
  cookieFields.forEach(function (input) {
    var inputElement = document.getElementById(input.id);
    if (!inputElement) return;

    var cookieValue = getCookie(input.cookieName);
    // Only load cookie value if the Remember Me box is checked
    if (cookieValue !== "" && rememberMeCheckbox?.checked) {
      inputElement.value = cookieValue;
      if (input.id === 'range') {
          // Trigger the display update for the slider
          inputElement.dispatchEvent(new Event('change'));
      }
    }

    // Sets up listeners to save data as the user types, but only if Remember Me is checked.
    inputElement.addEventListener("input", function () {
        if (rememberMeCheckbox?.checked) {
            setCookie(input.cookieName, inputElement.value, 30);
        }
        
        // Welcome Message instantly when any name field changes
        if (input.id === "firstname" || input.id === "middleinitial" || input.id === "lastname") {
            loadWelcomeMessage();
        }
    });
  });

  // Load and save data from localStorage
  localFields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    
    // Load from localStorage if "remember me" is checked
    if (localStorage.getItem(id) && rememberMeCheckbox?.checked) {
        el.value = localStorage.getItem(id);
    }
    
    // Save to localStorage on input change
    el.addEventListener("input", () => {
        if (rememberMeCheckbox?.checked) {
            localStorage.setItem(id, el.value);
        }
    });
  });

  // Handles the 'Remember Me' checkbox functionality: deleting cookies/local storage if unchecked.
  if (rememberMeCheckbox) {
    rememberMeCheckbox.addEventListener("change", function () {
      if (!this.checked) {
        // If unchecked, delete cookies and clear local storage
        deleteAllCookies();
        localFields.forEach(id => localStorage.removeItem(id)); // Clear local storage
      } else {
        // If checked, save current form data (cookies and local storage)
        cookieFields.forEach(function (input) {
          const el = document.getElementById(input.id);
          if (el && el.value.trim() !== "") {
            setCookie(input.cookieName, el.value, 30);
          }
        });
        localFields.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.value.trim() !== "") {
                localStorage.setItem(id, el.value);
            }
        });
      }
      // Update welcome message state instantly
      loadWelcomeMessage();
    });
  }

  // 3. Button/Form Event Listeners
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      const browserOK = form.checkValidity();
      const customOK = isFormValid();
      if (!browserOK || !customOK) {
        e.preventDefault();
        showAlert('Please fix the errors highlighted in red before submitting.');
      }
    });
  }

  const validateBtn = document.getElementById('validate');
  if (validateBtn) {
    validateBtn.addEventListener('click', () => {
      if (isFormValid()) {
        hideAlert();
        alert("Everything looks good!");
      } else {
        showAlert('Please fix the errors highlighted in red.');
      }
    });
  }

  const reviewBtn = document.getElementById('review');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', reviewInput);
  }

  // 4. Load Welcome Message
  loadWelcomeMessage();
});