const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

let successCount = 0;
const MAX_SUCCESS = 5;

setInterval(() => {
  successCount = 0;
}, 60000);

const USER_AGENTS = [
  "Mozilla/5.0 (Linux; Android 13)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3)",
  "Mozilla/5.0 (Linux; Android 12)",
  "Mozilla/5.0 (Linux; Android 11)"
];

function getUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function clean(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) =>
      v !== "" && v !== null && v !== undefined && v !== false
    )
  );
}

function flattenData(d) {
  const data = {
    reg_no: d.rc_number || "",
    full_name: d.owner_name || "",
    father_name: d.father_name || "",
    permanent_address: d.permanent_address || "",
    current_address: d.present_address || "",
    contact: d.mobile_number || "",
    holder_type: d.owner_number || "",

    brand: d.maker_description || "",
    variant: d.variant?.v_variant_name || "",
    model: d.maker_model || "",
    shade: d.color || "",
    manufacturing_month_year: d.manufacturing_date_formatted || "",
    body_type: d.body_type || "",
    fuel_type: d.fuel_type || "",
    emission_norms: d.norms_type || "",
    vehicle_class: d.vehicle_category_description || "",
    vehicle_category: d.vehicle_category || "",

    chassis_number: d.vehicle_chasi_number || "",
    engine_number: d.vehicle_engine_number || "",
    engine_capacity: d.cubic_capacity || "",
    cylinders: d.no_cylinders || "",
    seating_capacity: d.seat_capacity || "",
    wheelbase_mm: d.wheelbase || "",
    gross_vehicle_weight: d.vehicle_gross_weight || "",
    kerb_weight: d.unladen_weight || "",

    insurance_company: d.insurance_company || "",
    insurance_policy_number: d.insurance_policy_number || "",
    insurance_valid_till: d.insurance_upto || "",

    puc_certificate_number: d.pucc_number || "",
    puc_valid_till: d.pucc_upto || "",

    fitness_valid_till: d.fit_up_to || "",
    tax_valid_till: d.tax_upto || "",

    financer_name: d.financer || "",
    blacklisted: d.blacklist_status || "No",
    off_road_status: d.non_use_status || "",

    registration_date: d.registration_date || "",
    registered_at: d.registered_at || "",
    manufacturing_date: d.manufacturing_date_formatted || "",
    year_of_purchase: d.yearofPurchase || "",
    rc_status: d.rc_status || ""
  };

  return clean(data);
}

app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (successCount >= MAX_SUCCESS) {
    return res.send(JSON.stringify({ error: "Rate limit exceeded" }, null, 2));
  }

  const vehicleNumber = (req.query.vehicle_number || req.query.rc_number || "").trim().toUpperCase();

  if (!vehicleNumber) {
    return res.send(JSON.stringify({ error: "Please provide vehicle number" }, null, 2));
  }

  if (!/^[A-Z]{2}/.test(vehicleNumber)) {
    return res.send(JSON.stringify({ error: "Invalid vehicle number" }, null, 2));
  }

  try {
    const response = await axios.post(
      "https://api1.91wheels.com/api/v1/third/rc-detail",
      {
        regNo: vehicleNumber,
        sessionid: `${Date.now()}-${Math.random()}`
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*",
          "Origin": "https://www.91wheels.com",
          "Referer": "https://www.91wheels.com/",
          "User-Agent": getUA()
        },
        timeout: 15000,
        validateStatus: () => true
      }
    );

    if (response.status === 200 && response.data?.data) {
      const finalData = flattenData(response.data.data);

      if (finalData.reg_no && finalData.full_name) {
        successCount++;
        return res.send(JSON.stringify([finalData], null, 2));
      }

      return res.send(JSON.stringify({ error: "Data not found" }, null, 2));
    }

    return res.send(JSON.stringify({ error: "Data not found" }, null, 2));

  } catch {
    return res.send(JSON.stringify({ error: "Data not found" }, null, 2));
  }
});

app.listen(PORT, () => {
  console.log(`http:
        //127.0.0.1:${PORT}`);
});
