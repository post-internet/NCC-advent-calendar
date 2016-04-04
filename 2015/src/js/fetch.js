import 'whatwg-fetch';
import fetchJsonp from 'fetch-jsonp';

export default function fetch(url, opts) {
  if (!opts || !opts.jsonp) {
    return window.fetch.apply(window, arguments);
  } else {
    return fetchJsonp.apply(window, arguments);
  }
}
