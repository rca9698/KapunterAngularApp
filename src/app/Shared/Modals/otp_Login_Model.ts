/**
 * SECURITY: the API never returns the OTP (or provider secrets) to the client.
 * Only non-sensitive routing info is available here.
 */
export interface otp_Login_Model{
    message: string,
    mobileNumber: string,
    role: string
}
