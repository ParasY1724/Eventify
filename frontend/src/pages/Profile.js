import React, { useState, useEffect } from "react";
import { Edit, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setAvatar(file);
      setError("");
    } else {
      setError("Please select a valid image file");
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError("");
      const form = new FormData();
      
      if (formData.name) form.append("name", formData.name);
      if (formData.email) form.append("email", formData.email);
      if (formData.phone) form.append("phone", formData.phone);
      if (avatar) form.append("avatar", avatar);

      
      if (form.entries().next().done) {
        setError("Please fill in at least one field to update");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const response = await axios.put(`${BACKEND_URL}/api/auth/user`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.user) {
        setIsEditing(false);
        setAvatar(null);
        window.location.reload();
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error updating profile");
      console.error("Error updating user:", error);
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatar(null);
    setError("");
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  };

  return (
    <div className="bg-gray-50 p-6 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Profile Settings</h1>

        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          {user ? (
            <div className="text-center">
              <img
                src={
                  avatar
                    ? URL.createObjectURL(avatar)
                    : user.avatarUrl || "/api/placeholder/150/150"
                }
                alt="Avatar"
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-300"
              />
              
              {error && (
                <div className="text-red-500 mb-4 text-sm">{error}</div>
              )}

              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block mx-auto text-sm text-gray-600"
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Name"
                    className="w-full p-3 border rounded-lg border-gray-300"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="w-full p-3 border rounded-lg border-gray-300"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone"
                    className="w-full p-3 border rounded-lg border-gray-300"
                  />
                  {isLoading ? <>Saving .....</> :
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>}
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{user.name}</h2>
                  <p className="text-gray-600 mb-1">{user.email}</p>
                  <p className="text-gray-600 mb-4">{user.phone}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg mb-2 flex items-center justify-center gap-2"
                  >
                    <Edit size={18} /> <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={logout}
                    className="w-full bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} /> <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No user information available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}