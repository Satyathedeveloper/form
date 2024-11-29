import React, { useState, useEffect } from 'react';
import YourFormComponent from './components/mainPage/MianPage';
import TableComponent from './components/DatailsComp/tableComp';
const Bridge = () => {
    const [formData, setFormData] = useState([]); 
    const [editingRecord, setEditingRecord] = useState(null); 
    let path = window.location.pathname; 
    let parts = path.split('/'); 
    const id = parts[parts.length - 1];
    useEffect(() => {

        fetchData();
    }, []);
    const fetchData = async () => {
           
        console.log(id);
        
        try {
            const response = await fetch(`http://localhost:5000/api/records/${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                setFormData(data);
                console.log('Fetched data:', data);
            } else {
                console.error('Expected an array but got:', data);
            }
        } catch (error) {
            console.error('Error fetching data:', error.message || error);
        }
    };

    const base64ToFile = (base64, filename, mimeType) => {
        const base64Data = base64.includes('base64,') ? base64.split('base64,')[1] : base64;

        if (!isValidBase64(base64Data)) {
            throw new Error('Invalid Base64 string');
        }

        const byteString = atob(base64Data);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new File([ab], filename, { type: mimeType });
    };
    const isValidBase64 = (str) => {
        const regex = /^[A-Za-z0-9+/=]+$/;
        return regex.test(str);
    };

    const handleFormSubmit = async (data) => {
        const formData = new FormData();
        formData.append('uniqukey' , id)
        Object.keys(data).forEach((key) => {
            if (key !== 'photo' && key !== 'resume' && key !== 'education') {
                formData.append(key, data[key]);
            }
        });

        if (data.education) {
            formData.append('education', data.education);
        }

        // Handle photo field
        if (data.photo && data.photo.originFileObj) {
            formData.append('photo', data.photo.originFileObj); // New file
        } else if (editingRecord && editingRecord.photo) {
            const file = base64ToFile(editingRecord.photo, 'photo.jpg', 'image/jpeg');
            formData.append('photo', file);
        }

        // Handle resume field
        if (data.resume && data.resume.originFileObj) {
            formData.append('resume', data.resume.originFileObj); // New file
        } else if (editingRecord && editingRecord.resume) {
            const file = base64ToFile(editingRecord.resume, 'resume.pdf', 'application/pdf');
            formData.append('resume', file);
        }

        // Decide PUT or POST based on editingRecord
        const url = editingRecord
            ? `http://localhost:5000/api/records/${editingRecord.user_id}`
            : 'http://localhost:5000/api/records';
        const method = editingRecord ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            body: formData,
        });

        if (response.ok) {
            fetchData();
        }
    };

    // Handle editing an existing record
    const handleEdit = (record) => {
        // if (record.photo) {
        //   record.photo = Buffer.from(record.photo).toString('base64');
        // }
        // if (record.resume) {
        //   record.resume = Buffer.from(record.resume).toString('base64');
        // }
        setEditingRecord(record); // Set the record to be edited
    };




    const handleDelete = async (record) => {
        try {
            const response = await fetch(`http://localhost:5000/api/records/${record}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setFormData((prevData) => prevData.filter((item) => item.user_id !== record));
            } else {
                console.error('Failed to delete record');
            }
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    return (
        <>
            <YourFormComponent
                onSubmit={handleFormSubmit}
                initialValues={editingRecord}
            />
            <TableComponent
                data={formData}
                onEdit={handleEdit}
                setDelId={handleDelete}
                
            />

        </>
    );
}
export default Bridge; 