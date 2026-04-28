export const formatPhoneNumber = (value) => {
  if (!value) return value;
  
  // If they type a '+', assume it's international and let them type freely
  if (value.startsWith('+')) return value;

  // Strip out everything except numbers
  const digits = value.replace(/\D/g, '');
  
  // If it's longer than 10 digits, just return the raw numbers
  if (digits.length > 10) return digits;

  // Format standard 10-digit US/CA numbers: (XXX) XXX-XXXX
  if (digits.length > 6) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length > 3) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length > 0) return `(${digits}`;
  
  return digits;
};