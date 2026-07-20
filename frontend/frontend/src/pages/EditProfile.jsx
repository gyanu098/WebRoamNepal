import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { getProfile, updateProfile, getImageUrl, changePassword } from "../service/Api";
import "./EditProfile.css";

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    bio: "",
  });
  const [currentImage, setCurrentImage] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        const user = res.data.user;
        setFormData({
          name: user.name || "",
          email: user.email || "",
          location: user.location || "",
          bio: user.bio || "",
        });
        setCurrentImage(user.image);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("location", formData.location);
    data.append("bio", formData.bio);
    if (image) data.append("image", image);

    try {
      const res = await updateProfile(data);
      if (res.data.success) {
        toast.success("Profile updated successfully!");
        navigate("/profile");
      } else {
        toast.error(res.data.message || "Update failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong while updating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success(res.data.message || "Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="page-shell edit-container">
      <Link to="/profile" className="back-link">← Back to profile</Link>
      <div className="page-header">
        <div>
          <h2 className="page-title">Edit your profile</h2>
          <p className="page-subtitle">Keep your traveler details fresh and clear.</p>
        </div>
      </div>

      <form className="edit-form" onSubmit={handleSubmit}>
        <label className="field-label">
          Profile image
          {preview || currentImage ? (
            <img
              src={preview || getImageUrl(currentImage)}
              alt="Profile preview"
              width="100"
              height="100"
              style={{ borderRadius: "50%", objectFit: "cover", marginBottom: "8px" }}
            />
          ) : (
            <div
              className="avatar-placeholder"
              style={{ width: 100, height: 100, borderRadius: "50%", fontSize: "2rem", marginBottom: "8px" }}
            >
              {formData.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>

        <label className="field-label">
          Name
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter your name"
          />
        </label>

        <label className="field-label">
          Email
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter your email"
          />
        </label>

        <label className="field-label">
          Location
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="Where are you based?"
          />
        </label>

        <label className="field-label">
          Bio
          <textarea
            rows="4"
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder="Tell others a little about yourself"
          />
        </label>

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="page-header" style={{ marginTop: "32px" }}>
        <div>
          <h2 className="page-title">Change password</h2>
          <p className="page-subtitle">Use a strong password you don't use elsewhere.</p>
        </div>
      </div>

      <form className="edit-form" onSubmit={handlePasswordSubmit}>
        <label className="field-label">
          Current password
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
            }
            placeholder="Enter your current password"
          />
        </label>

        <label className="field-label">
          New password
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
            }
            placeholder="At least 8 characters"
          />
        </label>

        <label className="field-label">
          Confirm new password
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
            }
            placeholder="Re-enter new password"
          />
        </label>

        <button className="btn btn-primary" type="submit" disabled={isChangingPassword}>
          {isChangingPassword ? "Changing..." : "Change password"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
