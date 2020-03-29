import axios from 'axios';



axios.defaults.baseURL="http://localhost:8886";

export const requestverify = params => { return axios.post(`/api/users/faceverify`, params).then(res => res.data); };
export const registerFace = params => { return axios.post(`/api/users/registerFace`, params).then(res => res.data); };
export const recognizeOCR = params => { return axios.post(`/api/users/ocrrecognition`, params).then(res => res.data); };
