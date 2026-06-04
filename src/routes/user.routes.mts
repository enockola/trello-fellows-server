import { Router } from "express";
import userService from "../services/user.services.mts";
import { sanitize } from "../services/utils.mts";
import authorize from "../middleware/authorize.mts";


const router: Router = Router();

router.post('/login', async (req, res, next) => {
    // get the email and password from the body of the request
    const { email, password } = req.body;
  // sanitize them
    const sanitizedEmail = sanitize(email);
    const sanitizedPassword = sanitize(password);
  // call the service function, pass in the email and password.
  // the service function should return a valid user and token  or null for either
    const { user, token } = await loginUser(sanitizedEmail, sanitizedPassword);
    // forward a 401 error if either is null
    if (!user || !token) {
        return res.status(401).json({ message: "Invalid email or password" });
     }
    // if both values exist, Send back the token and some user info in the response 
    // { token, user: { _id: user._id, email: user.email, name: user.name } }
    res.json({ token, user: { _id: user._id, email: user.email, name: user.name } });   
});