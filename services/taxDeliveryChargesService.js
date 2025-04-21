// services/taxDeliveryService.js
const taxDeliveryChargesRepository = require("../repositories/taxDeliveryChargesRepository");

const addTaxDeliveryCharges = async (tax, deliveryCharge) => {
  return await taxDeliveryChargesRepository.addTaxDeliveryCharges(tax, deliveryCharge);
};

const fetchTaxDeliveryCharges = async () => {
  return await taxDeliveryChargesRepository.fetchTaxDeliveryCharges();
};

const fetchChargesById = async (id) => {
  return await taxDeliveryChargesRepository.getchargesById(id);
};

const updateTaxDeliveryCharges = async (id, tax, deliveryCharge) => {
  return await taxDeliveryChargesRepository.updateTaxDeliveryCharges(
    id,
    tax,
    deliveryCharge
  );
};

const deleteTaxDeliveryCharges = async (id) => {
  return await taxDeliveryChargesRepository.deleteTaxDeliveryCharges(id);
};

module.exports = {
  addTaxDeliveryCharges,
  fetchTaxDeliveryCharges,
  fetchChargesById,
  updateTaxDeliveryCharges,
  deleteTaxDeliveryCharges,
};
