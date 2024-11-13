import CryptoJS from "crypto-js";
import crypto from 'crypto-browserify';

const { useState } = require("react");

const secretKey = 'secretKey123'; //needs to be an environment variable.

const PatientDetails = () =>{

    const fetchPublicKey = async () => {
        const response = await fetch('http://localhost:5000/api/patient-onboarding/public-key');
        return response.text();
    };
    
    const [formData, setFormData] = useState({
        name:'',
        age:'',
        ssn:'',
    })

    const handleChange = (e) =>{
        const { name, value }= e.target;
        setFormData((prevData)=>({...prevData, [name]:value}));
    }


    //Encryption of the data using AES.
    const encryptData = (data) =>{
        return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const publicKey = await fetchPublicKey(); // Ensure this fetch is correct
    
            // Generate AES key directly as a Buffer (128-bit key)
            const aesKeyBuffer = crypto.randomBytes(16);  // 16 bytes for AES-128
    
            // Convert AES key buffer to base64 for CryptoJS compatibility
            const aesKey = aesKeyBuffer.toString('base64');
    
            // Encrypt form data with AES key
            const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(formData), aesKey).toString();
    
            // Encrypt AES key with RSA public key
            const encryptedAESKey = crypto.publicEncrypt(
                {
                    key: publicKey,
                    padding: crypto.constants.RSA_PKCS1_PADDING,
                },
                aesKeyBuffer
            ).toString('base64'); // Convert encrypted AES key to base64
    
            // Send encrypted data and AES key to the backend
            const response = await fetch('http://localhost:5000/api/patient-onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ encryptedData, encryptedAESKey }),
            });
    
            if (response.ok) {
                alert('Data submitted successfully');
            } else {
                alert('Error submitting data');
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert('Error submitting data');
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
}

export default PatientDetails;