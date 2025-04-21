const taxDeliveryChargesService = require("../services/taxDeliveryChargesService");

const addTaxDeliveryCharges = async (req, res) => {
  try {
    const { tax, deliveryCharge } = req.body;

    console.log(req.body);
    const existingCharges = await taxDeliveryChargesService.fetchTaxDeliveryCharges();
    console.log(existingCharges.id);
    if (existingCharges) {
      const updateCharges = await taxDeliveryChargesService.updateTaxDeliveryCharges(
        existingCharges.id,
        tax,
        deliveryCharge
      );
      //console.log("16", updateCharges);
      return res.status(200).json(updateCharges);
    } else {
      const result = await taxDeliveryChargesService.addTaxDeliveryCharges(
        tax,
        deliveryCharge
      );
      return res.status(201).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to add Tax & Delivery charges", error });
  }
};

const fetchTaxDeliveryCharges = async (req, res) => {
  try {
    const charges = await taxDeliveryChargesService.fetchTaxDeliveryCharges();
    res.status(200).json(charges);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch settings", error });
  }
};

const updateTaxDeliveryCharges = async (req, res) => {
  try {
    const { id } = req.params;
    const { tax, deliveryCharge } = req.body;
    const updated = await taxDeliveryChargesService.updateTaxDeliveryCharges(
      id,
      tax,
      deliveryCharge
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

const deleteTaxDeliveryCharges = async (req, res) => {
  try {
    const { id } = req.params;
    await taxDeliveryChargesService.deleteTaxDeliveryCharges(id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error });
  }
};

module.exports = {
  addTaxDeliveryCharges,
  fetchTaxDeliveryCharges,
  updateTaxDeliveryCharges,
  deleteTaxDeliveryCharges,
};
