import { useState, useEffect } from "react"; 
import crypto from "crypto-browserify"; 

const PatientDisplay = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndDecryptPatientData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/patient-onboarding"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }
        const encryptedPatients = await response.json();

        const decryptedPatients = encryptedPatients.map((patient) => {
          const { encryptedData, decryptedAESKey } = patient;
          console.log('encryptedData ---------------->', encryptedData);
          console.log('decryptedAESKey-------------->', decryptedAESKey);
          
          //Data is decrypted from the decryptedKey got from the backend.
          const decipher = crypto.createDecipheriv("aes-256-cbc",Buffer.from (decryptedAESKey,"base64"), Buffer.alloc(16,0));
          let decryptedData = decipher.update(encryptedData,"base64","utf8");
          decryptedData += decipher.final("utf8")

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