import crypto from 'crypto';
export const getHashedEmail = (email: string, salt?: string) => {
    //salt usually is user's id.
    return crypto.createHash('sha1').update(`${email}${salt}`).digest('base64');
}