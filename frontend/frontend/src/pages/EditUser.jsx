import { useState, useEffect } from "react";
import { getUserById, updateUserById, deleteUserById, getImageUrl } from "../service/Api";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  // Fetch user details on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(id);
        setFormData({
          name: response.data.user.name,
          email: response.data.user.email,
          password: "",
          role: response.data.user.role || "user"
        });
        setCurrentImage(response.data.user.image);
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to fetch user");
      }
    };
    fetchUser();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Submit updated user data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("role", formData.role);
      if (image) {
        data.append("image", image);
      }
      await updateUserById(id, data);
      toast.success("User updated successfully");
      navigate("/user");
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUserById(id);
      toast.success("User deleted successfully");
      navigate("/user");
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="edit-user-container">
      <Link to="/user" className="back-link">← Back to admin dashboard</Link>
      <h2>Edit User</h2>

      {preview || currentImage ? (
        <img
          src={preview || getImageUrl(currentImage)}
          alt="User"
          width="100"
          height="100"
          style={{ borderRadius: "8px", marginBottom: "10px" }}
        />
      ) : (
        <div
          className="avatar-placeholder"
          style={{ width: 100, height: 100, borderRadius: "8px", fontSize: "2rem", marginBottom: "10px" }}
        >
          {formData.name?.[0]?.toUpperCase() || "?"}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Name"
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="Password"
          onChange={handleChange}
        />
        <input type="file" name="image" onChange={handleImageUpload} />

        <label style={{ display: "block", margin: "10px 0" }}>
          Role:{" "}
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button type="submit" className="btn-update">Update User</button>
        <button type="button" onClick={handleDelete} className="btn-delete">
          Delete User
        </button>
      </form>
    </div>
  );
};

export default EditUser;
