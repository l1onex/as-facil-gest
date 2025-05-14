
// Format currency in BRL
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Format document (CPF or CNPJ)
export const formatDocument = (value: string): string => {
  if (!value) return '';
  
  // Remove non-digits
  const digits = value.replace(/\D/g, '');
  
  // Check if it's CPF or CNPJ
  if (digits.length <= 11) {
    // CPF: 000.000.000-00
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ: 00.000.000/0000-00
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
};

// Format phone number
export const formatPhone = (value: string): string => {
  if (!value) return '';
  
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 10) {
    // (00) 0000-0000
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // (00) 00000-0000
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};

// Format CEP
export const formatCep = (value: string): string => {
  if (!value) return '';
  
  const digits = value.replace(/\D/g, '');
  
  // 00000-000
  return digits
    .replace(/^(\d{5})(\d)/, '$1-$2');
};
