import axios from 'axios';
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatePassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });
    if (res.data.status === 'success') {
      alert(`${type.toUpperCase()} updated Successfully`);
      window.setTimeout(location.reload(), 5000);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};
