import CryptoJS from "crypto-js";
import crypto from "crypto-browserify";

const { useState } = require("react");

const PatientDetails = () => {
  const fetchPublicKey = async () => {
    const response = await fetch(
      "http://localhost:5000/api/patient-onboarding/public-key"
    );
    return response.text();
  };

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    ssn: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const publicKey = await fetchPublicKey(); // Ensure this fetch is correct

      const aesString = crypto.randomBytes(32).toString('base64');

      // Encrypt form data with AES key
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(formData),
        aesString
      ).toString();

      // Encrypt AES key with RSA public key
      const buffer = Buffer.from(aesString);
      const encryptedKey = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        buffer
      ).toString('base64');

      // Send encrypted data and AES key to the backend
      const response = await fetch(
        "http://localhost:5000/api/patient-onboarding",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ encryptedData, encryptedKey }),
        }
      );

      if (response.ok) {
        alert("Data submitted successfully");
      } else {
        alert("Error submitting data");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting data");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="age" placeholder="Age" onChange={handleChange} />
      <input name="ssn" placeholder="SSN" onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default PatientDetails;
