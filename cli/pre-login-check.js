import confirmLoginWithSavedDetails from "../prompts/login-with-config.js";
import promptUserForLogin from "../prompts/user-login.js";

export default function preLoginCheck(config) {
    if (config.username && config.password && config.configCompleted) {
        confirmLoginWithSavedDetails(config);
    } else {
        promptUserForLogin();
    }
}