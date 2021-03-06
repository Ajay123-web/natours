import axios from 'axios';
import showAlert from './alert.js';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    if (res.data.status === 'success') {
      //showAlert('success', 'Logged in Successfully!');
      alert('Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    //showAlert('error', err.response.data.message);
    alert('Error logging in, Try again!');
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });

    if (res.data.status === 'success') {
      location.reload(true); //this is necessary to reload from server instead of from browser cache
    }
  } catch (err) {
    console.log(err.response);
    alert('Error logging out, Try again!');
  }
};
