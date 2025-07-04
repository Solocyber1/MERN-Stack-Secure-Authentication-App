const User = require("../models/User");

const getPrivateData = (req, res, next) => {
  return res.status(200).json({
    success: true,
    data: "You got access to the private data in this route",
  });
};

const updateProfile = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: "Please provide name and email" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
	console.error("Update error:", error); 
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = { getPrivateData, updateProfile };
