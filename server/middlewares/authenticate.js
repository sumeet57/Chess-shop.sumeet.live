import {
  generateToken,
  tokenOptions,
  verifyToken,
} from "../utils/token.utils.js";

export const authenticate = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = req.cookies.accessToken;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: "Access token missing" });
    } else if (!accessToken && refreshToken) {
      const userData = verifyToken(refreshToken);

      if (!userData) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
      const token = generateToken(userData.id);
      const tokens = {
        accessToken: token.accessToken,
      };
      res.cookie("accessToken", tokens.accessToken, tokenOptions);
      req.userId = userData.id;
    } else {
      const userData = verifyToken(accessToken);
      if (!userData) {
        return res.status(403).json({ message: "Invalid access token" });
      }
      req.userId = userData.id;
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
