import validator from 'validator';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const validateRegister = (req, res, next) => {
  const { username, email, phone, password } = req.body;
  const errors = [];

  if (!username || typeof username !== 'string') {
    errors.push('Username is required');
  } else if (username.trim().length < 2) {
    errors.push('Username must be at least 2 characters');
  }

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else if (!validator.isEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!phone || typeof phone !== 'string') {
    errors.push('Phone is required');
  } else {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      errors.push('Invalid phone number');
    }
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.push('Password must be min 8 chars with uppercase, lowercase, and number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  req.body.username = username.trim();
  req.body.email = (validator.normalizeEmail(email.trim()) || email.trim()).toLowerCase();
  req.body.phone = phone.trim();
  next();
};

export const validateLogin = (req, res, next) => {
  const { identifier, password } = req.body;
  const errors = [];

  if (!identifier || typeof identifier !== 'string') {
    errors.push('Email or username is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  req.body.identifier = identifier.trim();
  next();
};
