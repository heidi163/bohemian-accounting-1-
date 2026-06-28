/**
 * Helper utility to get the currently active company from local storage.
 * Defaults to "BGK" if not set.
 */
export const getActiveCompany = () => {
  return localStorage.getItem('active_company') || 'BGK';
};

/**
 * Helper utility to generate a company-scoped local storage key.
 * e.g., 'mock_invoices' becomes 'mock_invoices_BGK' or 'mock_invoices_O2N'
 */
export const getCompanyKey = (baseKey: string) => {
  const company = getActiveCompany();
  return `${baseKey}_${company}`;
};
