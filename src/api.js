import axios from 'axios';



axios.defaults.baseURL="http://localhost:8080";

export const requestverify = params => { return axios.post(`/faceverify`, params).then(res => res.data); };
export const registerFace = params => { return axios.post(`/registerFace`, params).then(res => res.data); };
export const recognizeOCR = params => { return axios.post(`/ocrrecognition`, params).then(res => res.data); };
