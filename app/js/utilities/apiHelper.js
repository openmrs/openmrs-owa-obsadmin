import * as request from 'superagent';

/**
 * ApiCall - The base for all API call
 * @param {object} data
 * @param {string} type
 * @param {string} url
 * @returns {object}
 */
export default function apiCall(data, type, url) {
  const contextPath = location.href.split('/')[3];
  const BASE_URL = `/${contextPath}/ws/rest/v1/${url}`;
  return new Promise((resolve, reject) => {
    request[type](BASE_URL)
      .send(data)
      .set('Content-Type','application/json')
      .end((err, res) => {
        if (res) {
          return resolve(res.body);
        }
        return reject(err);
      });
  });
}
