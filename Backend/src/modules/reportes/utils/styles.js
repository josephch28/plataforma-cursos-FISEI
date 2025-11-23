const colors = {
  primary: '#003366',
  secondary: '#0066cc',
  accent: '#FFD700',
  text: '#333333',
  lightGray: '#f5f5f5',
  white: '#ffffff'
};

const fonts = {
  title: { fontSize: 28, bold: true, color: colors.primary },
  subtitle: { fontSize: 18, bold: true, color: colors.secondary },
  header: { fontSize: 16, bold: true, color: colors.white },
  body: { fontSize: 12, color: colors.text },
  small: { fontSize: 10, color: colors.text }
};

const tableStyles = {
  headerFillColor: colors.primary,
  evenRowFillColor: colors.lightGray,
  oddRowFillColor: colors.white
};

module.exports = {
  colors,
  fonts,
  tableStyles
};

