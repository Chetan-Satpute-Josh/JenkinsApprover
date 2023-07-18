import {JENKINS_USER, JENKINS_USER_APIKEY} from './constant.js';
import {toBase64} from './helper.js';

const headers = new Headers();
headers.set(
  'Authorization',
  `Basic ${toBase64(JENKINS_USER + ':' + JENKINS_USER_APIKEY)}`,
);
headers.set('Content-Type', 'application/json');

export async function getnextPendingInputAction(project, build) {
  let response = await fetch(
    `https://jenkins.joshsoftware.com/job/${project}/${build}/wfapi/nextPendingInputAction`,
    {
      method: 'GET',
      headers: headers,
    },
  );

  if (response.ok === false) {
    throw new Error();
  }

  const data = await response.json();
  return data;
}

export async function proceedPendingInput(project, build, inputId, token) {
  const encodedJsonParameter = encodeURIComponent(
    JSON.stringify({
      parameter: [{name: 'approvalToken', value: token}],
    }),
  );

  const response = await fetch(
    `https://jenkins.joshsoftware.com/job/${project}/${build}/wfapi/inputSubmit?inputId=${inputId}&json=${encodedJsonParameter}`,
    {
      method: 'POST',
      headers: headers,
    },
  );

  if (response.ok === false) {
    throw new Error();
  }
}

export async function abortPendingInput(project, build, inputId) {
  const response = await fetch(
    `https://jenkins.joshsoftware.com/job/${project}/${build}/input/${inputId}/abort`,
    {
      method: 'POST',
      headers: headers,
    },
  );

  if (response.ok === false) {
    throw new Error();
  }
}
