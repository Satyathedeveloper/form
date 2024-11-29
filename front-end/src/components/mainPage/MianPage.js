import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Steps, DatePicker, Select, Upload, Tooltip, Radio, Tag, Card } from 'antd';
import { TreeSelect, Slider } from 'antd';
import { PictureOutlined, FilePdfOutlined } from '@ant-design/icons';
import { InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;





const ResumeBuilder = ({ onSubmit, initialValues }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});




  const onFinish = async (values) => {


    if (values.education === undefined || null || Array.length == 0 && currentStep==3) { // ikkda current step 4 kooda pettu
      form.setFieldsValue({ education: [{}] })

    }
    else {

      const finalValues = await form.getFieldValue();
      const education = JSON.stringify(finalValues.education);

      const allData = { ...formData, education };

      console.log(allData);
      console.log('Education field before sending:', allData.education);
      onSubmit(allData);
      form.resetFields();
      setCurrentStep(0);
      setTags([]);
      setProjTags([]);
    }


  };
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [tags, setTags] = useState([]);
  const [projTags, setProjTags] = useState([]);
  const [languageInputValue, setLanguageInputValue] = useState("");
  const [projectInputValue, setProjectInputValue] = useState("");

  useEffect(() => {
    if (initialValues) {
      setCurrentStep(0)
      console.log(initialValues);
      if (initialValues.birthdate) {
        const birthDateDayjs = dayjs(initialValues.birthdate);

        if (birthDateDayjs.isValid() || dayjs(initialValues.education[0].courseDuration[0]) || dayjs(initialValues.education[0].courseDuration[0])) {
          initialValues.education.forEach(education => {
            if (education.courseDuration && education.courseDuration.length >= 2) {
              education.courseDuration[0] = dayjs(education.courseDuration[0]);
              education.courseDuration[1] = dayjs(education.courseDuration[1]);
            }
          });


          initialValues.birthdate = birthDateDayjs;
        } else {
          console.warn("Invalid birthdate provided:", initialValues.birthdate);
          initialValues.birthdate = null;
        }
      }

      form.setFieldsValue(initialValues);

      setTags(initialValues.languages || []);
      setProjTags(initialValues.projects || []);
    } else {
      form.resetFields(); // Reset fields when creating a new record
    }
  }, [initialValues, form]);


  useEffect(() => {
    // Fetch countries
    axios.get('https://restcountries.com/v3.1/all')
      .then(response => {
        const countryList = response.data.map(country => ({
          label: country.name.common,
          value: country.cca2,
          phoneCode: country.idd ? country.idd.root + (country.idd.suffixes || []).join('') : ''
        }));

        countryList.sort((a, b) => a.label.localeCompare(b.label));
        setCountries(countryList);
      })
      .catch(error => console.error('Error fetching countries:', error));
  }, []);




  const techSkillsOptions = [
    {
      title: 'Programming Languages',
      value: 'programming languages',
      children: [
        { title: 'JavaScript', value: 'javascript' },
        { title: 'Python', value: 'python' },
        { title: 'Java', value: 'java' },
      ],
    },
    {
      title: 'Frameworks',
      value: 'frameworks',
      children: [
        { title: 'React', value: 'react' },
        { title: 'Angular', value: 'angular' },
        { title: 'Vue', value: 'vue' },
      ],
    },
  ];

  const softSkillsOptions = [
    {
      title: 'Communication Skills',
      value: 'communication',
      children: [
        { title: 'Public Speaking', value: 'public speaking' },
        { title: 'Writing', value: 'writing' },
      ],
    },
    {
      title: 'Teamwork',
      value: 'teamwork',
      children: [
        { title: 'Collaboration', value: 'collaboration' },
        { title: 'Conflict Resolution', value: 'conflict resolution' },
      ],
    },
  ];

  const handleCountryChange = async (value) => {
    setSelectedCountry(value);
    setSelectedState(null);

    try {
      const response = await axios.get('https://wft-geo-db.p.rapidapi.com/v1/geo/countries/' + value + '/regions', {
        headers: {
          'X-RapidAPI-Key': '40cf31fb08msh94432b76946704bp15d089jsnfc072edf7970',
          'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
        }
      });

      setStates(response.data.data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
      setStates([]);
    }
  };

  const handleStateChange = (value) => {
    setSelectedState(value);
  };
  const handleSearch = (searchText) => {
    return countries.filter(country =>
      country.label.toLowerCase().includes(searchText.toLowerCase())
    );
  };
  const next = async () => {
    try {

      const values = await form.validateFields();
      console.log('here', currentStep);
      if (currentStep == 0) {
        setFormData((prevData) => ({
          ...prevData,
          ...values,

        }));
        console.log(formData);

      }
      if (currentStep == 1) {
        setFormData((prevData) => ({ ...prevData, ...values, 'languages': tags, 'projects': projTags }));
        // setFormData((prevData) => ({ ...prevData, ...values }));
        console.log(formData);

      } else {
        setFormData((prevData) => ({ ...prevData, ...values }));
      }
      console.log(formData);

      setCurrentStep((prevStep) => prevStep + 1);
      // form.resetFields();
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };
  const prev = () => setCurrentStep((prev) => prev - 1);



  const handleLanguageKeyDown = (e) => {
    if (e.key === "Enter" && languageInputValue.trim()) {
      const trimmedValue = languageInputValue.trim();
      if (!tags.includes(trimmedValue)) {
        setTags((prevTags) => [...prevTags, trimmedValue]);
      }
      setLanguageInputValue(""); // Clear the input value
    }
  };

  const handleProjectKeyDown = (e) => {
    if (e.key === "Enter" && projectInputValue.trim()) {
      const trimmedValue = projectInputValue.trim();
      if (!projTags.includes(trimmedValue)) {
        setProjTags((prevProjTags) => [...prevProjTags, trimmedValue]);
      }
      setProjectInputValue(""); // Clear the input value
    }
  };
  useEffect(() => {

  }, [tags, projTags]);


  const removeTagByString = (tagToRemove) => {
    const newProjTags = tags.filter(tag => !tagToRemove.includes(tag));
    setTags(newProjTags);

  };

  const removeProjTagByString = (tagToRemove) => {
    const newProjTags = projTags.filter(tag => !tagToRemove.includes(tag));
    setProjTags(newProjTags);
  };
  const steps = [
    {
      title: 'Personal Information',
      content: (
        <div>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Name is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="First Name"
                name="surname"
                rules={[{ required: true, message: 'Surname is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, type: 'email', message: 'Valid email is required' }]}
              >
                <Input
                  suffix={
                    <Tooltip title="Your email will be used for communication">
                      <InfoCircleOutlined />
                    </Tooltip>
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Marital Status"
                name="maritalStatus"
                rules={[{ required: true, message: 'Please select your marital status!' }]}
              >
                <Radio.Group>
                  <Row>
                    <Col span={12}>
                      <Radio value="single">Single</Radio>
                    </Col>
                    <Col span={12}>
                      <Radio value="married">Married</Radio>
                    </Col>
                  </Row>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Birth Date"
                name="birthdate"
                rules={[
                  { required: true, message: 'Birth date is required' },
                  {
                    validator: (_, value) => {
                      if (value && new Date(value) > new Date()) {
                        return Promise.reject('Birth date cannot be in the future');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  placeholder="Select Birth Date"
                />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  { required: true, message: 'Phone number is required' },
                  {
                    pattern: /^(\+\d{1,3}[- ]?)?\d{10}$/,
                    message: 'Please enter a valid phone number (10 digits, optional country code)'
                  }
                ]}
              >
                <Input
                  placeholder="+1 (123) 456-7890"
                  addonBefore={
                    <Select defaultValue="+91" style={{ width: 70 }}>
                      <Option value="+1">🇺🇸 +1</Option>
                      <Option value="+44">🇬🇧 +44</Option>
                      <Option value="+91">🇮🇳 +91</Option>
                      <Option value="+61">🇦🇺 +61</Option>
                      <Option value="+81">🇯🇵 +81</Option>
                      <Option value="+49">🇩🇪 +49</Option>
                      <Option value="+33">🇫🇷 +33</Option>
                      <Option value="+55">🇧🇷 +55</Option>
                      <Option value="+34">🇪🇸 +34</Option>
                      <Option value="+1-800">🇺🇸 +1-800 (Toll-Free)</Option>
                      <Option value="+7">🇷🇺 +7</Option>
                      <Option value="+27">🇿🇦 +27</Option>
                      <Option value="+20">🇪🇬 +20</Option>
                      <Option value="+39">🇮🇹 +39</Option>
                      <Option value="+31">🇳🇱 +31</Option>
                      <Option value="+52">🇲🇽 +52</Option>
                      <Option value="+1-808">🇺🇸 +1-808 (Hawaii)</Option>
                      <Option value="+40">🇷🇴 +40</Option>
                      <Option value="+63">🇵🇭 +63</Option>
                      <Option value="+82">🇰🇷 +82</Option>
                      <Option value="+96">🇲🇾 +96</Option>

                    </Select>
                  }
                /></Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[{ required: true, message: 'Please select your gender!' }]}
              >
                <Radio.Group>
                  <Row>
                    <Col span={8}>
                      <Radio value="male">Male</Radio>
                    </Col>
                    <Col span={8}>
                      <Radio value="female">Female</Radio>
                    </Col>
                    <Col span={8}>
                      <Radio value="other">Other</Radio>
                    </Col>
                  </Row>
                </Radio.Group>
              </Form.Item>
            </Col>

          </Row>

          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Street Address"
                  name="address"
                  rules={[{ required: true, message: 'Address is required' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[{ required: true, message: 'City is required' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Country" name="country" rules={[{ required: true, message: 'Please select a country!' }]}>
                  <Select
                   showSearch
                    onSearch={handleSearch}
                    placeholder="Select a country"
                    options={countries.map(country => ({ label: country.label, value: country.value }))}
                    onChange={handleCountryChange}
                    value={selectedCountry}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="State" name="state" rules={[{ required: true, message: 'Please select a state!' }]}>
                  <Select
                    placeholder="Select a state"
                    options={states.map(state => ({ label: state.name, value: state.name }))}
                    onChange={handleStateChange}
                    value={selectedState}
                    disabled={!selectedCountry} // Disable if no country is selected
                    style={{ maxHeight: 300, overflowY: 'auto' }} // Ensure scrolling when there are many options
                  />
                </Form.Item>

              </Col>
              <Col span={8}>
                <Form.Item
                  label="Zip Code"
                  name="zipcode"
                  rules={[{ required: true, message: 'Zip code is required' }]}
                >
                  <Input type='number' />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>
      ),
    },
    {
      title: 'Skills',
      content: (
        <div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Select Technical Skills"
                name="techSkills"
                rules={[{ required: true, message: 'Please select your technical skills!' }]}
              >
                <TreeSelect
                  treeData={techSkillsOptions}
                  treeCheckable={true}
                  showCheckedStrategy={TreeSelect.SHOW_CHILD}
                  placeholder="Select technical skills"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* Experience Level for Technical Skills */}
              <Form.Item
                label="Experience Level in Technical Skills"
                name="techExperienceLevel"
                rules={[{ required: true, message: 'Please select your experience level!' }]}
              >
                <Select placeholder="Select experience level" style={{ width: '100%' }}>
                  <Option value="beginner">Beginner</Option>
                  <Option value="intermediate">Intermediate</Option>
                  <Option value="advanced">Advanced</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Select Soft Skills"
                name="softSkills"
                rules={[{ required: true, message: 'Please select your soft skills!' }]}
              >
                <TreeSelect
                  treeData={softSkillsOptions}
                  treeCheckable={true}
                  showCheckedStrategy={TreeSelect.SHOW_CHILD}
                  placeholder="Select soft skills"
                  style={{ width: '100%' }}
                />
              </Form.Item>

            </Col>
            <Col span={12}>

              <Form.Item
                label="Your Experience (1-10)"
                name="experienceRange"
                rules={[{ required: true, message: 'Please rate your experience!' }]}
              >
                <Slider
                  min={0}
                  max={10}
                  marks={{
                    0: 'Fresher',
                    1: '1',
                    5: '5',
                    10: '10',
                  }}
                  step={1}
                  initialValues={0}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Input
                value={languageInputValue}
                onChange={(e) => setLanguageInputValue(e.target.value)}
                onKeyDown={handleLanguageKeyDown}
                placeholder="Enter languages that you can speak and hit enter"
                style={{ width: "100%", marginBottom: "10px" }}
              />
            </Col>
            <Col span={12}>
              <Input
                value={projectInputValue}
                onChange={(e) => setProjectInputValue(e.target.value)}
                onKeyDown={handleProjectKeyDown}
                placeholder="Enter your projects here and press Enter"
                style={{ width: "100%", marginBottom: "10px" }}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Languages"
                name="languages"
                rules={[
                  {
                    validator: (_, value) =>
                      tags.length > 0
                        ? Promise.resolve()
                        : Promise.reject(new Error('Please provide at least one language')),
                  },
                ]}
              >
                {tags.map((tag, index) => (
                  <Tag key={index} closable onClose={() => removeTagByString(tag)}>
                    {tag}
                  </Tag>
                ))}
              </Form.Item>
            </Col>


            <Col span={12}>
              <Form.Item
                label="Projects"
                name='projects'
                rules={[
                  {
                    validator: (_, value) =>
                      projTags.length > 0
                        ? Promise.resolve()
                        : Promise.reject(new Error('Please provide at least one project that you have done')),
                  },
                ]}
              >

                {projTags.map((tag, index) => (
                  <Tag key={index} closable onClose={() => removeProjTagByString(tag)}>
                    {tag}
                  </Tag>
                ))}
              </Form.Item>
            </Col>
          </Row>

          {/* Personal Comments */}
          <Form.Item
            label="Describe one of your project in 2-3 line"
            name="comments"
            rules={[{ required: true, message: 'Description about one of you project is required' }]}
          >
            <Input.TextArea rows={4} placeholder="Share your thoughts..." />
          </Form.Item>

        </div>
      ),
      
    },
    {
      title: 'Photo Verification',
      content: (
        <div>
          <Row gutter={16}>
            {/* Photo Upload */}
            <Col span={12}>
              <Form.Item
                label="Upload Photo"
                name="photo"
                rules={[{ required: true, message: 'Photo is required' }]}
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  onChange={(info) => {
                    if (info.fileList.length > 0) {
                      form.setFieldValue('photo', info.fileList[0]);
                      console.log(info);
                    }
                  }}
                >
                  {initialValues?.photo ? <img
                    src={`data:image/jpeg;base64,${initialValues.photo}`} // replace with the URL of the image you want to display
                    alt="Click to Upload"
                    style={{ cursor: 'pointer', width: '100px', height: 'auto' }} // style the image as needed
                  /> : <Button icon={<PictureOutlined />}>Click to Upload Photo</Button>}
                </Upload>

              </Form.Item>

              <Form.Item
                label="Upload Resume"
                name="resume"
                rules={[{ required: true, message: 'Resume is required' }]}
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  onChange={(info) => {
                    if (info.fileList.length > 0) {
                      form.setFieldValue('resume', info.fileList[0]);
                    }
                  }}
                > {initialValues?.resume ? <img
                  src={`data:image/jpeg;base64,${initialValues.resume}`} // replace with the URL of the image you want to display
                  alt="Click to Upload"
                  style={{ cursor: 'pointer', width: '100px', height: 'auto' }} // style the image as needed
                /> : <Button icon={<FilePdfOutlined />}>Click to Upload Resume</Button>}

                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Bio"
            name="bio"
            rules={[{ required: true, message: 'Bio is required' }]}
          >
            <TextArea rows={4} placeholder="Tell us about yourself in 10 lines " />
          </Form.Item>
        </div>
      ),
    },
    {
      title: 'Studies',
      content: (

        <div>
          <Form.List name="education"
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey }) => (
                  <div key={key} style={{ marginBottom: '16px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          label="Education"
                          name={[name, 'education']}
                          fieldKey={[fieldKey, 'education']}
                          rules={[{ required: true, message: 'Education type is required' }]}
                        >
                          <Select>
                            <Select.Option value="graduation">Graduation</Select.Option>
                            <Select.Option value="pg">PG</Select.Option>
                            <Select.Option value="phd">PhD</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label="University/Institute Name"
                          name={[name, 'institution']}
                          fieldKey={[fieldKey, 'institution']}
                          rules={[{ required: true, message: 'Institution name is required' }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label="Course"
                          name={[name, 'course']}
                          fieldKey={[fieldKey, 'course']}
                          rules={[{ required: true, message: 'Course is required' }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          label="Specialization"
                          name={[name, 'specialization']}
                          fieldKey={[fieldKey, 'specialization']}
                          rules={[{ required: true, message: 'Specialization is required' }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label="Course Type"
                          name={[name, 'courseType']}
                          fieldKey={[fieldKey, 'courseType']}
                          rules={[{ required: true, message: 'Course type is required' }]}
                        >
                          <Radio.Group>
                            <Radio value="fullTime">Full-time</Radio>
                            <Radio value="partTime">Part-time</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label="Course Duration"
                          name={[name, 'courseDuration']}
                          fieldKey={[fieldKey, 'courseDuration']}
                          rules={[{ required: true, message: 'Course duration is required' }]}
                        >
                          <RangePicker />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          label="Grade"
                          name={[name, 'grade']}
                          fieldKey={[fieldKey, 'grade']}
                          rules={[{ required: true, message: 'Grade is required' }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Button type="danger" onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  Add Education

                </Button>
              </>
            )}
          </Form.List>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card style={{
        maxWidth: 1000,
        maxHeight: 500,
        overflow: 'auto',
        margin: '30px  auto',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        backgroundColor: '#fff',

      }}
        title={<h1 style={{ fontSize: '36px', fontWeight: '600', color: '#333', margin: '2px' }}>We are happy to see you here</h1>}
      >


        <Steps current={currentStep} style={{ marginBottom: '30px' }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} />
          ))}
        </Steps>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          {steps[currentStep].content}

          <div style={{
            marginTop: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {currentStep > 0 && (
              <Button
                onClick={prev}
                style={{
                  padding: '10px 20px',
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5',
                  color: '#555',
                  border: '1px solid #ddd',
                  transition: 'background-color 0.3s'
                }}
              >
                Previous
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                onClick={next}
                style={{
                  padding: '10px 20px',
                  borderRadius: '4px',
                  backgroundColor: '#1890ff',
                  color: '#fff',
                  border: '1px solid #1890ff',
                  transition: 'background-color 0.3s'
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  padding: '10px 20px',
                  borderRadius: '4px',
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  border: '1px solid #4CAF50',
                  transition: 'background-color 0.3s'
                }}
              >
                Submit
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </>
  );
};



export default ResumeBuilder;