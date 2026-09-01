import { useState } from "react";
import { registerUser } from "../services/authService";

function Register() {

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        fullname: ""
    });

    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();

            data.append("fullname", formData.fullname);
            data.append("username", formData.username);
            data.append("email", formData.email);
            data.append("password", formData.password);

            // Avatar is required by your backend
            data.append("avatar", avatar);

            // Cover image is optional
            if (coverImage) {
                data.append("coverImage", coverImage);
            }

            const response = await registerUser(data);

            console.log("Registration successful:", response);

        } catch (error) {
            console.log(
                "Registration failed:",
                error.response?.data || error
            );
        }
    };

    return (
        <div>
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="fullname"
                    placeholder="Full Name"
                    value={formData.fullname}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <label>
                    Avatar
                </label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files[0])}
                />

                <label>
                    Cover Image
                </label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files[0])}
                />

                <button type="submit">
                    Register
                </button>

            </form>
        </div>
    );
}

export default Register;