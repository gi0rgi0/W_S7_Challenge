import React, { useEffect, useState } from "react";
import * as yup from "yup"
import axios from "axios"
// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: "full name must be at least 3 characters",
  fullNameTooLong: "full name must be at most 20 characters",
  sizeIncorrect: "size must be S or M or L",
};

// 👇 Here you will create your schema.
const userSchema = yup.object().shape({
    fullName: yup.string().trim()
    .required()
    .min(3,validationErrors.fullNameTooShort).max(20,validationErrors.fullNameTooLong),
    size:
    yup.required(validationErrors.sizeIncorrect)
  
  })
// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: "1", text: "Pepperoni" },
  { topping_id: "2", text: "Green Peppers" },
  { topping_id: "3", text: "Pineapple" },
  { topping_id: "4", text: "Mushrooms" },
  { topping_id: "5", text: "Ham" },
];
const initialErrors =({
  name:"",
  size:""
})

  const initialValues = ({
  name:"",
  size:false,
  toppings: false,
})
export default function Form() {
  const [errors, setErrors] = useState(initialErrors)
  const [values, setValues] = useState(initialValues)
  const [success,setSucess] = useState('')
  const [failure, setFailure] = useState('')
  const [enabled,setEnabled] = useState()

  yup.reach(userSchema, name).validate(values)
    .then(()=>{
      setErrors({...errors, [name]: ""})
    })
    .catch((err)=>{
      console.log(err)
      
    })
  const onChange = evt => {
    // ✨ TASK: IMPLEMENT YOUR INPUT CHANGE HANDLER
    // The logic is a bit different for the checkbox, but you can check
    // whether the type of event target is "checkbox" and act accordingly.
    // At every change, you should validate the updated value and send the validation
    // error to the state where we track frontend validation errors.
    let {type,checked, name, value} = evt.target
    value = type == 'checkbox' ? checked : value
    setValues({...values,[name]: value})
  }
 useEffect(()=>{
    userSchema.isValid(values).then(setEnabled)
 },[values] )

 const onSubmit = (e) =>{
  e.preventDefault()
  axios
    .post('  http://localhost:9009/api/order', values)
    .then(res=>{
      setValues(initialValues)
      setSucess(res.data.message)
      setFailure()

    })
    .catch(err=>{
      setFailure(err.response.data.message)
      setSucess()
    })
 }

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {success && <div className="success">Thank you for your order!</div>}
      {failure && <div className="failure">Something went wrong</div>}

      <div className="input-group">
        <div>
          <label htmlFor="name"> Name</label>
          <br />
          <input placeholder="Type full name" id="name" name="name" type="text" onChange={onChange} />
        </div>
        {errors.name && <div className="error">Bad value</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label>
          <br />
          <select id="size" onChange={onChange} name="size" >
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {errors.size && <div className="error">Bad value</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
       {
        toppings.map((t)=>{
          return(
            <label key={t.topping_id}> {t.text}
            <input type="checkbox" onChange={onChange} name="checkbox" id="checkbox" />      
            </label>
          )
        })
       }
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={!enabled}/>
    </form>
  );
}
