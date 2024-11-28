import React from 'react';
import { Button, Table } from 'antd';
import './TableComponent.css';  // Import the CSS file

const TableComponent = ({ data, setDelId, onEdit }) => {

  const columns = [
    { key: '1', title: 'Name', dataIndex: 'name', className: 'ellipsis' },
    { key: '2', title: 'Surname', dataIndex: 'surname' },
    { key: '3', title: 'Email', dataIndex: 'email', className: 'ellipsis' },
    { key: '4', title: 'Phone', dataIndex: 'phone' },
    { key: '5', title: 'Address', dataIndex: 'address', className: 'ellipsis' },
    { key: '6', title: 'City', dataIndex: 'city' },
    { key: '7', title: 'State', dataIndex: 'state' },
    { key: '8', title: 'Country', dataIndex: 'country' },
    { key: '9', title: 'Zipcode', dataIndex: 'zipcode' },
    {
      key: '10',
      title: 'Birthdate',
      dataIndex: 'birthdate',
      render: (text) => (text ? new Date(text).toDateString() : null),
    },
    { key: '11', title: 'Gender', dataIndex: 'gender' },
    { key: '12', title: 'Marital Status', dataIndex: 'maritalStatus' },
    { key: '13', title: 'Experience Range', dataIndex: 'experienceRange' },
    {
      key: '14',
      title: 'Tech Skills',
      dataIndex: 'techSkills',
      render: (text) => (Array.isArray(text) ? text.join(', ') : null),
    },
    {
      key: '15',
      title: 'Soft Skills',
      dataIndex: 'softSkills',
      render: (text) => (Array.isArray(text) ? text.join(', ') : null),
    },
    
    // {
    //   key: '16',
    //   title: 'Education',
    //   dataIndex: 'education',
    //   render: (text) =>
    //     text && text.length > 0 ? text.map((ed) => ed.education).join(', ') : null,
    // },
    // { key: '17', title: 'Experience Level', dataIndex: 'techExperienceLevel' },
    // { key: '18', title: 'Bio', dataIndex: 'bio' },
    // {
    //   key: '19',
    //   title: 'Languages',
    //   dataIndex: 'languages',
    //   render: (text) => (Array.isArray(text) ? text.join(', ') : null),
    // },
    // { key: '20', title: 'Comments', dataIndex: 'comments', className: 'ellipsis' },
    // {
    //   key: '21',
    //   title: 'Projects',
    //   dataIndex: 'projects',
    //   render: (text) => (Array.isArray(text) ? text.join(', ') : null),
    // },
    {
      title: 'Photo',
      dataIndex: 'photo',
      key: 'photo',
      render: (photo) =>
        photo ? (
          <img
            src={`data:image/jpeg;base64,${photo}`}
            alt="Uploaded Photo"
            className="photo-img"
          />
        ) : (
          'No Photo'
        ),
    },
    {
      title: 'Resume',
      dataIndex: 'resume',
      key: 'resume',
      render: (resume) =>
        resume ? (
          <a
            href={`data:application/pdf;base64,${resume}`}
            download="Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="resume-link"
          >
            Download Resume
          </a>
        ) : (
          'No Resume'
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="actions-container">
          <Button className="edit-btn" onClick={() => onEdit(record)}>Edit</Button>
          <Button className="delete-btn" danger onClick={() => setDelId(record.user_id)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="user_id" // Ensure the row key is unique
      pagination={{ pageSize: 10 }}
      className="table-component"
    />
  );
};

export default TableComponent;
