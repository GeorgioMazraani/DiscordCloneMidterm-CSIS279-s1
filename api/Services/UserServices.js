const User = require("../Models/User");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const createUser = async (username, email, password, avatar) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
            username: username,
            email: email,
            password: hashedPassword,
            avatar: avatar || null,
            created_at: new Date(),
            updated_at: new Date(),
        });

        return newUser;
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");
    }
};

const getAllUsers = async () => {
    try {
        const users = await User.findAll({
            attributes: [
                ["id", "ID"],
                ["email", "Email"],
                ["username", "Username"],
                ["avatar", "Avatar"],
                ["status", "Status"],
                ["faceDescriptor", "FaceDescriptor"],
            ],
        });

        // If faceDescriptor is stored as text and you want to parse it:
        // users.forEach((user) => {
        //     if (user.dataValues.FaceDescriptor) {
        //         try {
        //             user.dataValues.FaceDescriptor = JSON.parse(user.dataValues.FaceDescriptor);
        //         } catch (err) {
        //             console.error("Error parsing face descriptor for user:", err);
        //         }
        //     }
        // });

        return users;
    } catch (error) {
        console.error("Error retrieving users:", error);
        throw new Error("Failed to retrieve users");
    }
};

const getUserById = async (id) => {
    try {
        const user = await User.findByPk(id);

        if (!user) {
            return null;
        }

        // Convert avatar to base64 if needed
        if (user.avatar) {
            user.avatar = `data:image/jpeg;base64,${user.avatar.toString('base64')}`;
        }

        // If faceDescriptor is stored as text (like JSON), parse it if desired:
        // If it's stored as a JSON string and you want it as an array:
        // if (user.faceDescriptor && typeof user.faceDescriptor === "string") {
        //     try {
        //         user.faceDescriptor = JSON.parse(user.faceDescriptor);
        //     } catch (err) {
        //         console.error("Error parsing face descriptor:", err);
        //     }
        // }

        return user;
    } catch (error) {
        console.error("Error retrieving user by ID:", error);
        throw new Error("Failed to retrieve user");
    }
};

const getUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ where: { email } });
        return user || null;
    } catch (error) {
        console.error(`Error finding user with email ${email}:`, error);
        throw new Error("Failed to retrieve user");
    }
};

const updateUser = async (id, username, email, password, avatar, status, isMuted, isHeadphonesOn) => {
    try {
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }
        const updateData = {
            username,
            email,
            avatar,
            status,
            updated_at: new Date(),
        };

        if (hashedPassword) {
            updateData.password = hashedPassword;
        }

        if (typeof isMuted !== 'undefined') {
            updateData.isMuted = isMuted;
        }

        if (typeof isHeadphonesOn !== 'undefined') {
            updateData.isHeadphonesOn = isHeadphonesOn;
        }

        const updated = await User.update(updateData, {
            where: { id },
            individualHooks: true,
        });

        return updated;
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user");
    }
};

const deleteUser = async (id) => {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }
        await user.destroy();
        return user;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw new Error("Failed to delete user");
    }
};

const getUserByUsername = async (username) => {
    try {
        const user = await User.findOne({ where: { username } });
        return user || null;
    } catch (error) {
        console.error(`Error finding user with username ${username}:`, error);
        throw new Error("Failed to retrieve user by username");
    }
};

const updateAvatar = async (id, avatar) => {
    try {
        const updateData = {
            avatar,
            updated_at: new Date(),
        };

        const updatedUser = await User.update(updateData, {
            where: { id },
            individualHooks: true,
        });

        return updatedUser;
    } catch (error) {
        console.error("Error updating avatar:", error);
        throw new Error("Failed to update avatar");
    }
};

const changePassword = async (id, currentPassword, newPassword) => {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error("Current password is incorrect");
        }

        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        await user.save();

        return { message: "Password changed successfully" };
    } catch (error) {
        console.error("Error changing password:", error);
        throw new Error("Failed to change password");
    }
};

const registerFaceRecognition = async (id, faceDescriptor) => {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }

        // Store face descriptor (could be an array or stringified JSON)
        // Ensure that in your User model, faceDescriptor is a column that can store the data type you pass.
        user.faceDescriptor = Array.isArray(faceDescriptor)
            ? JSON.stringify(faceDescriptor)
            : faceDescriptor;
        user.updated_at = new Date();
        await user.save();

        return { message: "Face recognition data registered successfully" };
    } catch (error) {
        console.error("Error registering face recognition:", error);
        throw new Error("Failed to register face recognition");
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser,
    getUserByUsername,
    updateAvatar,
    changePassword,
    registerFaceRecognition
};
