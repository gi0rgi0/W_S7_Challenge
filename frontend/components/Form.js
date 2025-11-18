import React, { useState, useEffect } from "react";
import * as yup from "yup";
import axios from "axios";

const validationErrors = {
  fullNameTooShort: "full name must be at least 3 characters",
  fullNameTooLong: "full name must be at most 20 characters",
  sizeIncorrect: "size must be S or M or L",
};

// VALIDATION SCHEMA
const userSchema = yup.object().shape({
  fullName: yup
    .string()
    .trim()
    .required("full name is required")
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong),

  size: yup
    .string()
    .oneOf(["S", "M", "L"], validationErrors.sizeIncorrect)
    .required(validationErrors.sizeIncorrect),

  // toppings OPTIONAL but must be IDs if present
  toppings: yup
    .array()
    .of(yup.string().matches(/^\d+$/, "toppings must be ids"))
    .optional(),
});

// TOPPINGS LIST
const toppingsList = [
  { topping_id: "1", text: "Pepperoni" },
  { topping_id: "2", text: "Green Peppers" },
  { topping_id: "3", text: "Pineapple" },
  { topping_id: "4", text: "Mushrooms" },
  { topping_id: "5", text: "Ham" },
];

const initialValues = {
  fullName: "",
  size: "",
  toppings: [],
};

const initialErrors = {
  fullName: "",
  size: "",
};

export default function Form() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);
  const [enabled, setEnabled] = useState(false);
  const [success, setSuccess] = useState("");
  const [failure, setFailure] = useState("");

  // VALIDATE INDIVIDUAL FIELDS
  const validateField = (name, value) => {
    yup
      .reach(userSchema, name)
      .validate(value)
      .then(() => setErrors({ ...errors, [name]: "" }))
      .catch((err) => setErrors({ ...errors, [name]: err.message }));
  };

  // HANDLE INPUT CHANGES
  const onChange = (evt) => {
    const { name, type, value, checked } = evt.target;

    // Handle toppings (checkboxes)
    if (type === "checkbox") {
      let newToppings = [...values.toppings];
      if (checked) newToppings.push(value);
      else newToppings = newToppings.filter((t) => t !== value);

      setValues({ ...values, toppings: newToppings });
      return;
    }

    // Normal input fields
    setValues({ ...values, [name]: value });
    validateField(name, value);
  };

  // VALIDATE ENTIRE FORM TO ENABLE BUTTON
  useEffect(() => {
    userSchema.isValid(values).then(setEnabled);
  }, [values]);

  // SUBMIT FORM
  const onSubmit = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:9009/api/order", values)
      .then((res) => {
        setSuccess(res.data.message);
        setFailure("");
        setValues(initialValues);
      })
      .catch((err) => {
        setFailure(err.response?.data?.message || "Submission failed");
        setSuccess("");
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>

      {success && <div className="success">{success}</div>}
      {failure && <div className="failure">{failure}</div>}

      {/* FULL NAME */}
      <div className="input-group">
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={values.fullName}
          onChange={onChange}
          placeholder="Type full name"
        />
        {errors.fullName && <div className="error">{errors.fullName}</div>}
      </div>

      {/* SIZE */}
      <div className="input-group">
        <label htmlFor="size">Size</label>
        <select id="size" name="size" value={values.size} onChange={onChange}>
          <option value="">--- Choose Size ---</option>
          <option value="S">Small</option>
          <option value="M">Medium</option>
          <option value="L">Large</option>
        </select>
        {errors.size && <div className="error">{errors.size}</div>}
      </div>

      {/* TOPPINGS */}
      <div className="input-group">
        <label>Toppings</label>
        {toppingsList.map((t) => (
          <label key={t.topping_id}>
            {t.text}
            <input
              type="checkbox"
              value={t.topping_id}
              checked={values.toppings.includes(t.topping_id)}
              onChange={onChange}
            />
          </label>
        ))}
      </div>

      {/* SUBMIT BUTTON */}
      <button type="submit" disabled={!enabled}>
        Submit Order
      </button>
    </form>
  );
}
