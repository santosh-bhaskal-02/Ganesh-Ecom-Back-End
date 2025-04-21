// repositories/taxDeliveryRepository.js
const TaxDeliveryCharges = require("../models/model_TaxDeliveryCharges");

const addTaxDeliveryCharges = async (tax, deliveryCharge) => {
  const charges = await new TaxDeliveryCharges({
    taxRate: tax,
    deliveryCharge: deliveryCharge,
  });
  return charges.save();
};

const fetchTaxDeliveryCharges = async () => await TaxDeliveryCharges.findOne();

const getchargesById = async (id) => await TaxDeliveryCharges.findById(id);

const updateTaxDeliveryCharges = async (id, tax, deliveryCharge) =>
  await TaxDeliveryCharges.findByIdAndUpdate(
    id,
    { taxRate: tax, deliveryCharge },
    { new: true }
  );

const deleteTaxDeliveryCharges = async (id) =>
  await TaxDeliveryCharges.findByIdAndDelete(id);

module.exports = {
  addTaxDeliveryCharges,
  getchargesById,
  fetchTaxDeliveryCharges,
  updateTaxDeliveryCharges,
  deleteTaxDeliveryCharges,
};
