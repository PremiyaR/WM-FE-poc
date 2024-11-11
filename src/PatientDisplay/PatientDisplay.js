import React, { useEffect, useState } from 'react';

const PatientDisplay = () => {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const fetchPatientData = async () => {
            const response = await fetch('http://localhost:5000/api/patient-onboarding');
            const { patients } = await response.json();
            setPatients(patients);
        };

        fetchPatientData();
    }, []);

    if (!patients || patients.length === 0) return <p>Loading...</p>;

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
