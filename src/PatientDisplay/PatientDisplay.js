import { useState, useEffect } from "react";
import CryptoJS from "crypto-js"; 
import crypto from "crypto-browserify"; 

const PatientDisplay = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivateKey = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/patient-onboarding/private-key"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch private key");
        }
        return response.text(); // Private key as a plain string
      } catch (error) {
        console.error("Error fetching private key:", error);
      }
    };

    const fetchAndDecryptPatientData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/patient-onboarding"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }
        const encryptedPatients = await response.json();

        const privateKey = await fetchPrivateKey();

        const decryptedPatients = encryptedPatients.map((patient) => {
          const { encryptedData, encryptedKey } = patient;

          const buffer = Buffer.from(encryptedKey.toString(), 'base64')

          // Decrypt AES Key using private key
          const decryptedAESKey = crypto.privateDecrypt(
            {
              key: privateKey,
              padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
              oaepHash: "sha256",
            },
            buffer
          ).toString();

          const bytes = CryptoJS.AES.decrypt(encryptedData, decryptedAESKey);
          const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

          return JSON.parse(decryptedData); 
        });

        setPatients(decryptedPatients);
      } catch (error) {
        console.error("Error decrypting patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndDecryptPatientData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!patients || patients.length === 0) return <p>No patient data found.</p>;

  return (
    <div>
      <h2>All Patient Information</h2>
      {patients.map((patient, index) => (
        <div key={index}>
          <h3>Patient {index + 1}</h3>
          <p>Name: {patient.name}</p>
          <p>Age: {patient.age}</p>
          <p>SSN: {patient.ssn}</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default PatientDisplay;