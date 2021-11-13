import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Modal, Form, InputNumber } from "antd";

const CreateAirModal = ({ isVisible, onSubmit, onClose }) => {
  const [form] = Form.useForm();

  const handleSubmit = useCallback(() => {
    form.validateFields().then((values) => {
      onSubmit(values);
      onClose();
    });
  }, [form, onSubmit, onClose]);
  return (
    <Modal
      title="Create Modal"
      visible={isVisible}
      onOk={handleSubmit}
      onCancel={onClose}
    >
      <Form
        form={form}
        initialValues={{
          // angle: 30,
          len: 300,
          radius: 60,
        }}
      >
        {/* <Form.Item name="angle" label="Angle">
          <InputNumber />
        </Form.Item> */}
        <Form.Item name="radius" label="Radius">
          <InputNumber />
        </Form.Item>
        <Form.Item name="len" label="Distanse">
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  );
};

CreateAirModal.propTypes = {
  isVisible: PropTypes.bool,
  onSubmit: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default CreateAirModal;
