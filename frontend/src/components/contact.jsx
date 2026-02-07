import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "./contact.css"; // Make sure to include the updated CSS provided earlier

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setSubmitted(true);
      console.log("Form submitted:", formData);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } else {
      setSubmitted(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  return (
    <section className="contact-section py-5">
      <hr className="border-secondary my-4" />
      <Container>
        <div className="text-center mb-5">
          <h5 className="contact-subtitle text-uppercase">Get In Touch</h5>
          <h2 className="fw-bold text-white">
            Contact <span className="text-gradient">Us</span>
          </h2>
          <p className="text-light">
            We'd love to hear from you — whether it's support, bulk inquiries,
            or just feedback.
          </p>
        </div>

        <Row className="justify-content-center">
          <Col md={8}>
            <Form onSubmit={handleSubmit} className="contact-form p-4 rounded">
              {submitted && (
                <Alert variant="success">
                  ✅ Message sent successfully!
                </Alert>
              )}

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="formName">
                    <Form.Label className="text-light">Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formEmail">
                    <Form.Label className="text-light">Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="formSubject" className="mb-3">
                <Form.Label className="text-light">Subject</Form.Label>
                <Form.Select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="text-white select border-secondary"
                >
                  <option value="">Choose...</option>
                  <option>Support</option>
                  <option>Bulk Order</option>
                  <option>Feedback</option>
                </Form.Select>
              </Form.Group>

              <Form.Group controlId="formMessage" className="mb-4">
                <Form.Label className="text-light">Message</Form.Label>
                <Form.Control
                  as="textarea"
                  name="message"
                  rows={5}
                  placeholder="Type your message here..."
                  value={formData.message}
                  onChange={handleChange}
                  isInvalid={!!errors.message}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.message}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="text-center">
                <Button
                  variant="primary"
                  type="submit"
                  className="px-4 py-2 shadow-sm"
                >
                  Send Message
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
      <hr className="border-secondary my-4" />
    </section>
  );
};

export default ContactUs;
