export const formatGhanaNumber = (phone) => {
  if (phone.startsWith("0")) {
    return "233" + phone.slice(1);
  }
  return phone;
};