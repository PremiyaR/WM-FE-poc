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
      const publicKey = await fetchPublicKey(); // Fetching the public key.

      //Generation of AES key randomly for every data submit.
      const aesString = crypto.randomBytes(32).toString('base64');

      const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(aesString, "base64"), Buffer.alloc(16,0));
      let encryptedData = cipher.update(JSON.stringify(formData),"utf8", "base64")
      encryptedData += cipher.final("base64");

      const encryptedKey = crypto.publicEncrypt(publicKey, Buffer.from(aesString))

      // Send encrypted data and AES key to the backend
      const response = await fetch(
        "http://localhost:5000/api/patient-onboarding",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({encryptedData: encryptedData,encryptedKey: encryptedKey.toString("base64") }),
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
