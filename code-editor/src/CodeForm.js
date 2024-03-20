import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
export default function CodeForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    language: "54",
    code: "",
    input: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await axios.post(
        'https://submission-chi.vercel.app/submission',
        formData
      );
      console.log(response.data.message);
      setLoading(false);
      toast.success(response.data.message);
    } catch (err) {
      setLoading(false);

      console.log(err);
    }
  };

  return (
    <div className="code_form">
      <form onSubmit={handleSubmit}>
        <div className="form_header">
          <div className="form_item">
            <label htmlFor="username">Username </label>
            <input
              type="text"
              id="username"
              name="username"
              onChange={handleChange}
              value={formData.username}
              required
            />
          </div>
          <div className="form_item">
            <label htmlFor="code_language">Code Language </label>
            <select
              name="language"
              id="code_language"
              onChange={handleChange}
              value={formData.code_language}
              required
            >
              <option value="54">C++</option>
              <option value="62">Java</option>
              <option value="93">JavaScript</option>
              <option value="71">Python</option>
            </select>
          </div>
        </div>
        <div className="code_submit">
          <textarea
            name="code"
            id="code"
            cols="30"
            rows="10"
            onChange={handleChange}
            value={formData.code}
            placeholder="// Submit code here...
            "
            required
          ></textarea>
          <div className="input_submit">
            <div className="input">
              <label htmlFor="Input">Input </label>

              <textarea
                name="input"
                id="input"
                cols="30"
                rows="5"
                onChange={handleChange}
                value={formData.input}
               
              ></textarea>
            </div>
            <input
              type="submit"
              value={loading ? "Submitting..." : "Submit"}
              disabled={loading}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
