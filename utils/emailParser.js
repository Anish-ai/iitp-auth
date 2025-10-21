/**
 * Email Parser for IIT Patna Email Addresses
 * Extracts student information from IITP email format
 */

// Branch codes mapping
const BRANCH_CODES = {
  'cs': 'Computer Science',
  'mc': 'Mathematics & Computing',
  'ee': 'Electrical Engineering',
  'ec': 'Electronics and Communication Engineering',
  'me': 'Mechanical Engineering',
  'ce': 'Civil Engineering',
  'ch': 'Chemical Engineering',
  'mm': 'Metallurgical and Materials Engineering',
  'ai': 'Artificial Intelligence',
  'ds': 'Data Science',
};

// Degree codes mapping
const DEGREE_CODES = {
  '01': 'B.Tech',
  '02': 'B.Tech + M.Tech (Dual Degree)',
  '03': 'M.Tech',
  '04': 'M.Sc',
  '05': 'MBA',
  '06': 'PhD',
};

/**
 * Validate if email is from IIT Patna domain
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is from @iitp.ac.in
 */
function isValidIITPEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._-]+@iitp\.ac\.in$/i;
  return emailRegex.test(email);
}

/**
 * Extract student information from IITP email
 * Format: name_rollnumber@iitp.ac.in
 * Roll number format: YYDDBBXX (YY=year, DD=degree, BB=branch, XX=serial)
 * 
 * @param {string} email - IITP email address
 * @returns {Object} Extracted student information
 */
function extractStudentInfo(email) {
  if (!isValidIITPEmail(email)) {
    return {
      valid: false,
      error: 'Invalid IIT Patna email format',
    };
  }

  try {
    // Extract local part (before @)
    const localPart = email.split('@')[0];
    
    // Split by underscore
    const parts = localPart.split('_');
    
    if (parts.length < 2) {
      return {
        valid: false,
        error: 'Email format does not match expected pattern (name_rollnumber)',
      };
    }

    // Extract name (everything before the last underscore)
    const name = parts.slice(0, -1).join('_');
    
    // Extract roll number (last part after underscore)
    const rollNumber = parts[parts.length - 1];

    // Validate roll number format: YYDDBBXX
    // YY = 2 digits (year), DD = 2 digits (degree), BB = 2 letters (branch), XX = optional digits (serial)
    // Examples: 2301mc40, 2202cs15, 2301ee01
    if (!/^\d{4}[a-z]{2}\d*$/i.test(rollNumber)) {
      return {
        valid: false,
        error: 'Roll number format is invalid. Expected format: YYDDBBXX (e.g., 2301mc40)',
      };
    }

    // Parse roll number components
    const year = rollNumber.substring(0, 2);
    const degreeCode = rollNumber.substring(2, 4);
    
    // Find branch code (2 letters after degree code)
    const branchCode = rollNumber.substring(4, 6).toLowerCase();
    
    // Serial number (remaining digits after branch code)
    const serialNumber = rollNumber.substring(6);

    // Calculate admission year
    const admissionYear = 2000 + parseInt(year);

    // Get branch name
    const branch = BRANCH_CODES[branchCode] || `Unknown Branch (${branchCode})`;

    // Get degree name
    const degree = DEGREE_CODES[degreeCode] || `Unknown Degree (${degreeCode})`;

    return {
      valid: true,
      email: email.toLowerCase(),
      name: name,
      rollNumber: rollNumber,
      admissionYear: admissionYear,
      degree: degree,
      degreeCode: degreeCode,
      branch: branch,
      branchCode: branchCode,
      serialNumber: serialNumber || 'N/A',
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to parse email: ' + error.message,
    };
  }
}

/**
 * Format student info for display
 * @param {Object} info - Student information object
 * @returns {string} Formatted string
 */
function formatStudentInfo(info) {
  if (!info.valid) {
    return `Error: ${info.error}`;
  }

  return `
Name: ${info.name}
Roll Number: ${info.rollNumber}
Email: ${info.email}
Admission Year: ${info.admissionYear}
Degree: ${info.degree}
Branch: ${info.branch}
  `.trim();
}

module.exports = {
  isValidIITPEmail,
  extractStudentInfo,
  formatStudentInfo,
  BRANCH_CODES,
  DEGREE_CODES,
};
