import CryptoJS from "crypto-js";

const { useState } = require("react");

const secretKey = 'secretKey123'; //needs to be an environment variable.

const PatientDetails = () =>{
    const [formData, setFormData] = useState({
        name:'',
        age:'',
        ssn:'',
    })

    const handleChange = (e) =>{
        const { name, value }= e.target;
        setFormData((prevData)=>({...prevData, [name]:value}));
    }

    const encryptData = (data) =>{
        return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const encryptedData = encryptData(formData);
    
            const response = await fetch('http://localhost:5000/api/patient-onboarding', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ data: encryptedData }),
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